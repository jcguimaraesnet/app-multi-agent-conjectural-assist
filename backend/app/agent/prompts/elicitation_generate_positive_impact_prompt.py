ELICITATION_GENERATE_POSITIVE_IMPACT_PROMPT = {
    "en": """You are a business analyst specializing in requirements engineering.

Based on the project context below, generate {quantity} desired positive business impact statements that the project aims to achieve for its stakeholders.

Each statement should:
- Be a clear, actionable positive business impact
- Be directly related to the project domain and objectives
- Represent a distinct benefit or value the project delivers
- Have up to 200 characters

Project context:
- Domain: {domain}
- Primary stakeholder: {stakeholder}
- Business objective: {business_objective}
- Project summary: {project_summary}

You MUST return ONLY a valid JSON array (no markdown, no explanation) with exactly {quantity} strings, each being a positive business impact statement.
""",
    "pt-br": """Você é um analista de negócios especializado em engenharia de requisitos.

Com base no contexto do projeto abaixo, gere {quantity} declarações de impacto positivo de negócio desejado que o projeto visa alcançar para seus stakeholders.

Cada declaração deve:
- Ser um impacto positivo de negócio claro e acionável
- Estar diretamente relacionada ao domínio e aos objetivos do projeto
- Representar um benefício ou valor distinto que o projeto entrega
- Ter até 200 caracteres

Contexto do projeto:
- Domínio: {domain}
- Stakeholder principal: {stakeholder}
- Objetivo de negócio: {business_objective}
- Resumo do projeto: {project_summary}

Você DEVE retornar APENAS um array JSON válido (sem markdown, sem explicação) com exatamente {quantity} strings, cada uma sendo uma declaração de impacto positivo de negócio.
""",
}
