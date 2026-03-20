ANALYSIS_IMPACT_UNCERTAINTY_DETECTION_PROMPT = {
    "en": """You are a software requirements engineering expert specializing in risk and uncertainty analysis.

For each positive business impact statement listed below, identify exactly ONE key uncertainty — an aspect that is unclear, underspecified, or could prevent the desired impact from being realized. Focus on gaps in knowledge, vague scope, missing constraints, untested assumptions, or risks that need validation.

Context:
- Project summary: {project_summary}
- Domain: {domain}
- Business objective: {business_objective}
- Primary stakeholder: {stakeholder}

Positive business impacts:
{positive_impacts}

You MUST return ONLY a valid JSON array of strings (no markdown, no explanation) where each string is a concise description of the key uncertainty (up to 200 characters). Return exactly {quantity} strings, one per positive impact, in the same order.
""",
    "pt-br": """Você é um especialista em engenharia de requisitos de software, com foco em análise de riscos e incertezas.

Para cada declaração de impacto positivo de negócio listada abaixo, identifique exatamente UMA incerteza-chave — um aspecto que é pouco claro, subespecificado ou que pode impedir que o impacto desejado seja alcançado. Foque em lacunas de conhecimento, escopo vago, restrições ausentes, suposições não testadas ou riscos que precisam de validação.

Contexto:
- Resumo do projeto: {project_summary}
- Domínio: {domain}
- Objetivo de negócio: {business_objective}
- Stakeholder principal: {stakeholder}

Impactos positivos de negócio:
{positive_impacts}

Você DEVE retornar APENAS um array JSON válido de strings (sem markdown, sem explicação) onde cada string é uma descrição concisa da incerteza-chave (até 200 caracteres). Retorne exatamente {quantity} strings, uma por impacto positivo, na mesma ordem.
""",
}
