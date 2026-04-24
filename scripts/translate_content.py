#!/usr/bin/env python3
import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

import requests

REPO = Path(__file__).resolve().parent.parent
CONTENT_DIR = REPO / "content"
DEFAULT_SOURCE_DIR = CONTENT_DIR / "zh"
DEFAULT_TARGET_DIR = CONTENT_DIR / "en"

OPENAI_DEFAULT_MODEL = "gpt-4.1-mini"
OPENROUTER_DEFAULT_MODEL = "openai/gpt-4.1-mini"
ANTHROPIC_DEFAULT_MODEL = "claude-3-5-haiku-latest"

JSON_SYSTEM_PROMPT = """You are translating website content from Simplified Chinese to English.
Return valid JSON only.

Rules:
- Preserve the exact JSON structure, key names, nesting, arrays, ordering, booleans, nulls, and numbers.
- Translate only natural-language string values into clear, natural English.
- Keep URLs, file paths, emails, BVIDs, product names, proper nouns, code snippets, and technical identifiers unchanged unless the surrounding sentence needs light grammatical adjustment.
- Preserve tone as much as possible. The tone should stay calm, clean, readable, and low-drama.
- Do not add or remove keys.
- Do not wrap the JSON in markdown fences.
"""

HTML_SYSTEM_PROMPT = """You are translating an HTML fragment from Simplified Chinese to English.
Return HTML only.

Rules:
- Preserve every HTML tag, attribute, class, id, inline style, and element order.
- Translate visible natural-language text into clear, natural English.
- Keep URLs, emails, file paths, code snippets, and technical identifiers unchanged.
- Preserve the tone: calm, clean, readable, low-drama.
- Do not add markdown fences.
- Do not add explanations.
"""


class TranslationError(RuntimeError):
    pass


class BaseClient:
    def translate_json(self, source_text: str) -> str:
        raise NotImplementedError

    def translate_html(self, source_text: str) -> str:
        raise NotImplementedError


class OpenAICompatibleClient(BaseClient):
    def __init__(self, *, api_key: str, base_url: str, model: str, extra_headers: dict[str, str] | None = None):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.extra_headers = extra_headers or {}

    def _chat(self, system_prompt: str, user_prompt: str) -> str:
        url = f"{self.base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            **self.extra_headers,
        }
        payload = {
            "model": self.model,
            "temperature": 0.2,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }
        response = requests.post(url, headers=headers, json=payload, timeout=180)
        if response.status_code >= 400:
            raise TranslationError(f"Translation API error {response.status_code}: {response.text[:500]}")
        data = response.json()
        try:
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError) as exc:
            raise TranslationError(f"Unexpected OpenAI-compatible response: {data}") from exc
        if isinstance(content, list):
            text_parts = []
            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    text_parts.append(item.get("text", ""))
            content = "".join(text_parts)
        return str(content).strip()

    def translate_json(self, source_text: str) -> str:
        prompt = f"Translate this JSON from Chinese to English according to the rules above.\n\n{source_text}"
        return self._chat(JSON_SYSTEM_PROMPT, prompt)

    def translate_html(self, source_text: str) -> str:
        prompt = f"Translate this HTML fragment from Chinese to English according to the rules above.\n\n{source_text}"
        return self._chat(HTML_SYSTEM_PROMPT, prompt)


class AnthropicClient(BaseClient):
    def __init__(self, *, api_key: str, model: str):
        self.api_key = api_key
        self.model = model

    def _message(self, system_prompt: str, user_prompt: str) -> str:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": self.model,
            "max_tokens": 8192,
            "temperature": 0.2,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_prompt},
            ],
        }
        response = requests.post(url, headers=headers, json=payload, timeout=180)
        if response.status_code >= 400:
            raise TranslationError(f"Anthropic API error {response.status_code}: {response.text[:500]}")
        data = response.json()
        try:
            return "".join(block.get("text", "") for block in data["content"] if block.get("type") == "text").strip()
        except (KeyError, TypeError) as exc:
            raise TranslationError(f"Unexpected Anthropic response: {data}") from exc

    def translate_json(self, source_text: str) -> str:
        prompt = f"Translate this JSON from Chinese to English according to the rules above.\n\n{source_text}"
        return self._message(JSON_SYSTEM_PROMPT, prompt)

    def translate_html(self, source_text: str) -> str:
        prompt = f"Translate this HTML fragment from Chinese to English according to the rules above.\n\n{source_text}"
        return self._message(HTML_SYSTEM_PROMPT, prompt)


def strip_code_fences(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("```") and stripped.endswith("```"):
        lines = stripped.splitlines()
        if len(lines) >= 3:
            return "\n".join(lines[1:-1]).strip()
    return stripped


def validate_json_structure(source: Any, translated: Any, path: str = "$") -> None:
    if type(source) is not type(translated):
        raise TranslationError(f"Type mismatch at {path}: {type(source).__name__} != {type(translated).__name__}")

    if isinstance(source, dict):
        source_keys = list(source.keys())
        translated_keys = list(translated.keys())
        if source_keys != translated_keys:
            raise TranslationError(f"Key mismatch at {path}: {source_keys} != {translated_keys}")
        for key in source_keys:
            validate_json_structure(source[key], translated[key], f"{path}.{key}")
        return

    if isinstance(source, list):
        if len(source) != len(translated):
            raise TranslationError(f"List length mismatch at {path}: {len(source)} != {len(translated)}")
        for index, (src_item, dst_item) in enumerate(zip(source, translated)):
            validate_json_structure(src_item, dst_item, f"{path}[{index}]")
        return

    if isinstance(source, (int, float, bool)) or source is None:
        if source != translated:
            raise TranslationError(f"Literal mismatch at {path}: {source!r} != {translated!r}")


def build_client(provider: str, model_override: str | None) -> BaseClient:
    if provider == "auto":
        if os.environ.get("OPENAI_API_KEY"):
            provider = "openai"
        elif os.environ.get("OPENROUTER_API_KEY"):
            provider = "openrouter"
        elif os.environ.get("ANTHROPIC_API_KEY"):
            provider = "anthropic"
        else:
            raise TranslationError("No supported translation API credentials found in environment.")

    if provider == "openai":
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise TranslationError("OPENAI_API_KEY is missing.")
        base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        return OpenAICompatibleClient(api_key=api_key, base_url=base_url, model=model_override or OPENAI_DEFAULT_MODEL)

    if provider == "openrouter":
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            raise TranslationError("OPENROUTER_API_KEY is missing.")
        base_url = os.environ.get("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        return OpenAICompatibleClient(
            api_key=api_key,
            base_url=base_url,
            model=model_override or OPENROUTER_DEFAULT_MODEL,
            extra_headers={
                "HTTP-Referer": "https://rebone0522.com",
                "X-Title": "ReBone Website Translation",
            },
        )

    if provider == "anthropic":
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise TranslationError("ANTHROPIC_API_KEY is missing.")
        return AnthropicClient(api_key=api_key, model=model_override or ANTHROPIC_DEFAULT_MODEL)

    raise TranslationError(f"Unsupported provider: {provider}")


def resolve_source_files(args: argparse.Namespace) -> list[Path]:
    source_dir = Path(args.source_dir)
    if args.files:
        result = []
        for name in args.files:
            path = source_dir / name
            if not path.exists():
                raise TranslationError(f"Source file does not exist: {path}")
            result.append(path)
        return result

    return sorted(path for path in source_dir.iterdir() if path.is_file() and path.suffix in {".json", ".html"})


def translate_json_file(client: BaseClient, source_path: Path, target_path: Path) -> None:
    source_text = source_path.read_text(encoding="utf-8")
    source_obj = json.loads(source_text)
    raw = strip_code_fences(client.translate_json(source_text))
    translated_obj = json.loads(raw)
    validate_json_structure(source_obj, translated_obj)
    target_path.write_text(json.dumps(translated_obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def translate_html_file(client: BaseClient, source_path: Path, target_path: Path) -> None:
    source_text = source_path.read_text(encoding="utf-8")
    raw = strip_code_fences(client.translate_html(source_text)).strip()
    if not raw:
        raise TranslationError(f"Empty HTML translation for {source_path.name}")
    target_path.write_text(raw + "\n", encoding="utf-8")


def translate_file(client: BaseClient, source_path: Path, target_dir: Path, *, force: bool, dry_run: bool) -> str:
    target_path = target_dir / source_path.name
    if target_path.exists() and not force:
        return f"SKIP {source_path.name} (target exists)"

    if dry_run:
        return f"DRYRUN {source_path.name} -> {target_path.relative_to(REPO)}"

    target_dir.mkdir(parents=True, exist_ok=True)
    start = time.time()
    if source_path.suffix == ".json":
        translate_json_file(client, source_path, target_path)
    elif source_path.suffix == ".html":
        translate_html_file(client, source_path, target_path)
    else:
        raise TranslationError(f"Unsupported file type: {source_path.name}")
    duration = time.time() - start
    return f"DONE {source_path.name} -> {target_path.relative_to(REPO)} ({duration:.1f}s)"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate English content drafts from content/zh.")
    parser.add_argument("files", nargs="*", help="Specific file names under content/zh to translate. Defaults to all .json/.html files.")
    parser.add_argument("--source-dir", default=str(DEFAULT_SOURCE_DIR), help="Source directory. Default: content/zh")
    parser.add_argument("--target-dir", default=str(DEFAULT_TARGET_DIR), help="Target directory. Default: content/en")
    parser.add_argument("--provider", default="auto", choices=["auto", "openai", "openrouter", "anthropic"], help="Translation provider")
    parser.add_argument("--model", default=None, help="Override model name")
    parser.add_argument("--force", action="store_true", help="Overwrite existing target files")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be translated without writing files")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        source_files = resolve_source_files(args)
        if not source_files:
            print("No source files found.")
            return 0

        target_dir = Path(args.target_dir)
        print(f"Translating {len(source_files)} file(s) from {Path(args.source_dir).relative_to(REPO)} to {target_dir.relative_to(REPO)}")

        if args.dry_run:
            for path in source_files:
                print(translate_file(None, path, target_dir, force=args.force, dry_run=True))
            return 0

        client = build_client(args.provider, args.model)
        for path in source_files:
            print(translate_file(client, path, target_dir, force=args.force, dry_run=False))
        return 0
    except TranslationError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
