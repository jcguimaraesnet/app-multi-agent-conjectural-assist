ELICITATION_GENERATE_POSITIVE_IMPACT_PROMPT = {
    "en": """You are a requirements engineer specializing in elicitation.

# Instruction

Based on the guidelines and project context below,
generate {quantity} positive business impact statements that could be desired by the project's stakeholders.

## Guidelines on how to elaborate positive business impact statements
- Must be short, concise, and unique, avoiding conjunctions like "and" or "or" or "," that indicate multiple impacts in a single statement
- Must add specificity and clarity using the project context
- Must represent a benefit to be achieved in the business, without indicating the solution to achieve it (i.e., it should focus on the "what" and not the "how").
- Must not contain terms like "through", "by means of", "with the use of", "utilizing", "using", "by implementing", "by adopting", "by improving" or other terms that indicate a solution or means to achieve the positive impact. The focus should be exclusively on the desired positive impact, without mentioning how it will be achieved.

## Project context:
- Domain: {domain}
- Primary stakeholder: {stakeholder}
- Business objective: {business_objective}
- Project summary: {project_summary}

## Exclusion list
The following positive business impact statements have already been defined for this project. Do NOT generate statements that are similar or semantically equivalent to any of these. Generate only NEW and DIFFERENT impacts.
{exclusion_list}

## About the response format
- You MUST return ONLY a valid JSON array (no markdown, no explanation) with exactly {quantity} strings, each being a positive business impact statement.
""",
    "pt-br": """Você é um engenheiro de requisitos especializado em elicitação.

# Instrução

Com base nas diretrizes e no contexto do projeto abaixo, 
gere {quantity} declarações de impacto positivo de negócio que poderiam ser desejados pelos stakeholders do projeto.

## Diretrizes sobre como elaborar declarações de impacto positivo de negócio
- Deve ser curta, concisa e única, evitando conjunções como "e" ou "ou" ou "," que indiquem múltiplos impactos em uma única declaração
- Deve adicionar especificidade e clareza usando o contexto do projeto
- Deve representar um benefício a ser alcançado no negócio, sem indicar a solução para alcançá-lo (ou seja, deve focar no "o quê" e não no "como").
- Não deve conter termos como "através de", "por meio de", "com o uso de", "utilizando", "usando", "ao implementar", "ao adotar", "ao melhorar" ou outros termos que indiquem uma solução ou meio para alcançar o impacto positivo. O foco deve ser exclusivamente no impacto positivo desejado, sem mencionar como ele será alcançado.

## Contexto do projeto:
- Domínio: {domain}
- Stakeholder principal: {stakeholder}
- Objetivo de negócio: {business_objective}
- Resumo do projeto: {project_summary}

## Lista de exclusão
As seguintes declarações de impacto positivo de negócio já foram definidas para este projeto. NÃO gere declarações similares ou semanticamente equivalentes a nenhuma delas. Gere apenas impactos NOVOS e DIFERENTES.
{exclusion_list}

## Sobre o formato de resposta
- Você DEVE retornar APENAS um array JSON válido (sem markdown, sem explicação) com exatamente {quantity} strings, cada uma sendo uma declaração de impacto positivo de negócio.
""",
}
