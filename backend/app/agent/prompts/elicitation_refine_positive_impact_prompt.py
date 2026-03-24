ELICITATION_REFINE_POSITIVE_IMPACT_PROMPT = {
    "pt-br": """Você é um engenheiro de requisitos especializado em elicitação.

# Instrução

Você recebeu um conjunto de descrições iniciais de impactos positivos desejados no negócio, fornecidas por um stakeholder.
Para cada descrição inicial de impacto positivo desejado no negócio, produza uma sentença refinada dessa descrição inicial para ser usada futuramente em uma especificação de requisito de software.
Considere as diretrizes e o contexto do projeto abaixo para produzir as sentenças refinadas.

## Diretrizes sobre como elaborar declarações de impacto positivo de negócio
- Deve preservar a intenção original da descrição inicial
- Deve ser curta, concisa e única, evitando conjunções como "e" ou "ou" ou "," que indiquem múltiplos impactos em uma única declaração
- Deve adicionar especificidade e clareza usando o contexto do projeto
- Deve representar um benefício ou valor distinto a ser alcançado no negócio

## Contexto do projeto:
- Domínio: {domain}
- Stakeholder principal: {stakeholder}
- Objetivo de negócio: {business_objective}
- Resumo do projeto: {project_summary}

## Descrições iniciais:
{brief_descriptions}

## Sobre o formato de resposta
Você DEVE retornar APENAS um array JSON válido (sem markdown, sem explicação) com exatamente {quantity} strings, cada uma sendo uma sentença refinada da descrição inicial, na mesma ordem.

IMPORTANTE: Sua resposta DEVE estar no idioma: {language}.
""",
}
