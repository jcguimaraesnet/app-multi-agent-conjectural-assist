"""
Prompt factory — returns the prompt template for use.

Each prompt file exports a dict[str, str] with a single "pt-br" key.
The factory returns that template regardless of the project language,
since each prompt already includes a {language} placeholder to instruct
the LLM to respond in the correct language.
"""


def get_prompt(prompts: dict[str, str], language: str) -> str:
    """Return the prompt template (always pt-br, with {language} for output locale)."""
    return prompts["pt-br"]
