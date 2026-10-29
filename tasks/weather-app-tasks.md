# Backlog Técnico: Weather App

Tarefas derivadas de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md). A implementação segue tipos → funções puras → services → hook → componentes → integração → testes → hardening. Dentro da fase de testes, as dependências permitem validar cada fatia vertical assim que sua integração estiver pronta.

## Entrega 1 — Tipos

### T-01 — Definir contratos de domínio e da Open-Meteo

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Data  
**Descrição:** Declarar os modelos de domínio e os DTOs mínimos usados pelos endpoints.  
**Critérios de aceite:** `weather.ts` exporta `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit`; `openMeteo.ts` mantém DTOs separados; campos parciais de clima aceitam `null`; TypeScript strict compila.  
**Rastreabilidade:** AC-01 a AC-05 e AC-15; contratos que suportam FR-01 a FR-04.  
**Dependências:** Nenhuma.  
**Arquivos prováveis:** `src/types/weather.ts`, `src/types/openMeteo.ts`.

## Entrega 2 — Funções puras

### T-02 — Mapear respostas da Open-Meteo para o domínio

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Data  
**Descrição:** Converter DTOs de geocoding e forecast para os modelos internos.  
**Critérios de aceite:** Campos de `City`, `CurrentWeather` e `ForecastDay` são mapeados; arrays diários são combinados pelo mesmo índice; campos opcionais ausentes viram `null`; payload estruturalmente inválido ou arrays desalinhados são rejeitados.  
**Rastreabilidade:** AC-01 a AC-05 e AC-15.  
**Dependências:** T-01.  
**Arquivos prováveis:** `src/lib/openMeteoMappers.ts`.

### T-03 — Converter temperaturas entre Celsius e Fahrenheit

**Prioridade:** P0 · **Tamanho:** P

**Tipo:** Data  
**Descrição:** Criar funções puras de apresentação sem alterar o valor canônico em Celsius.  
**Critérios de aceite:** A função retorna 32 °F, 68 °F e -40 °F para 0 °C, 20 °C e -40 °C; a conversão de volta reproduz os valores Celsius; `null` permanece indisponível e a entrada não é mutada.  
**Rastreabilidade:** AC-06 e AC-07.  
**Dependências:** T-01.  
**Arquivos prováveis:** `src/lib/temperature.ts`.

### T-04 — Traduzir códigos meteorológicos WMO

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Data  
**Descrição:** Mapear códigos meteorológicos suportados para descrições em pt-BR.  
**Critérios de aceite:** Os códigos WMO `0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99` retornam descrição não vazia; `null` e código fora da lista retornam texto neutro de indisponibilidade, sem afirmar uma condição.  
**Rastreabilidade:** AC-04, AC-05 e AC-15 (campos de condição provisórios).  
**Dependências:** T-01.  
**Arquivos prováveis:** `src/lib/weatherCodes.ts`.

### T-05 — Formatar datas e horários no fuso da cidade

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Data  
**Descrição:** Criar funções puras de formatação pt-BR que respeitem as datas e o timezone da API.  
**Critérios de aceite:** Uma data diária `YYYY-MM-DD` mantém o mesmo dia em fusos de navegador diferentes; `observedAt` é formatado em pt-BR com o timezone recebido; valores ausentes não geram data ou horário inventado.  
**Rastreabilidade:** AC-05, AC-18 (provisório) e edge case de mudança de data.  
**Dependências:** T-01.  
**Arquivos prováveis:** `src/lib/dateFormat.ts`.

## Entrega 3 — Services

### T-06 — Implementar busca de cidades

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Data  
**Descrição:** Consultar geocoding por nome e converter resultados para `City`.  
**Critérios de aceite:** A URL remove apenas espaços externos e preserva acentos/apóstrofos; envia `count`, `language` e `format` definidos no plano; resposta HTTP bem-sucedida vazia retorna `[]`; HTTP não-2xx, falha de rede, timeout e payload inválido retornam erros tipados, nunca `[]`.  
**Rastreabilidade:** AC-01, AC-02, AC-10, AC-11, AC-13, AC-14 e AC-16 (timeout proposto).  
**Dependências:** T-01, T-02.  
**Arquivos prováveis:** `src/services/geocodingService.ts`.

### T-07 — Implementar consulta de clima e previsão

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Data  
**Descrição:** Consultar o forecast para coordenadas selecionadas e retornar `WeatherData`.  
**Critérios de aceite:** Request inclui as coordenadas recebidas, `current=temperature_2m,weather_code`, variáveis `daily` do plano, Celsius, `timezone=auto` e `forecast_days=5`; resposta válida é mapeada; HTTP não-2xx, rede, timeout e payload inválido retornam erros tipados.  
**Rastreabilidade:** AC-03, AC-04, AC-05, AC-09, AC-15, AC-16 (timeout proposto) e edge case de localidade sem cobertura.  
**Dependências:** T-01, T-02.  
**Arquivos prováveis:** `src/services/weatherService.ts`.

## Entrega 4 — Hook

### T-08 — Orquestrar busca, seleção e consulta

**Prioridade:** P0 · **Tamanho:** G

**Tipo:** Data  
**Descrição:** Coordenar estados assíncronos, retry, seleção e unidade no hook da aplicação.  
**Critérios de aceite:** Busca e clima têm estados independentes; input vazio não chama services; `empty` após geocoding bem-sucedido não chama forecast; seleção envia suas próprias coordenadas; retry mantém parâmetros; erros não viram `empty`; unidade inicial é Celsius e alterná-la não chama services; respostas antigas não substituem a seleção atual.  
**Rastreabilidade:** AC-06 a AC-13 e NFR-06; edge case de consultas concorrentes.  
**Dependências:** T-01, T-06, T-07.  
**Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.

### T-09 — Atualizar previsão na virada do dia local

**Prioridade:** P1 · **Tamanho:** M

**Tipo:** Data  
**Descrição:** Agendar renovação diária conforme o fuso da cidade selecionada.  
**Critérios de aceite:** Trocar de cidade ou timezone recalcula o agendamento; após a meia-noite local e ao retomar a aba, o hook solicita forecast uma vez; resposta da seleção anterior não atualiza o estado.  
**Rastreabilidade:** AC-05, AC-18 (provisório), NFR-09 (proposto) e edge cases de mudança de data/consultas concorrentes.  
**Dependências:** T-05, T-08.  
**Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.

## Entrega 5 — Componentes

### T-10 — Implementar busca e seleção de cidade

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** UI  
**Descrição:** Criar o formulário de busca e a lista de localidades selecionáveis.  
**Critérios de aceite:** Submissão vazia/espaços mostra “Informe uma cidade”; opções mostram nome, região e país; ativação envia o objeto `City` correto ao callback; campo e opções têm rótulos acessíveis e funcionam por teclado.  
**Rastreabilidade:** AC-01 a AC-03, AC-13 e AC-17; NFR-03 (proposto).  
**Dependências:** T-08.  
**Arquivos prováveis:** `src/components/CitySearch.tsx`.

### T-11 — Exibir condições atuais

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** UI  
**Descrição:** Renderizar cidade, temperatura, condição e horário observado.  
**Critérios de aceite:** Mostra a cidade recebida; temperatura corresponde à unidade ativa; código conhecido usa a descrição pt-BR de T-04; campo `null` mostra “Dados indisponíveis”; horário presente é exibido como “Atualizado em” e ausente não gera horário.  
**Rastreabilidade:** AC-03, AC-04, AC-06, AC-07, AC-15, AC-17 e AC-18 (provisório).  
**Dependências:** T-03, T-04, T-05, T-08.  
**Arquivos prováveis:** `src/components/CurrentWeather.tsx`.

### T-12 — Exibir previsão de cinco dias

**Prioridade:** P1 · **Tamanho:** M

**Tipo:** UI  
**Descrição:** Renderizar previsão de hoje e dos quatro dias seguintes.  
**Critérios de aceite:** Com cinco itens de entrada, renderiza cinco datas em ordem cronológica local; cada item mostra data, condição e mín./máx.; valores `null` mostram “Dados indisponíveis”; temperaturas correspondem à unidade ativa.  
**Rastreabilidade:** AC-05, AC-06, AC-07, AC-15 e AC-17 (campos de AC-05 provisórios).  
**Dependências:** T-03, T-04, T-05, T-08.  
**Arquivos prováveis:** `src/components/Forecast.tsx`.

### T-13 — Exibir estados e ações de erro

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** UI  
**Descrição:** Renderizar carregamento, vazio, falhas de busca/forecast e retry.  
**Critérios de aceite:** Busca/clima pendentes mostram “Carregando...” e removem o indicador ao resolver; vazio mostra “Nenhuma cidade encontrada”; erros mostram a mensagem correspondente ao service; retry chama o handler da operação que falhou; textos definidos em AC-17 são literais.  
**Rastreabilidade:** AC-08 a AC-13, AC-16 (timeout proposto) e AC-17.  
**Dependências:** T-08.  
**Arquivos prováveis:** `src/components/WeatherStatus.tsx`.

### T-14 — Implementar controle de unidade

**Prioridade:** P1 · **Tamanho:** P

**Tipo:** UI  
**Descrição:** Criar controle acessível para alternar Celsius/Fahrenheit.  
**Critérios de aceite:** Estado inicial indica Celsius; selecionar Fahrenheit atualiza os valores visíveis e voltar a Celsius restaura os originais; mudança não chama services; controle anuncia nome e estado selecionado.  
**Rastreabilidade:** AC-06, AC-07 e AC-17; NFR-03 (proposto).  
**Dependências:** T-03, T-08.  
**Arquivos prováveis:** `src/components/UnitToggle.tsx`.

## Entrega 6 — Integração

### T-15 — Criar a entrada React da aplicação

**Prioridade:** P0 · **Tamanho:** P

**Tipo:** Infra  
**Descrição:** Montar `App` na raiz existente do `index.html`, reutilizando a configuração Vite.  
**Critérios de aceite:** `src/main.tsx` monta `App` no elemento `#root`; ao abrir Vite, o elemento recebe a aplicação React; `pnpm build` conclui sem duplicar configuração de teste.  
**Rastreabilidade:** Suporte de execução aos FR-01 a FR-09; sem AC de produto direto.  
**Dependências:** T-10, T-11, T-13.  
**Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.

### T-16 — Integrar busca, clima atual e feedback

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** UI  
**Descrição:** Integrar uma primeira fatia executável de busca, seleção, clima atual e feedback.  
**Critérios de aceite:** Busca, resultados, clima atual e estados de loading/erro/vazio usam o hook; selecionar uma cidade exibe os dados atuais dela; viewport de 320 px não tem rolagem horizontal; textos estão em pt-BR.  
**Rastreabilidade:** FR-01, FR-02, FR-03, FR-06, FR-07, FR-08, FR-09, AC-17 e NFR-01.  
**Dependências:** T-08, T-10, T-11, T-13, T-15.  
**Arquivos prováveis:** `src/App.tsx`, `src/index.css`.

### T-17 — Integrar previsão de cinco dias

**Prioridade:** P1 · **Tamanho:** M

**Tipo:** UI  
**Descrição:** Adicionar a previsão diária à primeira fatia já integrada.  
**Critérios de aceite:** A tela renderiza cinco datas locais em ordem com condição e mín./máx.; valores ausentes permanecem identificados como indisponíveis.  
**Rastreabilidade:** FR-04, AC-05 e AC-15 (campos de AC-05 provisórios).  
**Dependências:** T-12, T-16.  
**Arquivos prováveis:** `src/App.tsx`.

### T-18 — Integrar alternância de unidade

**Prioridade:** P1 · **Tamanho:** P

**Tipo:** UI  
**Descrição:** Conectar o controle de unidade à tela integrada.  
**Critérios de aceite:** A tela inicia em Celsius; alternar para Fahrenheit e de volta atualiza todas as temperaturas sem novo request.  
**Rastreabilidade:** FR-05, AC-06 e AC-07.  
**Dependências:** T-14, T-17.  
**Arquivos prováveis:** `src/App.tsx`.

## Entrega 7 — Testes

### T-19 — Testar mapeadores de payload

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Test  
**Descrição:** Validar respostas de geocoding e forecast sem rede externa.  
**Critérios de aceite:** Vitest verifica os campos de `City`, `CurrentWeather` e `ForecastDay`; associa séries diárias por índice; valida `null` para campos ausentes e rejeição de estrutura inválida/arrays desalinhados.  
**Rastreabilidade:** AC-01 a AC-05 e AC-15.  
**Dependências:** T-02, T-16.  
**Arquivos prováveis:** `tests/unit/lib/openMeteoMappers.test.ts`.

### T-20 — Testar unitariamente a conversão de unidade

**Prioridade:** P1 · **Tamanho:** P

**Tipo:** Test  
**Descrição:** Testar isoladamente as funções de conversão Celsius/Fahrenheit, sem renderização ou serviços.  
**Critérios de aceite:** Vitest espera 32 °F, 68 °F e -40 °F para 0 °C, 20 °C e -40 °C; conversão de retorno reproduz os valores Celsius; `null` continua ausente e a entrada não é mutada.  
**Rastreabilidade:** AC-06 e AC-07.  
**Dependências:** T-03, T-16.  
**Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.

### T-21 — Testar códigos WMO e formatação local

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Test  
**Descrição:** Verificar descrições e funções de datas/timezone.  
**Critérios de aceite:** Vitest testa cada código listado em T-04, fallback neutro desconhecido, data diária invariável ao fuso do browser e horário formatado no timezone recebido.  
**Rastreabilidade:** AC-04, AC-05, AC-15 e AC-18 (provisórios), edge case de mudança de data.  
**Dependências:** T-04, T-05, T-16.  
**Arquivos prováveis:** `tests/unit/lib/weatherCodes.test.ts`, `tests/unit/lib/dateFormat.test.ts`.

### T-22 — Testar service de geocoding com `fetch` mockado

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Test  
**Descrição:** Verificar URL, parâmetros, mapeamento e falhas com `fetch` mockado.  
**Critérios de aceite:** Vitest verifica termo com acentos/apóstrofo aparado, parâmetros, região/país, `[]` em sucesso vazio e erros tipados de HTTP/rede/timeout/payload; nenhuma chamada externa é feita.  
**Rastreabilidade:** AC-01, AC-02, AC-10, AC-11, AC-13, AC-14 e AC-16 (timeout proposto).  
**Dependências:** T-06, T-16.  
**Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.

### T-23 — Testar service de forecast com `fetch` mockado

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Test  
**Descrição:** Verificar request, mapeamento e falhas do forecast com `fetch` mockado.  
**Critérios de aceite:** Vitest confirma coordenadas/parâmetros, clima atual, cinco datas, timezone e campos parciais; espera erro para séries desalinhadas, HTTP não-2xx, rede e timeout; nenhuma chamada externa é feita.  
**Rastreabilidade:** AC-03 a AC-05, AC-09, AC-15 e AC-16 (timeout proposto).  
**Dependências:** T-07, T-16.  
**Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.

### T-24 — Testar estados do hook

**Prioridade:** P1 · **Tamanho:** G

**Tipo:** Test  
**Descrição:** Cobrir transições, retry, concorrência e renovação diária com services/relógio controlados.  
**Critérios de aceite:** Vitest verifica estados `idle/loading/success/empty/error`, input vazio sem request, busca vazia sem forecast, retry com parâmetros originais, cidade retida, resposta antiga ignorada e refresh após meia-noite/retomada.  
**Rastreabilidade:** AC-08 a AC-13, AC-16 (timeout proposto), NFR-06 e edge cases de concorrência/data.  
**Dependências:** T-08, T-09, T-16.  
**Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.

### T-25 — Testar componente de busca

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Test  
**Descrição:** Verificar validação, desambiguação e interação acessível.  
**Critérios de aceite:** Testing Library confirma vazio sem chamada do handler e mensagem “Informe uma cidade”; homônimos exibem região/país; opção ativada envia a `City` correta; campo/opções têm nome acessível e funcionam por teclado.  
**Rastreabilidade:** AC-02, AC-03, AC-13, AC-17 e NFR-03 (proposto).  
**Dependências:** T-10, T-16.  
**Arquivos prováveis:** `tests/unit/components/CitySearch.test.tsx`.

### T-26 — Testar componente de clima atual

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Test  
**Descrição:** Verificar os dados e estados renderizados no componente atual.  
**Critérios de aceite:** Testing Library verifica cidade, temperatura/unidade, condição, `Dados indisponíveis` para `null` e “Atualizado em” formatado quando `observedAt` existe; sem horário, esse rótulo não aparece.  
**Rastreabilidade:** AC-03, AC-04, AC-06, AC-07, AC-15, AC-17 e AC-18 (provisório).  
**Dependências:** T-11, T-16.  
**Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`.

### T-27 — Testar componente de previsão

**Prioridade:** P1 · **Tamanho:** P

**Tipo:** Test  
**Descrição:** Verificar os cinco itens diários isoladamente.  
**Critérios de aceite:** Testing Library confirma exatamente cinco datas em ordem; cada item mostra condição e mín./máx.; `null` mostra “Dados indisponíveis”; valores seguem a unidade selecionada.  
**Rastreabilidade:** AC-05, AC-06, AC-07, AC-15 e AC-17 (campos de AC-05 provisórios).  
**Dependências:** T-12, T-17.  
**Arquivos prováveis:** `tests/unit/components/Forecast.test.tsx`.

### T-28 — Testar componente nos estados loading, erro e vazio

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Test  
**Descrição:** Verificar estados de feedback e handlers de retry.  
**Critérios de aceite:** Testing Library renderiza e verifica loading, erro e vazio separadamente, além do estado success; compara literalmente mensagens AC-17; retry chama o handler correspondente; timeout recebido como erro encerra o loading e mostra mensagem de erro.  
**Rastreabilidade:** AC-08 a AC-13, AC-16 (timeout proposto) e AC-17.  
**Dependências:** T-13, T-16.  
**Arquivos prováveis:** `tests/unit/components/WeatherStatus.test.tsx`.

### T-29 — Testar controle de unidade

**Prioridade:** P1 · **Tamanho:** P

**Tipo:** Test  
**Descrição:** Verificar valor inicial, mudança e anúncio acessível da unidade.  
**Critérios de aceite:** Testing Library confirma Celsius inicialmente; seleção Fahrenheit e retorno Celsius atualizam o estado selecionado; o controle tem nome acessível e opera por teclado.  
**Rastreabilidade:** AC-06, AC-07, AC-17 e NFR-03 (proposto).  
**Dependências:** T-14, T-18.  
**Arquivos prováveis:** `tests/unit/components/UnitToggle.test.tsx`.

### T-30 — Testar fluxo principal E2E com viewport mobile

**Prioridade:** P1 · **Tamanho:** G

**Tipo:** Test  
**Descrição:** Exercitar jornadas completas com APIs interceptadas.  
**Critérios de aceite:** Playwright executa o fluxo principal de busca, seleção, clima atual e cinco dias; também verifica busca aparada, conversão sem novo request, loading, vazio sem forecast, erro/retry e resposta antiga ignorada; projeto desktop e viewport mobile de 320 px passam sem rolagem horizontal.  
**Rastreabilidade:** AC-01 a AC-17 e NFR-01; fluxos E2E integrados.  
**Dependências:** T-19 a T-29.  
**Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.

## Entrega 8 — Hardening

### T-31 — Instalar scanner de acessibilidade

**Prioridade:** P2 · **Tamanho:** P

**Tipo:** Infra  
**Descrição:** Adicionar `@axe-core/playwright` somente após aprovação do NFR-03.  
**Critérios de aceite:** Após aprovação, a dependência consta em `package.json` e `pnpm-lock.yaml`; `pnpm install --frozen-lockfile` conclui; projetos Playwright desktop/mobile continuam configurados.  
**Rastreabilidade:** NFR-03 (meta proposta, condicionada à aprovação).  
**Dependências:** T-30 e aprovação do NFR-03.  
**Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.

### T-32 — Auditar acessibilidade dos fluxos

**Prioridade:** P2 · **Tamanho:** M

**Tipo:** Test  
**Descrição:** Combinar scanner automatizado e revisão manual WCAG 2.2 AA.  
**Critérios de aceite:** Axe não registra violações aplicáveis de impacto crítico/alto nos fluxos principais; checklist manual registra teclado, foco, nome acessível e contraste; cada achado tem correção ou justificativa registrada.  
**Rastreabilidade:** NFR-03 e AC-17 (meta WCAG 2.2 AA condicionada à aprovação).  
**Dependências:** T-31.  
**Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.

### T-33 — Validar publicação HTTPS no GitHub Pages

**Prioridade:** P0 · **Tamanho:** M

**Tipo:** Infra  
**Descrição:** Validar build/publicação no caminho `/app/` pelo workflow existente.  
**Critérios de aceite:** Build com `VITE_BASE=/${repository}/app/` carrega assets sob `/app/`; workflow publica uma URL HTTPS; a aplicação usa endpoints HTTPS; não é adicionada autenticação ou persistência server-side.  
**Rastreabilidade:** NFR-07 e NFR-08.  
**Dependências:** T-15, T-18, T-30.  
**Arquivos prováveis:** `.github/workflows/pages.yml`, `vite.config.ts`.

## Decisões pendentes

As metas propostas de desempenho (NFR-02), disponibilidade (NFR-04), matriz de navegadores (NFR-05), timeout (AC-16) e acessibilidade (NFR-03) dependem de aprovação. Não tratá-las como gates antes da decisão; T-31 e T-32 dependem da aprovação de acessibilidade.

## Matriz de rastreabilidade funcional

| Requisito | Resumo | Tarefas de implementação | Tarefas de validação |
|---|---|---|---|
| FR-01 | Buscar cidades pelo nome | T-02, T-06, T-08, T-10, T-16 | T-19, T-22, T-24, T-25, T-30 |
| FR-02 | Distinguir e selecionar cidades homônimas | T-02, T-06, T-08, T-10, T-16 | T-19, T-22, T-25, T-30 |
| FR-03 | Consultar clima atual da cidade selecionada | T-02, T-07, T-08, T-11, T-16 | T-19, T-23, T-24, T-26, T-30 |
| FR-04 | Consultar previsão de hoje e dos quatro dias seguintes | T-02, T-07, T-09, T-12, T-17 | T-21, T-23, T-24, T-27, T-30 |
| FR-05 | Iniciar em Celsius e alternar para Fahrenheit | T-03, T-08, T-14, T-18 | T-20, T-24, T-29, T-30 |
| FR-06 | Indicar carregamento de busca e consulta meteorológica | T-08, T-13, T-16 | T-24, T-28, T-30 |
| FR-07 | Informar busca sem resultados | T-06, T-08, T-13, T-16 | T-22, T-24, T-28, T-30 |
| FR-08 | Informar falhas e permitir nova tentativa | T-06, T-07, T-08, T-13, T-16 | T-22, T-23, T-24, T-28, T-30 |
| FR-09 | Apresentar interface e mensagens em pt-BR | T-04, T-05, T-10 a T-18 | T-21, T-25 a T-30 |

**Lacunas:** Nenhum requisito funcional FR-01 a FR-09 está sem tarefa de implementação e validação correspondente. Os itens sem requisito funcional direto são tarefas de suporte técnico; requisitos não funcionais e critérios provisórios permanecem identificados nas tarefas e decisões pendentes.

## Sequência vertical sugerida

**Prioridade:** P0 bloqueia a primeira fatia utilizável ou a publicação segura; P1 completa a experiência funcional ou seus edge cases; P2 é hardening condicionado à aprovação da meta de acessibilidade.  
**Tamanho:** P é uma mudança/teste localizado; M envolve vários comportamentos em um módulo ou integração pequena; G envolve coordenação assíncrona ou validação de vários fluxos. O tamanho é relativo, não uma estimativa em horas.

| Fatia | Entrega visível | Tarefas de implementação | Validação correspondente |
|---|---|---|---|
| Preparação | Contratos e serviços prontos; ainda sem tela completa | T-01 a T-08 | Executar TypeScript strict e verificações unitárias assim que cada módulo estiver pronto |
| 1. Busca e clima atual | Buscar cidade, escolher homônimo e exibir condições atuais, loading, vazio e erros | T-10, T-11, T-13, T-15, T-16 | T-19, T-21, T-22, T-23, T-25, T-26 e T-28 |
| 2. Previsão de cinco dias | Acrescentar datas locais, condições e mín./máx.; atualizar na virada do dia | T-09, T-12, T-17 | T-24 e T-27 |
| 3. Alternância de unidade | Acrescentar Celsius/Fahrenheit sem novo request | T-14, T-18 | T-20 e T-29 |
| Fechamento | Regressão integrada, publicação HTTPS e hardening aprovado | T-30, T-31, T-32, T-33 | T-30 e workflow do GitHub Pages; T-31/T-32 só após aprovação do NFR-03 |

A fatia 1 é o primeiro incremento utilizável; previsão e unidade entram como complementos sem bloquear a publicação antecipada dessa tela de busca/clima atual. T-30 executa a regressão completa depois das três fatias; P2 não deve bloquear entregas enquanto WCAG 2.2 AA não for aprovado.