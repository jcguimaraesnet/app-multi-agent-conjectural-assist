SPECIFICATION_CONJECTURAL_SPECIFICATION_PROMPT = {
    "en": """You are an expert in software requirements specification with uncertainties.

This app's main goal is to generate a type of software requirements specification with uncertainties,
here called a "conjectural requirement."

## Information Sources

**Project Summary:**
{project_summary}

**Business Domain:** {domain}

**Primary Stakeholder:** {stakeholder}

**Business Objective:** {business_objective}

## Positive Business Impact, Uncertainty, and Solution Hypothesis

Generate exactly ONE conjectural requirement specification for the following input:

- **Positive Impact:** {positive_impact}
- **Uncertainty:** {uncertainty}
- **Solution Hypothesis:** {supposition_solution}

## Instruction

Generate exactly ONE conjectural requirement specification following the FERC writing format and the QESS framework described below.

The FERC's "desired behavior" should address the positive impact, the "positive impact" should relate to the business objective, and the "uncertainties" MUST include the associated uncertainty identified above (you may add additional uncertainties if relevant).

The QESS's "solution assumption" should be based on the proposed hypothesis, and the experiment should aim to resolve the associated uncertainty.

---

## Template for Conjectural Requirement Specification

**Writing Format for Conjectural Requirements (FERC):**
**It is expected that the software system has** [desired behavior]
**So that** [need or positive impact of the desired attribute]
**However, we do not know:**
- **Uncertainty:** [uncertainty associated with this requirement — one or many]
- **Uncertainty:** [uncertainty associated with this requirement — one or many]

**Solution Assumption Experimentation Framework (QESS):**
**We expect that** [description of the solution assumption]
**Will result in updating the uncertainties about** [only one of the uncertainties that will be evaluated]
**As a result of** [description of the observation and analysis that will result in updating the uncertainties]

---

## Examples

**Example 1:**
FERC:
**It is expected that the software system has** low-cost equipment
**So that** the product can be sold at a lower price than other products currently on the market with similar functions.
**However, we do not know:**
- **Uncertainty:** which equipment (sensors, wearables, cables, connectors, and display) are functional and have the lowest cost.
QESS:
**We expect that** using a finger clip to obtain data on oxygenation, temperature, and heart rate of a patient for display on a screen controlled by a low-cost NodeMCU processor
**Will result in updating the uncertainties about** the low-cost device configuration that will be used for building the software system
**As a result of** observation of the operation of the finger clip oximeter and the data generated.

**Example 2:**
FERC:
**It is expected that the software system has** easy-to-assemble equipment
**So that** the equipment can be assembled quickly by people without electronics knowledge.
**However, we do not know:**
- **Uncertainty:** which cable and connector models facilitate assembly.
- **Uncertainty:** the acceptable assembly time.
QESS:
**We expect that** using a finger clip to obtain data on oxygenation, temperature, and heart rate of a patient for display on a screen controlled by a low-cost NodeMCU processor through a single data cable
**Will result in updating the uncertainties about** the ease of assembly of the low-cost device that will be used for building the software system
**As a result of** observation of the operation of the finger clip oximeter with a single data cable and the data generated.

**Example 3:**
FERC:
**It is expected that the software system has** reliability
**So that** signal measurement is performed without interference from external lighting.
**However, we do not know:**
- **Uncertainty:** which type of device allows measurement without harmful interference.
QESS:
**We expect that** using an elastic wristband with two sensor compartments to obtain data on oxygenation, temperature, and heart rate of a patient for display on a screen controlled by a low-cost NodeMCU processor
**Will result in updating the uncertainties about** the reliability of vital signs measurement (measurement without external interference) of the low-cost device that will be used for building the software system
**As a result of** observation of the operation of the oximeter with the elastic wristband and the data generated.

**Example 4:**
FERC:
**It is expected that the software system has** stability
**So that** signal measurement remains consistent in the same patient over a long period, considering body movements.
**However, we do not know:**
- **Uncertainty:** which sensor models guarantee measurement stability over long periods, considering body movements.
QESS:
**We expect that** using a rigid half-moon shaped wristband with two sensor compartments to obtain data on oxygenation, temperature, and heart rate of a patient for display on a screen controlled by a low-cost NodeMCU processor through a single digital data cable with RJ11 connector
**Will result in updating the uncertainties about** the stability of the sensors on the patient's arm of the low-cost device that will be used for building the software system
**As a result of** observation of the operation of the oximeter with the rigid wristband and the data generated.

---

You MUST return ONLY a valid JSON object (no markdown, no explanation) with:
- "ferc": an object with:
  - "desired_behavior": the [desired behavior] part of the FERC (string)
  - "positive_impact": the [need or positive impact] part of the FERC (string)
  - "uncertainties": list of uncertainty strings (array of strings)
- "qess": an object with:
  - "solution_assumption": the [description of the solution assumption] (string)
  - "uncertainty_evaluated": the [one uncertainty that will be evaluated] (string)
  - "observation_analysis": the [observation and analysis description] (string)
""",
    "pt-br": """Você é um especialista em especificação de requisitos de software com incertezas.

O objetivo principal deste aplicativo é gerar um tipo de especificação de requisitos de software com incertezas,
aqui chamado de "requisito conjectural".

## Fontes de Informação

**Resumo do Projeto:**
{project_summary}

**Domínio de Negócio:** {domain}

**Stakeholder Principal:** {stakeholder}

**Objetivo de Negócio:** {business_objective}

## Impacto Positivo de Negócio, Incerteza e Hipótese de Solução

Gere exatamente UM requisito conjectural para a seguinte entrada:

- **Impacto Positivo:** {positive_impact}
- **Incerteza:** {uncertainty}
- **Hipótese de Solução:** {supposition_solution}

## Instrução

Gere exatamente UM requisito conjectural seguindo o formato de escrita FERC e o framework QESS descritos abaixo.

O "comportamento desejado" do FERC deve abordar o impacto positivo, o "impacto positivo" deve se relacionar ao objetivo de negócio, e as "incertezas" DEVEM incluir a incerteza associada identificada acima (você pode adicionar incertezas adicionais se relevante).

A "suposição de solução" do QESS deve ser baseada na hipótese proposta, e o experimento deve visar resolver a incerteza associada.

---

## Modelo para Especificação de Requisito Conjectural

**Formato de Escrita para Requisitos Conjecturais (FERC):**
**É esperado que o sistema de software tenha** [comportamento desejado]
**De modo que** [necessidade ou impacto positivo do atributo desejado]
**Porém, não sabemos:**
- **Incerteza:** [incerteza associada a este requisito — uma ou várias]
- **Incerteza:** [incerteza associada a este requisito — uma ou várias]

**Framework de Experimentação de Suposição de Solução (QESS):**
**Esperamos que** [descrição da suposição de solução]
**Resulte na atualização das incertezas sobre** [apenas uma das incertezas que será avaliada]
**Como resultado de** [descrição da observação e análise que resultará na atualização das incertezas]

---

## Exemplos

**Exemplo 1:**
FERC:
**É esperado que o sistema de software tenha** equipamento de baixo custo
**De modo que** o produto possa ser vendido a um preço menor do que outros produtos atualmente no mercado com funções similares.
**Porém, não sabemos:**
- **Incerteza:** quais equipamentos (sensores, wearables, cabos, conectores e display) são funcionais e possuem o menor custo.
QESS:
**Esperamos que** o uso de um clipe de dedo para obter dados de oxigenação, temperatura e frequência cardíaca de um paciente para exibição em uma tela controlada por um processador NodeMCU de baixo custo
**Resulte na atualização das incertezas sobre** a configuração de dispositivo de baixo custo que será usada para construção do sistema de software
**Como resultado de** observação do funcionamento do oxímetro de clipe de dedo e dos dados gerados.

**Exemplo 2:**
FERC:
**É esperado que o sistema de software tenha** equipamento de fácil montagem
**De modo que** o equipamento possa ser montado rapidamente por pessoas sem conhecimento em eletrônica.
**Porém, não sabemos:**
- **Incerteza:** quais modelos de cabo e conector facilitam a montagem.
- **Incerteza:** o tempo aceitável de montagem.
QESS:
**Esperamos que** o uso de um clipe de dedo para obter dados de oxigenação, temperatura e frequência cardíaca de um paciente para exibição em uma tela controlada por um processador NodeMCU de baixo custo através de um único cabo de dados
**Resulte na atualização das incertezas sobre** a facilidade de montagem do dispositivo de baixo custo que será usado para construção do sistema de software
**Como resultado de** observação do funcionamento do oxímetro de clipe de dedo com um único cabo de dados e dos dados gerados.

**Exemplo 3:**
FERC:
**É esperado que o sistema de software tenha** confiabilidade
**De modo que** a medição de sinais seja realizada sem interferência da iluminação externa.
**Porém, não sabemos:**
- **Incerteza:** qual tipo de dispositivo permite medição sem interferência prejudicial.
QESS:
**Esperamos que** o uso de uma pulseira elástica com dois compartimentos de sensores para obter dados de oxigenação, temperatura e frequência cardíaca de um paciente para exibição em uma tela controlada por um processador NodeMCU de baixo custo
**Resulte na atualização das incertezas sobre** a confiabilidade da medição de sinais vitais (medição sem interferência externa) do dispositivo de baixo custo que será usado para construção do sistema de software
**Como resultado de** observação do funcionamento do oxímetro com a pulseira elástica e dos dados gerados.

**Exemplo 4:**
FERC:
**É esperado que o sistema de software tenha** estabilidade
**De modo que** a medição de sinais permaneça consistente no mesmo paciente por um longo período, considerando movimentos corporais.
**Porém, não sabemos:**
- **Incerteza:** quais modelos de sensores garantem estabilidade de medição por longos períodos, considerando movimentos corporais.
QESS:
**Esperamos que** o uso de uma pulseira rígida em formato de meia-lua com dois compartimentos de sensores para obter dados de oxigenação, temperatura e frequência cardíaca de um paciente para exibição em uma tela controlada por um processador NodeMCU de baixo custo através de um único cabo de dados digital com conector RJ11
**Resulte na atualização das incertezas sobre** a estabilidade dos sensores no braço do paciente do dispositivo de baixo custo que será usado para construção do sistema de software
**Como resultado de** observação do funcionamento do oxímetro com a pulseira rígida e dos dados gerados.

---

Você DEVE retornar APENAS um objeto JSON válido (sem markdown, sem explicação) com:
- "ferc": um objeto com:
  - "desired_behavior": a parte [comportamento desejado] do FERC (string)
  - "positive_impact": a parte [necessidade ou impacto positivo] do FERC (string)
  - "uncertainties": lista de strings de incertezas (array de strings)
- "qess": um objeto com:
  - "solution_assumption": a [descrição da suposição de solução] (string)
  - "uncertainty_evaluated": a [uma incerteza que será avaliada] (string)
  - "observation_analysis": a [descrição da observação e análise] (string)
""",
}
