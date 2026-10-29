# Backlog de Implementação — Weather App

Este backlog deriva de `plans/weather-app-plan.md`; os requisitos e critérios de aceite em `specs/weather-app-spec.md` são a referência para validar cada tarefa. As tarefas estão ordenadas por entrega e dependência. Critérios ligados a ACs provisórios ou metas propostas permanecem condicionados à aprovação indicada na spec.

## Entrega 1 — Contratos e serviços de dados

### T-01 — Definir contratos de domínio e utilitários

- **Descrição:** estabelecer os tipos compartilhados de cidade, clima, previsão, unidade e estados de busca/consulta; implementar conversão de temperatura e formatação pt-BR necessárias à interface.
- **Critérios de aceite:**
  - Os tipos representam os campos de `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `TemperatureUnit`, `SearchState` e `WeatherState` definidos no plano.
  - Valores meteorológicos ausentes são representáveis sem estimativa e podem ser apresentados como “Dados indisponíveis”.
  - A conversão retorna `32 °F` para `0 °C`, `68 °F` para `20 °C` e `-40 °F` para `-40 °C`; converter de volta retorna os valores Celsius originais.
  - A formatação de datas e horários usa locale `pt-BR`.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/weather.ts`, `src/utils/temperature.ts`, `src/utils/date.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** AC-07, AC-15, AC-17, AC-18 (provisório).

### T-02 — Implementar serviço de geocodificação

- **Descrição:** consultar a API de geocodificação Open-Meteo por nome e converter resultados para o contrato `City`.
- **Critérios de aceite:**
  - Uma busca válida envia o termo com apenas espaços externos removidos, preservando acentos, espaços internos e apóstrofos.
  - Cada resultado convertido contém identificador, nome, país e coordenadas; região, código do país e fuso horário são preservados quando fornecidos.
  - Uma resposta bem-sucedida vazia retorna uma lista vazia; falha HTTP, de rede ou de leitura da resposta é rejeitada como erro, não como lista vazia.
  - A URL e a comunicação com a API usam HTTPS.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/geocoding.ts`, `src/types/weather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-01, FR-02, FR-08, NFR-07; AC-01, AC-02, AC-10, AC-11, AC-14.

### T-03 — Implementar serviço de previsão

- **Descrição:** consultar a API Forecast da Open-Meteo pelas coordenadas selecionadas e normalizar clima atual e previsão diária.
- **Critérios de aceite:**
  - A requisição usa as coordenadas da cidade, unidades Celsius, fuso `auto` e solicita cinco dias, além dos campos atuais e diários definidos no plano.
  - Uma resposta válida é normalizada para clima atual e até cinco datas em ordem cronológica, preservando a data local retornada pela API.
  - Campos ausentes são representados como indisponíveis; a normalização não calcula nem inventa temperaturas ou condições.
  - Falhas HTTP, de rede ou de leitura da resposta são rejeitadas como erro.
  - A URL e a comunicação com a API usam HTTPS.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/forecast.ts`, `src/types/weather.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-03, FR-04, FR-08, NFR-07; AC-04, AC-05, AC-09, AC-11, AC-15, AC-18 (provisórios quando indicado).

## Entrega 2 — Busca e seleção de localidade

### T-04 — Criar formulário de busca e lista de cidades

- **Descrição:** permitir pesquisar cidades, mostrar resultados distinguíveis e selecionar uma localidade.
- **Critérios de aceite:**
  - O formulário apresenta o rótulo “Buscar cidade” e aceita envio por teclado.
  - Campo vazio ou contendo apenas espaços não inicia requisição e apresenta “Informe uma cidade”.
  - Resultados exibem nome da cidade e região e país disponíveis, permitindo distinguir localidades homônimas.
  - A seleção entrega à aplicação a cidade escolhida, incluindo seu identificador e coordenadas.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`, `src/components/CityResults.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-01, FR-02, FR-09; AC-01, AC-02, AC-03, AC-13, AC-14, AC-17.

### T-05 — Integrar estados da busca e nova tentativa

- **Descrição:** conectar o formulário ao serviço de geocodificação e apresentar carregamento, vazio e erro com recuperação.
- **Critérios de aceite:**
  - Enquanto uma busca está pendente, a interface apresenta “Carregando...” e remove o estado ao concluir.
  - Uma resposta vazia apresenta “Nenhuma cidade encontrada”, mantém a busca utilizável e não chama o serviço meteorológico.
  - Uma falha apresenta “Não foi possível buscar cidades”, não é apresentada como lista vazia e oferece “Tentar novamente”.
  - Acionar “Tentar novamente” envia uma nova requisição usando o último termo válido.
  - Se aprovado o timeout proposto de 10 segundos, uma busca pendente além desse limite encerra o carregamento e apresenta o erro de geocodificação com nova tentativa.
- **Dependências:** T-02, T-04.
- **Arquivos prováveis:** `src/app/App.tsx`, `src/components/CitySearch.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-06, FR-07, FR-08, FR-09; AC-08, AC-10, AC-11, AC-12, AC-16, AC-17.

## Entrega 3 — Clima, previsão e unidade

### T-06 — Apresentar clima atual e previsão diária

- **Descrição:** consultar a localidade selecionada e exibir seus dados meteorológicos normalizados.
- **Critérios de aceite:**
  - A seleção inicia consulta usando as coordenadas dessa cidade e a interface exibe “Carregando...” enquanto aguarda.
  - Após uma resposta válida, a interface identifica a cidade e apresenta a temperatura atual e uma descrição textual da condição.
  - A previsão apresenta cinco datas em ordem cronológica, da data local atual aos quatro dias seguintes; cada data mostra condição e temperaturas mínima e máxima.
  - Se a sessão atravessar a meia-noite local da cidade selecionada, a previsão passa a incluir essa nova data local e os quatro dias seguintes.
  - Campos ausentes aparecem como “Dados indisponíveis”; uma data sem dados permanece visível.
  - Se a resposta fornecer horário de referência, ele é apresentado como “Atualizado em” em formato pt-BR.
- **Dependências:** T-01, T-03, T-04.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`, `src/app/App.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-03, FR-04, FR-06, FR-09; AC-04, AC-05, AC-09, AC-15, AC-17, AC-18; Edge Cases.
- **Observação:** AC-04, AC-05, AC-15 e AC-18 dependem de aprovação dos campos mínimos e da exibição do horário.

### T-07 — Implementar alternância de unidade

- **Descrição:** permitir alternar entre Celsius e Fahrenheit para todos os valores de temperatura visíveis.
- **Critérios de aceite:**
  - Na ausência de preferência previamente definida, a unidade inicial é Celsius.
  - Ao alternar para Fahrenheit, todos os valores visíveis de clima atual e previsão refletem a conversão; ao voltar para Celsius, os valores originais reaparecem.
  - A seleção da unidade não altera a cidade nem inicia uma nova busca meteorológica.
- **Dependências:** T-01, T-06.
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`, `src/app/App.tsx`.
- **Tipo:** UI.
- **Rastreabilidade:** FR-05, FR-09; AC-06, AC-07, AC-17.

### T-08 — Tratar falhas meteorológicas e concorrência

- **Descrição:** manter a seleção recuperável em falhas e impedir que resposta antiga sobrescreva dados da cidade selecionada mais recentemente.
- **Critérios de aceite:**
  - Uma falha meteorológica encerra o carregamento, mostra “Não foi possível carregar os dados meteorológicos” e oferece “Tentar novamente”.
  - A cidade selecionada permanece identificada durante o erro; a nova tentativa consulta a mesma cidade.
  - Dadas duas consultas pendentes para cidades diferentes, concluir primeiro a consulta antiga não substitui a cidade nem os dados da seleção mais recente.
  - Se aprovado o timeout proposto de 10 segundos, uma solicitação pendente além desse limite encerra o carregamento e apresenta o erro meteorológico com nova tentativa.
- **Dependências:** T-03, T-05, T-06.
- **Arquivos prováveis:** `src/app/App.tsx`, `src/services/forecast.ts`.
- **Tipo:** Data.
- **Rastreabilidade:** FR-08; AC-09, AC-11, AC-12, AC-16; NFR-06; Edge Cases.
- **Observação:** o limite de timeout é proposto e permanece sujeito à aprovação.

## Entrega 4 — Validação e qualidade

### T-09 — Testar contratos, serviços e componentes

- **Descrição:** criar testes unitários e de componentes para validação de entrada, normalização de dados, estados e ações da interface.
- **Critérios de aceite:**
  - Testes verificam entrada vazia, remoção somente de espaços externos e preservação de acentos e apóstrofos.
  - Testes distinguem lista vazia de falha do geocoding e validam campos de região/país nos resultados.
  - Testes verificam conversão de temperatura nos três valores de referência da spec e retorno à unidade original.
  - Testes verificam cinco datas ordenadas, dados parciais e indicação dos campos indisponíveis.
  - Um teste com relógio controlado verifica a atualização das cinco datas quando a data local da cidade selecionada muda.
  - Testes verificam carregamento, vazio, erros, retry e os textos pt-BR definidos na spec.
  - Testes verificam que uma resposta de consulta antiga não substitui a seleção mais recente.
- **Dependências:** T-01 a T-08.
- **Arquivos prováveis:** `tests/unit/services/`, `tests/unit/utils/`, `tests/unit/components/`.
- **Tipo:** Test.
- **Rastreabilidade:** AC-01 a AC-17; Edge Cases.

### T-10 — Validar fluxos ponta a ponta e responsividade

- **Descrição:** cobrir os fluxos de busca e consulta no navegador com respostas controladas e verificar requisitos transversais.
- **Critérios de aceite:**
  - Um cenário Playwright pesquisa e seleciona uma cidade, mostra clima atual e cinco dias, e alterna a unidade.
  - Cenários Playwright cobrem cidades homônimas, busca sem resultados, falhas de geocoding e meteorologia e nova tentativa.
  - As chamadas externas nos testes são controladas para que o resultado não dependa da disponibilidade da Open-Meteo.
  - Em viewport de 320 px, os controles e conteúdos principais permanecem acessíveis sem rolagem horizontal.
  - Busca, seleção e alternância de unidade podem ser operadas por teclado e têm nomes acessíveis.
- **Dependências:** T-04 a T-09.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, configuração existente do Playwright.
- **Tipo:** Test.
- **Rastreabilidade:** US-01 a US-06; AC-01 a AC-17; NFR-01, NFR-03.
- **Observação:** nível WCAG 2.2 AA e matriz final de navegadores dependem de aprovação.
