ELICITATION_GENERATE_POSITIVE_IMPACT_PROMPT = {
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

IMPORTANTE: Sua resposta DEVE estar no idioma: {language}.
""",
}
