# Backlog Técnico: Weather App

Tarefas derivadas de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md). Os IDs seguem a ordem recomendada; tarefas na mesma entrega podem avançar em paralelo quando suas dependências forem atendidas. Cada tarefa limita-se a uma responsabilidade e, em geral, a no máximo dois arquivos.

## Entrega 1 — Base e contratos

### T-01 — Criar a entrada React

**Tipo:** Infra  
**Descrição:** Montar a raiz React no HTML existente e criar o ponto de entrada.  
**Critérios de aceite:** `src/main.tsx` monta `App` no elemento `#root`; ao abrir a URL do Vite, `#root` recebe conteúdo React; `pnpm build` conclui com exit code 0; nenhuma configuração de teste é duplicada.  
**Rastreabilidade:** Suporte técnico aos FR-01 a FR-09; sem AC de produto direto.  
**Dependências:** Nenhuma.  
**Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.

### T-02 — Definir os contratos do domínio e da API

**Tipo:** Data  
**Descrição:** Declarar os tipos de domínio e os DTOs mínimos da Open-Meteo.  
**Critérios de aceite:** `weather.ts` exporta `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit`; `openMeteo.ts` mantém os DTOs separados; temperaturas e códigos ausentes aceitam `null`; `pnpm build` conclui sem erros de tipo.  
**Rastreabilidade:** AC-01 a AC-05 e AC-15; contratos que suportam FR-01 a FR-04.  
**Dependências:** T-01.  
**Arquivos prováveis:** `src/types/weather.ts`, `src/types/openMeteo.ts`.

## Entrega 2 — Funções puras

### T-03 — Mapear respostas Open-Meteo para o domínio

**Tipo:** Data  
**Descrição:** Implementar somente a transformação dos DTOs de geocoding e forecast para os tipos internos.  
**Critérios de aceite:** Mapeia os campos de geocoding usados por `City` e os campos `current`/`daily` definidos no plano; combina séries diárias pelo mesmo índice; converte campos ausentes para `null`; rejeita respostas com estrutura incompatível ou séries desalinhadas.  
**Rastreabilidade:** AC-01 a AC-05 e AC-15.  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/openMeteoMappers.ts`.

### T-04 — Implementar conversão de temperatura

**Tipo:** Data  
**Descrição:** Criar funções puras para apresentar Celsius e Fahrenheit.  
**Critérios de aceite:** A função retorna 32 °F, 68 °F e -40 °F para 0 °C, 20 °C e -40 °C; conversão de retorno reproduz esses valores Celsius; `null` permanece indisponível e a entrada não é mutada.  
**Rastreabilidade:** AC-06 e AC-07.  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/temperature.ts`.

### T-05 — Mapear códigos meteorológicos WMO

**Tipo:** Data  
**Descrição:** Traduzir códigos WMO conhecidos para descrições em pt-BR.  
**Critérios de aceite:** Os códigos WMO `0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99` retornam descrições não vazias em pt-BR; `null` e código fora da lista retornam “Dados indisponíveis” ou equivalente neutro; nenhum fallback afirma uma condição meteorológica.  
**Rastreabilidade:** AC-04, AC-05 e AC-15 (campos de condição provisórios).  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/weatherCodes.ts`.

### T-06 — Formatar datas no fuso da cidade

**Tipo:** Data  
**Descrição:** Criar funções puras de formatação de datas e horários em pt-BR com timezone informado.  
**Critérios de aceite:** Uma data `YYYY-MM-DD` da API é exibida no mesmo dia em fusos de navegador diferentes; `observedAt` é formatado em pt-BR usando o timezone recebido; entradas ausentes não geram data inventada.  
**Rastreabilidade:** AC-05, AC-18 (provisório) e edge case de mudança de data.  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/dateFormat.ts`.

### T-07 — Testar mapeadores de payload

**Tipo:** Test  
**Descrição:** Verificar transformação de respostas válidas e parciais.  
**Critérios de aceite:** Vitest verifica mapeamento de cada campo de `City` e `CurrentWeather`; associa data/código/mínima/máxima pelos índices correspondentes; verifica `null` para campos ausentes e rejeição de arrays desalinhados.  
**Rastreabilidade:** AC-01 a AC-05 e AC-15.  
**Dependências:** T-03.  
**Arquivos prováveis:** `tests/unit/lib/openMeteoMappers.test.ts`.

### T-08 — Testar conversão de temperatura

**Tipo:** Test  
**Descrição:** Validar conversões e ausência de mutação do valor canônico.  
**Critérios de aceite:** Vitest espera 32 °F, 68 °F e -40 °F para 0 °C, 20 °C e -40 °C; espera os valores originais após conversão de volta; verifica `null` sem mutação da entrada.  
**Rastreabilidade:** AC-06 e AC-07.  
**Dependências:** T-04.  
**Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.

### T-09 — Testar códigos WMO e datas locais

**Tipo:** Test  
**Descrição:** Cobrir descrições meteorológicas e formatação pt-BR/timezone.  
**Critérios de aceite:** Vitest verifica descrição para cada código WMO listado em T-05 e fallback neutro para código desconhecido; verifica que a data diária permanece no dia da API e que horário usa o timezone fornecido.  
**Rastreabilidade:** AC-04, AC-05, AC-15 e AC-18 (provisórios), edge case de mudança de data.  
**Dependências:** T-05, T-06.  
**Arquivos prováveis:** `tests/unit/lib/weatherCodes.test.ts`, `tests/unit/lib/dateFormat.test.ts`.

## Entrega 3 — Acesso a dados

### T-10 — Implementar busca de cidades

**Tipo:** Data  
**Descrição:** Criar o service de geocoding e normalizar resultados para `City`.  
**Critérios de aceite:** A URL contém o termo com apenas espaços externos removidos e preserva acentos/apóstrofos; envia `count`, `language` e `format` definidos no plano; retorna `[]` para resposta bem-sucedida vazia; falha HTTP, rede, timeout e payload inválido resultam em erro tipado, nunca `[]`.  
**Rastreabilidade:** AC-01, AC-02, AC-10, AC-11, AC-13, AC-14 e AC-16 (timeout proposto).  
**Dependências:** T-02, T-03.  
**Arquivos prováveis:** `src/services/geocodingService.ts`.

### T-11 — Testar busca de cidades

**Tipo:** Test  
**Descrição:** Testar geocoding com `fetch` controlado, sem rede externa.  
**Critérios de aceite:** Vitest inspeciona URL/parâmetros para termo especial; valida região/país em homônimos; confirma que resposta vazia retorna `[]`; confirma erro tipado para HTTP não-2xx, rede, timeout e payload inválido. A ausência de chamada meteorológica é verificada no teste do hook (T-16).  
**Rastreabilidade:** AC-01, AC-02, AC-10, AC-11, AC-13, AC-14 e AC-16 (timeout proposto).  
**Dependências:** T-10.  
**Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.

### T-12 — Implementar consulta de forecast

**Tipo:** Data  
**Descrição:** Criar o service de clima atual e previsão diária para a cidade selecionada.  
**Critérios de aceite:** Request contém coordenadas selecionadas, `current=temperature_2m,weather_code`, séries `daily` do plano, Celsius, `timezone=auto` e `forecast_days=5`; resposta válida mapeia para `WeatherData`; erro HTTP/rede, timeout e payload inválido rejeitam com erro tipado.  
**Rastreabilidade:** AC-03, AC-04, AC-05, AC-09, AC-15, AC-16 (timeout proposto) e edge case de localidade sem cobertura.  
**Dependências:** T-02, T-03.  
**Arquivos prováveis:** `src/services/weatherService.ts`.

### T-13 — Testar consulta de forecast

**Tipo:** Test  
**Descrição:** Verificar parâmetros, mapeamento e falhas do service com `fetch` mockado.  
**Critérios de aceite:** Vitest confirma parâmetros e coordenadas; verifica clima atual, cinco datas cronológicas e timezone; verifica `null` em campos parciais; espera erro tipado para séries desalinhadas, HTTP não-2xx, rede e timeout.  
**Rastreabilidade:** AC-03, AC-04, AC-05, AC-09, AC-15 e AC-16 (timeout proposto).  
**Dependências:** T-12.  
**Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.

## Entrega 4 — Estado e fluxo

### T-14 — Orquestrar busca, seleção e consulta

**Tipo:** Data  
**Descrição:** Implementar no hook os estados assíncronos, retry, unidade e descarte de resposta obsoleta.  
**Critérios de aceite:** Busca composta apenas por espaços não chama geocoding nem forecast; busca e clima mantêm estados independentes; `empty` após geocoding bem-sucedido não chama forecast; seleção encaminha latitude/longitude da cidade escolhida; retry repete os mesmos parâmetros; erro não produz `empty`; unidade inicial é Celsius e alterná-la não chama services.  
**Rastreabilidade:** AC-06 a AC-13 e NFR-06; edge case de consultas concorrentes.  
**Dependências:** T-02, T-04, T-10, T-12.  
**Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.

### T-15 — Atualizar previsão na virada do dia local

**Tipo:** Data  
**Descrição:** Agendar renovação diária conforme o fuso da cidade selecionada.  
**Critérios de aceite:** Trocar de cidade ou timezone recalcula o agendamento; após a meia-noite local e ao retomar a aba, o hook solicita forecast uma vez; nenhuma resposta da seleção anterior atualiza o estado.  
**Rastreabilidade:** AC-05, AC-18 (provisório), NFR-09 (proposto) e edge cases de mudança de data/consultas concorrentes.  
**Dependências:** T-06, T-14.  
**Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.

### T-16 — Testar estados e atualização diária do hook

**Tipo:** Test  
**Descrição:** Validar orquestração com services substituídos e relógio controlado.  
**Critérios de aceite:** Vitest espera cada transição `idle/loading/success/empty/error`; verifica retry com parâmetros originais, seleção retida após erro, resposta antiga ignorada e uma nova consulta após meia-noite/retomada usando relógio controlado.  
**Rastreabilidade:** AC-08 a AC-12, AC-16 (timeout proposto), NFR-06 e edge cases de concorrência e mudança de data.  
**Dependências:** T-14, T-15.  
**Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.

## Entrega 5 — Componentes de UI

### T-17 — Implementar busca e seleção de cidade

**Tipo:** UI  
**Descrição:** Criar o formulário de busca e a lista de localidades.  
**Critérios de aceite:** Submeter vazio/ espaços mostra “Informe uma cidade”; cada opção exibe nome, região e país; ativar uma opção chama o callback com aquele objeto `City`; busca e seleção funcionam por teclado com rótulos acessíveis.  
**Rastreabilidade:** AC-01 a AC-03, AC-13, AC-17 e NFR-03 (proposto).  
**Dependências:** T-14.  
**Arquivos prováveis:** `src/components/CitySearch.tsx`.

### T-18 — Exibir condições atuais

**Tipo:** UI  
**Descrição:** Renderizar cidade, temperatura, condição e horário observado.  
**Critérios de aceite:** O componente mostra o `City` recebido; valores de temperatura correspondem à unidade ativa; código WMO conhecido gera a descrição pt-BR de T-05; campo `null` mostra “Dados indisponíveis”; `observedAt` presente gera “Atualizado em” formatado em pt-BR, e ausente não gera horário.  
**Rastreabilidade:** AC-03, AC-04, AC-06, AC-07, AC-15, AC-17 e AC-18 (provisório).  
**Dependências:** T-04, T-05, T-06, T-14.  
**Arquivos prováveis:** `src/components/CurrentWeather.tsx`.

### T-19 — Exibir previsão de cinco dias

**Tipo:** UI  
**Descrição:** Renderizar previsão diária para hoje e os quatro dias seguintes.  
**Critérios de aceite:** Com cinco itens de entrada, o componente renderiza exatamente cinco itens na mesma ordem cronológica local; cada item apresenta data, condição e mín./máx.; cada valor `null` mostra “Dados indisponíveis”; temperaturas correspondem à unidade ativa.  
**Rastreabilidade:** AC-05, AC-06, AC-07, AC-15 e AC-17 (campos de AC-05 provisórios).  
**Dependências:** T-04, T-05, T-06, T-14.  
**Arquivos prováveis:** `src/components/Forecast.tsx`.

### T-20 — Exibir estados e ações de erro

**Tipo:** UI  
**Descrição:** Criar feedback de loading, vazio e erros de busca/clima com retry.  
**Critérios de aceite:** Para busca e clima pendentes aparece “Carregando...” e desaparece ao resolver; busca vazia mostra “Nenhuma cidade encontrada”; timeout já recebido como erro mostra a mensagem do serviço e encerra o loading; falhas mostram “Não foi possível buscar cidades” ou “Não foi possível carregar os dados meteorológicos” conforme o serviço; retry chama o handler correspondente; são renderizados literalmente os textos de AC-17.  
**Rastreabilidade:** AC-08 a AC-12, AC-16 (timeout proposto) e AC-17.  
**Dependências:** T-14.  
**Arquivos prováveis:** `src/components/WeatherStatus.tsx`.

### T-21 — Implementar controle de unidade

**Tipo:** UI  
**Descrição:** Criar controle acessível para alternar Celsius e Fahrenheit.  
**Critérios de aceite:** Inicialmente o controle indica Celsius; selecionar Fahrenheit atualiza todos os valores visíveis para as conversões esperadas e voltar a Celsius restaura os valores originais; alternar não chama services; controle tem nome acessível e estado selecionado anunciado.  
**Rastreabilidade:** AC-06, AC-07, AC-17 e NFR-03 (proposto).  
**Dependências:** T-14.  
**Arquivos prováveis:** `src/components/UnitToggle.tsx`.

### T-22 — Compor a tela Weather App

**Tipo:** UI  
**Descrição:** Conectar componentes e hook na tela principal e definir o layout responsivo.  
**Critérios de aceite:** A página conecta busca, resultados, feedback, clima, previsão e unidade ao estado do hook; em viewport de 320 px nenhum conteúdo/controle requer rolagem horizontal ou fica inacessível; textos de interface estão em pt-BR.  
**Rastreabilidade:** FR-01 a FR-09, AC-17, NFR-01 e NFR-03 (proposto).  
**Dependências:** T-17, T-18, T-19, T-20, T-21.  
**Arquivos prováveis:** `src/App.tsx`, `src/index.css`.

## Entrega 6 — Testes de UI e E2E

### T-23 — Testar busca e seleção na UI

**Tipo:** Test  
**Descrição:** Validar formulário, opções e seleção com Testing Library.  
**Critérios de aceite:** Testing Library verifica que submissão vazia não chama o handler de busca e mostra “Informe uma cidade”; opção homônima exibe região/país; ativar a opção chama o handler com a cidade correta; campo e opções têm nomes acessíveis e funcionam por teclado.  
**Rastreabilidade:** AC-02, AC-03, AC-13, AC-17 e NFR-03 (proposto).  
**Dependências:** T-17.  
**Arquivos prováveis:** `tests/unit/components/CitySearch.test.tsx`.

### T-24 — Testar componentes meteorológicos

**Tipo:** Test  
**Descrição:** Verificar apresentação do clima atual e da previsão.  
**Critérios de aceite:** Testing Library verifica no componente atual cidade, temperatura/unidade, condição, horário presente/ausente e `null`; no componente de previsão verifica cinco itens em ordem, data, condição, mín./máx., unidade e `null`.  
**Rastreabilidade:** AC-04 a AC-07, AC-15, AC-18 (provisórios onde indicado).  
**Dependências:** T-18, T-19.  
**Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/Forecast.test.tsx`.

### T-25 — Testar feedback e controle de unidade

**Tipo:** Test  
**Descrição:** Validar estados de interface, mensagens e alternância de unidade.  
**Critérios de aceite:** Testing Library verifica os quatro estados visuais; compara literalmente cada mensagem definida em AC-17; confirma que retry chama o handler correto e que o controle de unidade anuncia a seleção por teclado.  
**Rastreabilidade:** AC-06 a AC-13, AC-16 (timeout proposto), AC-17 e NFR-03 (proposto).  
**Dependências:** T-20, T-21.  
**Arquivos prováveis:** `tests/unit/components/WeatherStatus.test.tsx`, `tests/unit/components/UnitToggle.test.tsx`.

### T-26 — Cobrir os fluxos E2E em desktop e mobile

**Tipo:** Test  
**Descrição:** Exercitar jornadas completas com respostas Open-Meteo interceptadas.  
**Critérios de aceite:** Playwright verifica o termo “São João d'Aliança” com espaços externos e confirma que a busca envia apenas o termo aparado; campo vazio não envia requests; busca válida sem resultados não chama forecast; seleção de homônimo mantém os dados da cidade escolhida; resposta mockada mostra condição/temperatura atuais e cinco datas com condição/mín./máx.; alternar 20 °C para 68 °F e voltar para 20 °C não gera novo request; loading de busca e forecast termina; erro mostra a mensagem do serviço e retry repete a operação; resposta concorrente antiga não sobrescreve a atual. Projetos desktop e mobile concluem sem falhas e a página mobile em 320 px não tem rolagem horizontal.  
**Rastreabilidade:** AC-01 a AC-03, AC-06 a AC-14, AC-17 e NFR-01.  
**Dependências:** T-16, T-22, T-23, T-24, T-25.  
**Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.

## Entrega 7 — Acessibilidade e publicação

### T-27 — Adicionar scanner automatizado de acessibilidade

**Tipo:** Infra  
**Descrição:** Incluir `@axe-core/playwright` após aprovação do NFR-03, sem alterar a configuração E2E existente além do necessário.  
**Critérios de aceite:** Após aprovação do NFR-03, `@axe-core/playwright` aparece em `package.json` e `pnpm-lock.yaml`; `pnpm install --frozen-lockfile` conclui; os projetos Playwright desktop e mobile continuam configurados.  
**Rastreabilidade:** NFR-03 (meta proposta, condicionada à aprovação).  
**Dependências:** T-26 e aprovação do NFR-03.  
**Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.

### T-28 — Auditar acessibilidade dos fluxos

**Tipo:** Test  
**Descrição:** Combinar scanner automatizado com revisão manual WCAG 2.2 AA.  
**Critérios de aceite:** Axe executa nos fluxos principais sem violações WCAG aplicáveis de impacto crítico/alto; checklist manual registra resultado de teclado, foco, nome acessível e contraste; violações encontradas têm correção ou justificativa registrada.  
**Rastreabilidade:** NFR-03 e AC-17 (meta WCAG 2.2 AA condicionada à aprovação).  
**Dependências:** T-27.  
**Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.

### T-29 — Validar publicação HTTPS no GitHub Pages

**Tipo:** Infra  
**Descrição:** Validar build e publicação do app no caminho `/app/` pelo workflow existente.  
**Critérios de aceite:** Build com `VITE_BASE=/${repository}/app/` carrega assets sob `/app/`; execução do workflow de Pages conclui e publica uma URL HTTPS; a aplicação faz requests somente a endpoints HTTPS; nenhuma conta ou persistência server-side é adicionada.  
**Rastreabilidade:** NFR-07 e NFR-08.  
**Dependências:** T-01, T-22, T-26.  
**Arquivos prováveis:** `.github/workflows/pages.yml`, `vite.config.ts`.

## Decisões pendentes

As metas propostas de desempenho (NFR-02), disponibilidade (NFR-04), matriz de navegadores (NFR-05), timeout (AC-16) e acessibilidade (NFR-03) dependem de aprovação. Não tratá-las como gates antes da decisão; T-27 e T-28 dependem da aprovação de acessibilidade.
