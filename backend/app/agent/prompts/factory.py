"""
Prompt factory — returns the correct language version of a prompt.

Each prompt file exports a dict[str, str] keyed by language code (e.g. "en", "pt-br").
The factory resolves the best match for the project's configured language,
falling back to English ("en") when no match is found.
"""


def get_prompt(prompts: dict[str, str], language: str) -> str:
    """Return the prompt template for the given language, defaulting to English."""
    lang = language.lower()
    if lang in prompts:
        return prompts[lang]
    # Fallback: try base language (e.g. "en-us" → "en")
    base = lang.split("-")[0]
    return prompts.get(base, prompts["en"])
