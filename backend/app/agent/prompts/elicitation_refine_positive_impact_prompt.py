ELICITATION_REFINE_POSITIVE_IMPACT_PROMPT = {
    "en": """You are a business analyst specializing in requirements engineering.

You are given a set of brief descriptions of desired positive business impacts provided by a stakeholder, along with the project context.

For each brief description, produce a refined, elaborated sentence that:
- Preserves the original intent of the brief description
- Adds specificity and clarity using the project context
- Is written as a clear, actionable positive business impact statement
- Has up to 200 characters

Project context:
- Domain: {domain}
- Primary stakeholder: {stakeholder}
- Business objective: {business_objective}
- Project summary: {project_summary}

Brief descriptions:
{brief_descriptions}

You MUST return ONLY a valid JSON array (no markdown, no explanation) with exactly {quantity} strings, one refined sentence per brief description, in the same order.
""",
    "pt-br": """Você é um analista de negócios especializado em engenharia de requisitos.

Você recebeu um conjunto de descrições breves de impactos positivos de negócio desejados, fornecidas por um stakeholder, junto com o contexto do projeto.

Para cada descrição breve, produza uma sentença refinada e elaborada que:
- Preserve a intenção original da descrição breve
- Adicione especificidade e clareza usando o contexto do projeto
- Seja escrita como uma declaração clara e acionável de impacto positivo de negócio
- Tenha até 200 caracteres

Contexto do projeto:
- Domínio: {domain}
- Stakeholder principal: {stakeholder}
- Objetivo de negócio: {business_objective}
- Resumo do projeto: {project_summary}

Descrições breves:
{brief_descriptions}

Você DEVE retornar APENAS um array JSON válido (sem markdown, sem explicação) com exatamente {quantity} strings, uma sentença refinada por descrição breve, na mesma ordem.
""",
}
