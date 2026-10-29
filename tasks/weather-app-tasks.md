# Backlog Técnico: Weather App

Tarefas derivadas de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md). Os IDs seguem a ordem recomendada; tarefas na mesma entrega podem avançar em paralelo quando suas dependências forem atendidas.

## Entrega 1 — Base e contratos

### T-01 — Preparar a entrada da aplicação React

**Tipo:** Infra  
**Descrição:** Criar o ponto de montagem React e a estrutura inicial de `src/`, reutilizando a configuração Vite existente.  
**Critérios de aceite:** `pnpm dev` renderiza a aplicação sem erro; `pnpm build` conclui; nenhuma configuração de Vitest ou Playwright é duplicada.  
**Dependências:** Nenhuma.  
**Arquivos prováveis:** `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`.

### T-02 — Definir os tipos de domínio e da Open-Meteo

**Tipo:** Data  
**Descrição:** Declarar os modelos `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit`, além dos tipos mínimos das respostas externas.  
**Critérios de aceite:** Os campos mapeiam os dados descritos no plano; temperaturas aceitam `null`; os payloads externos ficam separados dos tipos de domínio; TypeScript strict compila.  
**Dependências:** T-01.  
**Arquivos prováveis:** `src/types/weather.ts`, `src/types/openMeteo.ts`.

## Entrega 2 — Lógica pura e integração de dados

### T-03 — Implementar mapeadores e funções puras

**Tipo:** Data  
**Descrição:** Criar mapeadores da Open-Meteo e funções de temperatura, códigos WMO e formatação de datas/fuso.  
**Critérios de aceite:** Conversão usa Celsius como base sem mutar o domínio; datas usam o fuso da cidade; campos ausentes viram `null`; código WMO desconhecido não inventa condição.  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/openMeteoMappers.ts`, `src/lib/temperature.ts`, `src/lib/weatherCodes.ts`, `src/lib/dateFormat.ts`.

### T-04 — Testar as funções puras

**Tipo:** Test  
**Descrição:** Cobrir mapeamento e apresentação sem mocks ou chamadas externas.  
**Critérios de aceite:** Vitest valida 0 °C, 20 °C e -40 °C convertidos para Fahrenheit e de volta; cobre dados completos/parciais, códigos WMO e formatação de datas em fuso definido.  
**Dependências:** T-03.  
**Arquivos prováveis:** `tests/unit/lib/openMeteoMappers.test.ts`, `tests/unit/lib/temperature.test.ts`, `tests/unit/lib/weatherCodes.test.ts`, `tests/unit/lib/dateFormat.test.ts`.

### T-05 — Implementar o service de geocoding

**Tipo:** Data  
**Descrição:** Consultar a Open-Meteo por nome e converter resultados para `City`.  
**Critérios de aceite:** Envia termo aparado preservando acentos e apóstrofos; inclui limite de resultados, idioma e formato definidos no plano; distingue lista vazia de falha; aplica timeout e erro tipado.  
**Dependências:** T-02, T-03.  
**Arquivos prováveis:** `src/services/geocodingService.ts`.

### T-06 — Testar o service de geocoding

**Tipo:** Test  
**Descrição:** Validar parâmetros, mapeamento e estados de resultado com `fetch` controlado.  
**Critérios de aceite:** Testes cobrem termo especial aparado, homônimos com região/país, resposta vazia, HTTP não-2xx, erro de rede, timeout e payload inválido; não há acesso à rede real.  
**Dependências:** T-05.  
**Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.

### T-07 — Implementar o service de forecast

**Tipo:** Data  
**Descrição:** Consultar clima atual e cinco dias para as coordenadas selecionadas e mapear a resposta para `WeatherData`.  
**Critérios de aceite:** Solicita `current`, `daily`, Celsius, `timezone=auto` e cinco dias; combina arrays diários por índice; valida sua estrutura; campos ausentes viram `null`; aplica timeout e erro tipado.  
**Dependências:** T-02, T-03.  
**Arquivos prováveis:** `src/services/weatherService.ts`.

### T-08 — Testar o service de forecast

**Tipo:** Test  
**Descrição:** Verificar chamada e normalização do forecast com respostas mockadas.  
**Critérios de aceite:** Testes cobrem parâmetros, mapeamento de clima atual e cinco datas, timezone, campos parciais, arrays desalinhados, HTTP não-2xx, erro de rede e timeout sem chamar a rede real.  
**Dependências:** T-07.  
**Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.

## Entrega 3 — Orquestração do fluxo

### T-09 — Implementar o hook de estado da experiência

**Tipo:** Data  
**Descrição:** Orquestrar busca, seleção, consulta meteorológica, unidade, retry e estados assíncronos no hook da tela.  
**Critérios de aceite:** Busca vazia não chama services; busca e forecast mantêm estados independentes; lista vazia não dispara forecast; seleção consulta suas próprias coordenadas; respostas antigas não substituem a seleção atual; retry reutiliza os parâmetros; unidade inicia em Celsius e não dispara request.  
**Dependências:** T-02, T-05, T-07.  
**Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `src/types/weather.ts`.

### T-10 — Atualizar forecast na virada do dia local

**Tipo:** Data  
**Descrição:** Agendar atualização dos cinco dias pela meia-noite no fuso da cidade selecionada.  
**Critérios de aceite:** Trocar cidade recalcula o agendamento; ao cruzar a meia-noite ou retomar a aba, consulta a previsão para as novas datas locais; não usa polling contínuo nem aceita resposta obsoleta.  
**Dependências:** T-09.  
**Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `src/lib/dateFormat.ts`.

### T-11 — Testar transições e concorrência do hook

**Tipo:** Test  
**Descrição:** Cobrir o fluxo do hook com services substituídos por doubles e relógio controlado.  
**Critérios de aceite:** Verifica `idle`, `loading`, `success`, `empty` e `error`; loading/erro independentes; retry; retenção da cidade/consulta; resposta obsoleta ignorada; atualização na meia-noite local e retomada da aba.  
**Dependências:** T-09, T-10.  
**Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.

## Entrega 4 — Interface

### T-12 — Implementar busca e seleção de cidades

**Tipo:** UI  
**Descrição:** Criar o formulário e a lista acessível de localidades para seleção.  
**Critérios de aceite:** Campo vazio informa “Informe uma cidade”; opções mostram cidade, região e país; selecionar uma opção envia sua identidade ao hook; formulário e lista funcionam por teclado.  
**Dependências:** T-09.  
**Arquivos prováveis:** `src/components/CitySearch.tsx`.

### T-13 — Exibir clima atual e previsão diária

**Tipo:** UI  
**Descrição:** Renderizar cidade selecionada, condição/temperatura atual e previsão de hoje mais quatro dias.  
**Critérios de aceite:** Exibe cinco datas locais em ordem, condição e mín./máx.; converte temperaturas conforme `Unit` na apresentação; campos ausentes mostram “Dados indisponíveis”; apresenta “Atualizado em” quando houver horário; não troca silenciosamente de localidade.  
**Dependências:** T-03, T-09.  
**Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/Forecast.tsx`.

### T-14 — Implementar feedback, retry e controle de unidade

**Tipo:** UI  
**Descrição:** Exibir estados da busca/forecast e permitir alternar Celsius/Fahrenheit.  
**Critérios de aceite:** Loading, vazio, sucesso e erros exibem feedback adequado; erros oferecem “Tentar novamente”; todos os textos definidos em AC-17 estão em pt-BR; alternância reflete em todas as temperaturas sem nova consulta; tela compõe os componentes do fluxo.  
**Dependências:** T-12, T-13.  
**Arquivos prováveis:** `src/components/WeatherStatus.tsx`, `src/components/UnitToggle.tsx`, `src/App.tsx`.

### T-15 — Testar componentes e estados da UI

**Tipo:** Test  
**Descrição:** Validar estados e interações de cada componente sem acoplamento a HTTP.  
**Critérios de aceite:** Testing Library cobre loading/erro/vazio/sucesso, rótulos AC-17, homônimos, retry, campos indisponíveis, unidade, nomes acessíveis, foco e teclado.  
**Dependências:** T-12, T-13, T-14.  
**Arquivos prováveis:** `tests/unit/components/CitySearch.test.tsx`, `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/Forecast.test.tsx`, `tests/unit/components/WeatherStatus.test.tsx`, `tests/unit/components/UnitToggle.test.tsx`.

## Entrega 5 — Validação e publicação

### T-16 — Cobrir os fluxos E2E em desktop e mobile

**Tipo:** Test  
**Descrição:** Validar jornadas completas com respostas Open-Meteo interceptadas.  
**Critérios de aceite:** Playwright cobre busca, homônimos, seleção, clima/previsão, vazio, erros, retry e seleções concorrentes; viewport mobile de 320 px não tem rolagem horizontal nem controles inacessíveis; cenário desktop passa.  
**Dependências:** T-11, T-15.  
**Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.

### T-17 — Executar auditoria de acessibilidade

**Tipo:** Test  
**Descrição:** Verificar acessibilidade automatizada e manual após aprovação da meta WCAG 2.2 AA.  
**Critérios de aceite:** Critérios aprovados são avaliados nos fluxos principais; revisão cobre teclado, foco, nomes acessíveis e contraste; achados bloqueadores são registrados e corrigidos. A ferramenta automatizada é escolhida sem duplicar dependências existentes.  
**Dependências:** T-15, T-16 e aprovação do NFR-03.  
**Arquivos prováveis:** `tests/unit/components/`, `tests/e2e/weather-app.spec.ts`, configuração da ferramenta de acessibilidade se necessária.

### T-18 — Validar publicação HTTPS no GitHub Pages

**Tipo:** Infra  
**Descrição:** Integrar o build do app ao fluxo existente de publicação sob `/app/`.  
**Critérios de aceite:** Build publica em `/app/` com `VITE_BASE` correto; aplicação é servida por HTTPS e chama apenas endpoints HTTPS; nenhuma autenticação ou persistência de dados no servidor é introduzida; workflow de publicação conclui.  
**Dependências:** T-01, T-16.  
**Arquivos prováveis:** `.github/workflows/pages.yml`, `vite.config.ts`.

## Decisões pendentes

As metas propostas de desempenho (NFR-02), disponibilidade (NFR-04), matriz de navegadores (NFR-05), timeout (AC-16) e nível de acessibilidade (NFR-03) dependem de aprovação. Transformá-las em gates de entrega somente depois da decisão; T-17 depende explicitamente da aprovação de acessibilidade.
