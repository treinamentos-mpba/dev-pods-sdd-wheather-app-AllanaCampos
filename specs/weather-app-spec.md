# Especificação de Produto: Weather App

## Overview

O Weather App permitirá que usuários busquem cidades e consultem o clima atual e a previsão diária de cinco dias, alternando entre Celsius e Fahrenheit. A interface será em português do Brasil e deverá funcionar em dispositivos móveis. A fonte definida é Open-Meteo, sem API key.

A primeira versão será uma aplicação web responsiva. Não haverá autenticação nem persistência de dados no servidor. O objetivo desta especificação é definir o comportamento observável do produto; metas ainda não aprovadas e decisões pendentes estão identificadas como perguntas em aberto.

## Functional Requirements

- **FR-01 — Buscar cidades:** permitir que o usuário pesquise cidades pelo nome.
- **FR-02 — Selecionar cidade:** apresentar resultados suficientes para distinguir localidades homônimas e permitir selecionar a cidade desejada.
- **FR-03 — Consultar clima atual:** apresentar o clima atual da cidade selecionada.
- **FR-04 — Consultar previsão de cinco dias:** apresentar a previsão de hoje e dos quatro dias seguintes para a cidade selecionada.
- **FR-05 — Alternar unidade de temperatura:** iniciar em Celsius e permitir alternar entre Celsius e Fahrenheit.
- **FR-06 — Indicar carregamento:** informar quando uma busca ou consulta meteorológica estiver em andamento.
- **FR-07 — Informar ausência de resultados:** informar quando uma busca não retornar cidades.
- **FR-08 — Tratar falhas de consulta:** informar falhas de geocodificação ou de consulta meteorológica de forma compreensível e permitir nova tentativa.
- **FR-09 — Apresentar a interface em pt-BR:** exibir a interface e as mensagens do produto em português do Brasil.

## User Stories

- **US-01 (FR-01, FR-03, FR-06):** Como Camila, pessoa que se desloca diariamente, quero buscar minha cidade e consultar o clima atual para me preparar antes de sair.
- **US-02 (FR-04):** Como Rafael, pessoa que planeja passeios, quero consultar a previsão de hoje e dos quatro dias seguintes para escolher quando realizar uma atividade.
- **US-03 (FR-01, FR-02):** Como Joana, pessoa que consulta o tempo durante viagens, quero distinguir cidades com o mesmo nome e selecionar a correta para ver a previsão do destino certo.
- **US-04 (FR-05):** Como Joana, pessoa que consulta o tempo durante viagens, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.
- **US-05 (FR-07, FR-08):** Como Camila, pessoa que se desloca diariamente, quero receber uma explicação quando não houver resultados ou a consulta falhar e poder tentar novamente para continuar minha busca.
- **US-06 (FR-09):** Como Camila, pessoa que se desloca diariamente, quero encontrar a interface e as mensagens em português do Brasil para compreender as informações e ações disponíveis.

## Acceptance Criteria

- **AC-01 (FR-01):** **Given** que a geocodificação retorne uma cidade correspondente ao termo informado, **When** o usuário envia a busca, **Then** o termo é enviado ao serviço e a cidade correspondente aparece entre as opções exibidas.
- **AC-02 (FR-02):** **Given** resultados para cidades homônimas em regiões diferentes, **When** a lista de resultados é exibida, **Then** cada opção mostra o nome da cidade e contexto de região e país para distingui-la.
- **AC-03 (FR-02):** **Given** duas cidades homônimas na lista, **When** o usuário seleciona uma delas, **Then** o nome e os dados meteorológicos exibidos correspondem à localidade selecionada.
- **AC-04 (FR-03, provisório):** **Given** uma cidade selecionada e uma resposta válida de clima atual, **When** a consulta termina, **Then** a interface identifica a cidade e exibe sua temperatura na unidade ativa e uma descrição textual da condição meteorológica.
- **AC-05 (FR-04, provisório):** **Given** uma cidade selecionada e uma resposta válida de previsão, **When** a previsão é exibida, **Then** há exatamente cinco datas em ordem cronológica, da data local atual da cidade até os quatro dias seguintes, e cada data apresenta condição e temperaturas mínima e máxima.
- **AC-06 (FR-05):** **Given** uma sessão sem preferência de unidade definida, **When** os dados de temperatura são exibidos pela primeira vez, **Then** são apresentados em Celsius.
- **AC-07 (FR-05):** **Given** temperaturas visíveis de 0 °C, 20 °C e -40 °C, **When** o usuário seleciona Fahrenheit, **Then** os valores correspondentes são 32 °F, 68 °F e -40 °F; ao selecionar Celsius novamente, os valores retornam aos valores originais.
- **AC-08 (FR-06):** **Given** uma busca ainda pendente, **When** o usuário envia a solicitação e antes de receber resposta, **Then** a interface exibe “Carregando...” e remove esse estado quando a solicitação termina.
- **AC-09 (FR-06):** **Given** uma consulta de clima atual ou previsão ainda pendente, **When** a solicitação é enviada e antes de receber resposta, **Then** a interface exibe “Carregando...” e remove esse estado quando a solicitação termina.
- **AC-10 (FR-07):** **Given** que a geocodificação termine com sucesso e retorne uma lista vazia, **When** o resultado é apresentado, **Then** a interface informa “Nenhuma cidade encontrada”, permite iniciar outra busca e não solicita dados meteorológicos.
- **AC-11 (FR-08):** **Given** que a solicitação de geocodificação ou meteorológica retorne uma falha, **When** a falha é processada, **Then** a interface apresenta “Não foi possível buscar cidades” para falha de geocodificação ou “Não foi possível carregar os dados meteorológicos” para falha meteorológica, oferece “Tentar novamente” e não apresenta falha de geocodificação como lista vazia.
- **AC-12 (FR-08):** **Given** que a interface esteja exibindo um erro de consulta, **When** o usuário aciona “Tentar novamente”, **Then** uma nova solicitação é iniciada e, se ela retornar sucesso, os dados meteorológicos são exibidos.
- **AC-13 (FR-01):** **Given** que o campo de busca esteja vazio ou contenha apenas espaços, **When** o usuário tenta pesquisar, **Then** nenhuma solicitação de geocodificação ou meteorológica é enviada e a interface informa “Informe uma cidade”.
- **AC-14 (FR-01):** **Given** o termo “São João d'Aliança” com espaços excedentes nas extremidades, **When** o usuário envia a busca, **Then** somente os espaços externos são removidos, os caracteres acentuados e o apóstrofo são preservados no termo enviado e os resultados retornados são exibidos.
- **AC-15 (FR-03, FR-04, provisório):** **Given** uma resposta meteorológica sem um ou mais campos de temperatura ou condição, **When** os dados são exibidos, **Then** os campos disponíveis permanecem visíveis e cada campo ausente é identificado como “Dados indisponíveis”, sem valor estimado.
- **AC-16 (FR-08, timeout proposto):** **Given** uma solicitação ainda sem resposta após 10 segundos, **When** o limite de timeout proposto é atingido, **Then** o carregamento termina e a interface apresenta a mensagem de erro e a opção de nova tentativa.
- **AC-17 (FR-09):** **Given** qualquer fluxo definido nesta versão, **When** seus rótulos, mensagens e ações são exibidos, **Then** o texto está em português do Brasil e os textos definidos incluem “Buscar cidade”, “Carregando...”, “Nenhuma cidade encontrada”, “Informe uma cidade”, “Não foi possível buscar cidades”, “Não foi possível carregar os dados meteorológicos”, “Dados indisponíveis” e “Tentar novamente”.
- **AC-18 (NFR-09, provisório):** **Given** uma resposta meteorológica que contenha horário de referência, **When** os dados são exibidos, **Then** a interface apresenta esse horário como “Atualizado em” usando o formato pt-BR.
AC-04, AC-05, AC-15 e AC-18 são critérios provisórios: dependem da aprovação do negócio sobre os campos meteorológicos mínimos e a exibição do horário de atualização.

## Non-Functional Requirements

- **NFR-01 — Responsividade:** os fluxos principais devem funcionar em larguras a partir de 320 px, sem rolagem horizontal ou perda de conteúdo e controles.
- **NFR-02 — Desempenho (meta proposta):** 95% das buscas e consultas devem chegar a um estado final visível (sucesso, vazio ou erro) em até 2 segundos, medidos desde o envio. Registrar separadamente a latência da Open-Meteo; o perfil de rede e dispositivo de teste precisa ser definido.
- **NFR-03 — Acessibilidade (meta proposta):** atender ao nível AA da WCAG 2.2 nos fluxos de busca, seleção, consulta e alternância de unidade; validar operação por teclado, foco, nomes acessíveis, contraste e critérios aplicáveis por avaliação automatizada e manual.
- **NFR-04 — Disponibilidade (meta proposta):** disponibilidade mensal de 99,5% para os fluxos principais, medida em mês-calendário. A fórmula de cálculo, janelas de manutenção e inclusão de falhas da Open-Meteo precisam ser acordadas.
- **NFR-05 — Compatibilidade:** suportar a matriz de navegadores e versões aprovada antes da validação final.
- **NFR-06 — Resiliência:** em falha ou timeout, encerrar o carregamento, comunicar o erro, manter a busca e a cidade selecionada disponíveis para correção e nova tentativa, e não apresentar dados inventados como atuais.
- **NFR-07 — Segurança de transporte:** servir a aplicação por HTTPS e usar HTTPS nas comunicações com serviços externos.
- **NFR-08 — Minimização de dados:** não exigir conta nem persistir dados de usuário no servidor.
- **NFR-09 — Atualidade dos dados (proposta):** quando a resposta fornecer horário de referência, exibi-lo junto aos dados; definir idade máxima aceitável para que uma informação seja apresentada como atual.

As metas quantitativas, o perfil de teste, o nível de conformidade e a matriz de compatibilidade indicados como propostas dependem de aprovação antes de serem usados como critérios finais de aceite.

## Traceability Matrix

| User Story | Acceptance Criteria | NFRs específicos relacionados |
|---|---|---|
| US-01 — Buscar cidade e consultar clima atual | AC-01, AC-04, AC-08, AC-09, AC-13, AC-14, AC-15, AC-17, AC-18 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-09 |
| US-02 — Consultar previsão de cinco dias | AC-05, AC-09, AC-15, AC-16, AC-17, AC-18 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06, NFR-09 |
| US-03 — Distinguir e selecionar cidades homônimas | AC-01, AC-02, AC-03, AC-10, AC-11, AC-13, AC-14, AC-16, AC-17 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06 |
| US-04 — Alternar unidade de temperatura | AC-06, AC-07, AC-17 | NFR-01, NFR-02, NFR-03, NFR-05 |
| US-05 — Recuperar-se de ausência de resultados ou falha | AC-10, AC-11, AC-12, AC-16, AC-17 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06 |
| US-06 — Usar a interface em pt-BR | AC-17 | NFR-01, NFR-03, NFR-05 |

**NFRs transversais:** NFR-04 (disponibilidade), NFR-07 (HTTPS) e NFR-08 (minimização de dados) aplicam-se a todas as User Stories, mesmo quando não aparecem na coluna de NFRs específicos.

## Edge Cases

- **Input vazio:** quando o campo estiver vazio ou contiver apenas espaços, não iniciar geocoding nem consulta meteorológica; solicitar que o usuário informe uma cidade e manter o campo disponível para edição.
- **Caracteres especiais:** aceitar nomes com acentos, espaços internos, hífens e apóstrofos; remover espaços excedentes no início e no fim sem alterar os demais caracteres ao pesquisar.
- **Cidade inexistente:** se a busca não localizar a cidade informada, exibir “Nenhuma cidade encontrada”, permitir corrigir a busca e não consultar o clima para outra localidade.
- **Geocoding sem resultados:** tratar uma resposta bem-sucedida do geocoding com lista vazia como estado sem resultados, não como erro de API; não iniciar consulta meteorológica e permitir uma nova busca.
- **Cidade localizada sem cobertura meteorológica:** manter a localidade selecionada e informar que não há dados disponíveis para ela; nunca substituir silenciosamente por dados de outra cidade.
- **Cidades homônimas:** exibir região e país para distinguir os resultados antes da seleção; após a seleção, os dados exibidos devem corresponder à localidade escolhida.
- **Falha de API:** se a Open-Meteo retornar erro ou a comunicação falhar, encerrar o carregamento, informar que os dados não puderam ser obtidos e oferecer “Tentar novamente”. Não tratar a falha como uma busca sem resultados.
- **Timeout:** como limite inicial proposto, se a solicitação continuar sem resposta após 10 segundos, encerrar o carregamento, informar a falha e oferecer nova tentativa; a aprovação desse limite permanece em aberto.
- **Resposta parcial:** exibir os campos meteorológicos recebidos e marcar como indisponíveis os campos ausentes, sem inventar ou estimar valores; se faltarem dados de um dia, preservar a data e indicar a indisponibilidade para aquele dia.
- **Consultas concorrentes:** se o usuário selecionar outra cidade enquanto uma solicitação anterior está pendente, ignorar a resposta antiga para que ela não substitua os dados da seleção mais recente.
- **Alternância de unidade:** quando Celsius/Fahrenheit for alternado, atualizar todos os valores de temperatura visíveis sem alterar a cidade selecionada.
- **Mudança de data:** durante uma sessão que atravesse a meia-noite, atualizar a previsão para a data local da cidade selecionada e os quatro dias seguintes.
- **Largura mínima:** em uma tela de 320 px, manter busca, seleção, clima atual, previsão e alternância de unidade acessíveis, sem rolagem horizontal.

## Assumptions

- A aplicação inicial será web e responsiva; não há decisão para aplicativo nativo ou PWA.
- O usuário seleciona uma cidade pelo nome antes de consultar os dados meteorológicos.
- A previsão tem cinco dias, contando a data local da cidade como o primeiro dia.
- Celsius é a unidade inicial, mas a alternância para Fahrenheit permanece disponível.
- Open-Meteo é o serviço definido para geocodificação e dados meteorológicos; cobertura e adequação dos termos de uso ainda precisam de validação.
- Não haverá autenticação nem persistência de dados no servidor. Persistência local da unidade não está definida.
- Os campos de temperatura e condição atual, e condição e temperaturas mínima/máxima diárias, são uma proposta de escopo mínimo pendente de aprovação.
- Personas e métricas registradas no discovery são hipóteses, não resultados de pesquisa com usuários.

## Risks

- **Dependência externa:** indisponibilidade, alterações, limites ou termos da Open-Meteo podem afetar consultas. Mitigar validando cobertura e termos, monitorando erros e implementando timeout, feedback e nova tentativa.
- **Cobertura/localização:** cidades homônimas ou não cobertas podem levar a resultados confusos. Mitigar exibindo região e país e validando as localidades-alvo.
- **Dados incompletos ou desatualizados:** o usuário pode interpretar ausência ou idade dos dados incorretamente. Mitigar definindo a política de atualização e exibindo indisponibilidade sem inventar valores.
- **Critérios operacionais não aprovados:** metas de desempenho, disponibilidade, acessibilidade e compatibilidade ainda dependem de confirmação. Mitigar aprovando métricas e condições de medição antes do aceite.
- **Escopo de plataforma:** “usar em dispositivos móveis” pode ser interpretado como web responsiva, PWA ou aplicativo nativo. A hipótese inicial é web responsiva; confirmar antes de ampliar o escopo.
- **Preferências locais:** sem persistência no servidor, comportamento da unidade após fechar ou reabrir o navegador ainda é incerto. Mitigar decidindo explicitamente se a unidade será salva localmente ou reiniciada em Celsius.

## Out of Scope

- Cadastro, login e contas de usuário.
- Persistência ou sincronização de preferências no servidor.
- Localização automática, busca por CEP ou coordenadas não fazem parte da primeira versão.
- Alertas, notificações, mapas meteorológicos e histórico de condições passadas.
- Previsões horárias ou períodos além dos cinco dias definidos.
- Aplicativos nativos para iOS ou Android na primeira entrega, sujeito à confirmação do escopo de plataforma.

## Open Questions

- A cobertura geográfica e os termos de uso da Open-Meteo atendem às localidades e ao contexto comercial do produto?
- Os campos provisórios de clima atual e previsão diária são suficientes para a primeira versão?
- Qual idade máxima de dados é aceitável para apresentar uma condição como atual? O horário de referência deve ser mostrado sempre que fornecido?
- A unidade selecionada deve ser mantida localmente entre sessões no mesmo navegador ou reiniciada em Celsius a cada acesso?
- A entrega será apenas web responsiva ou também deve ser instalável como PWA?
- Quais navegadores, versões e dispositivos compõem a matriz de suporte?
- O perfil de rede e dispositivo proposto para medir o percentil 95 de desempenho é aceitável?
- A meta de disponibilidade de 99,5% deve contar falhas da Open-Meteo? Como tratar manutenção planejada e calcular a disponibilidade dos fluxos principais?
- O nível AA da WCAG 2.2 é o padrão de acessibilidade esperado?
- O limite inicial de timeout de 10 segundos é aceitável para geocodificação e consultas meteorológicas?
- Qual precisão e regra de arredondamento devem ser usadas para temperaturas convertidas?
- Para quais localidades a cobertura deve ser validada antes do lançamento?