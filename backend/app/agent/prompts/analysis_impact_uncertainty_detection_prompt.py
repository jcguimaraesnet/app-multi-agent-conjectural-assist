ANALYSIS_IMPACT_UNCERTAINTY_DETECTION_PROMPT = {
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

IMPORTANTE: Sua resposta DEVE estar no idioma: {language}.
""",
}
