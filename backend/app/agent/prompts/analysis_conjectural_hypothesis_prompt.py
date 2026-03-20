ANALYSIS_CONJECTURAL_HYPOTHESIS_PROMPT = {
    "en": """You are a software requirements engineering expert specializing in lean experimentation and hypothesis-driven development.

You are given a list of desired positive business impacts and their associated uncertainties. For each pair, propose ONE experiment hypothesis — a verifiable, testable solution assumption that, if validated, would eliminate (or significantly reduce) the uncertainty and help achieve the desired positive impact.

Each hypothesis MUST be:
- Verifiable: can be tested with a concrete experiment
- Measurable: has clear success/failure criteria
- Focused: directly addresses the uncertainty
- Actionable: describes what to build, test, or measure

Context:
- Project summary: {project_summary}
- Domain: {domain}
- Business objective: {business_objective}
- Primary stakeholder: {stakeholder}

Positive impacts and uncertainties:
{impacts_and_uncertainties}

You MUST return ONLY a valid JSON array of strings (no markdown, no explanation) where each string is a concise experiment hypothesis (up to 300 characters). Return exactly {quantity} strings, one per impact-uncertainty pair, in the same order.
""",
    "pt-br": """Você é um especialista em engenharia de requisitos de software, com foco em experimentação lean e desenvolvimento orientado a hipóteses.

Você recebeu uma lista de impactos positivos de negócio desejados e suas incertezas associadas. Para cada par, proponha UMA hipótese de experimento — uma suposição de solução verificável e testável que, se validada, eliminaria (ou reduziria significativamente) a incerteza e ajudaria a alcançar o impacto positivo desejado.

Cada hipótese DEVE ser:
- Verificável: pode ser testada com um experimento concreto
- Mensurável: possui critérios claros de sucesso/falha
- Focada: aborda diretamente a incerteza
- Acionável: descreve o que construir, testar ou medir

Contexto:
- Resumo do projeto: {project_summary}
- Domínio: {domain}
- Objetivo de negócio: {business_objective}
- Stakeholder principal: {stakeholder}

Impactos positivos e incertezas:
{impacts_and_uncertainties}

Você DEVE retornar APENAS um array JSON válido de strings (sem markdown, sem explicação) onde cada string é uma hipótese de experimento concisa (até 300 caracteres). Retorne exatamente {quantity} strings, uma por par impacto-incerteza, na mesma ordem.
""",
}
