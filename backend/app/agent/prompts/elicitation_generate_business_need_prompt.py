ELICITATION_GENERATE_BUSINESS_NEED_PROMPT = {
    "pt-br": """Você é um engenheiro de requisitos especializado em elicitação.

# Instrução

Com base nas diretrizes e no contexto do projeto abaixo,
gere {quantity} declarações de necessidade de negócio que poderiam ser desejadas pelos stakeholders do projeto.

## Diretrizes sobre como elaborar declarações de necessidade de negócio
- Deve ser curta, concisa e única, evitando conjunções como "e" ou "ou" ou "," que indiquem múltiplas necessidades em uma única declaração
- Deve adicionar especificidade e clareza usando o contexto do projeto
- Deve representar uma necessidade de negócio a ser atendida, sem indicar a solução para alcançá-la (ou seja, deve focar no "o quê" e não no "como").
- Não deve conter termos como "através de", "por meio de", "com o uso de", "utilizando", "usando", "ao implementar", "ao adotar", "ao melhorar" ou outros termos que indiquem uma solução ou meio para atender à necessidade. O foco deve ser exclusivamente na necessidade de negócio desejada, sem mencionar como ela será atendida.

## Contexto do projeto:
- Domínio: {domain}
- Stakeholder principal: {stakeholder}
- Objetivo de negócio: {business_objective}
- Resumo do projeto: {project_summary}

## Lista de exclusão
As seguintes declarações de necessidade de negócio já foram definidas para este projeto. NÃO gere declarações similares ou semanticamente equivalentes a nenhuma delas. Gere apenas necessidades NOVAS e DIFERENTES.
{exclusion_list}

## Sobre o formato de resposta
- Você DEVE retornar APENAS um array JSON válido (sem markdown, sem explicação) com exatamente {quantity} strings, cada uma sendo uma declaração de necessidade de negócio.

IMPORTANTE: Sua resposta DEVE estar no idioma: {language}.
""",
}
