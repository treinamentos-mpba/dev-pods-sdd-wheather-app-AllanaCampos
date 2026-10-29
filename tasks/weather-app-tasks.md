# Backlog Técnico: Weather App

Tarefas derivadas de [`plans/weather-app-plan.md`](../plans/weather-app-plan.md). Os IDs seguem a ordem recomendada; tarefas na mesma entrega podem avançar em paralelo quando suas dependências forem atendidas. Cada tarefa limita-se a uma responsabilidade e, em geral, a no máximo dois arquivos.

## Entrega 1 — Base e contratos

### T-01 — Criar a entrada React

**Tipo:** Infra  
**Descrição:** Montar a raiz React no HTML existente e criar o ponto de entrada.  
**Critérios de aceite:** `src/main.tsx` monta o componente raiz no elemento existente; `pnpm dev` e `pnpm build` não falham; a configuração Vite existente é reutilizada.  
**Dependências:** Nenhuma.  
**Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.

### T-02 — Definir os contratos do domínio e da API

**Tipo:** Data  
**Descrição:** Declarar os tipos de domínio e os DTOs mínimos da Open-Meteo.  
**Critérios de aceite:** `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit` refletem o plano; payloads externos ficam separados; temperaturas ausentes aceitam `null`; TypeScript strict compila.  
**Dependências:** T-01.  
**Arquivos prováveis:** `src/types/weather.ts`, `src/types/openMeteo.ts`.

## Entrega 2 — Funções puras

### T-03 — Mapear respostas Open-Meteo para o domínio

**Tipo:** Data  
**Descrição:** Implementar somente a transformação dos DTOs de geocoding e forecast para os tipos internos.  
**Critérios de aceite:** Mapeia propriedades atuais e séries diárias; combina séries por índice; valores ausentes viram `null`; payload estruturalmente inválido é rejeitado.  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/openMeteoMappers.ts`.

### T-04 — Implementar conversão de temperatura

**Tipo:** Data  
**Descrição:** Criar funções puras para apresentar Celsius e Fahrenheit.  
**Critérios de aceite:** Conversões de ida e volta preservam 0 °C, 20 °C e -40 °C; valores ausentes não são estimados; a função não altera o modelo.  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/temperature.ts`.

### T-05 — Mapear códigos meteorológicos WMO

**Tipo:** Data  
**Descrição:** Traduzir códigos WMO conhecidos para descrições em pt-BR.  
**Critérios de aceite:** Códigos suportados têm descrição estável; código desconhecido retorna indicação neutra de indisponibilidade, sem inventar condição.  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/weatherCodes.ts`.

### T-06 — Formatar datas no fuso da cidade

**Tipo:** Data  
**Descrição:** Criar funções puras de formatação de datas e horários em pt-BR com timezone informado.  
**Critérios de aceite:** Datas diárias não mudam por causa do fuso do navegador; horário de observação é formatável no timezone do relatório.  
**Dependências:** T-02.  
**Arquivos prováveis:** `src/lib/dateFormat.ts`.

### T-07 — Testar mapeadores de payload

**Tipo:** Test  
**Descrição:** Verificar transformação de respostas válidas e parciais.  
**Critérios de aceite:** Vitest cobre geocoding, clima atual, arrays diários alinhados, campos ausentes e estrutura inválida.  
**Dependências:** T-03.  
**Arquivos prováveis:** `tests/unit/lib/openMeteoMappers.test.ts`.

### T-08 — Testar conversão de temperatura

**Tipo:** Test  
**Descrição:** Validar conversões e ausência de mutação do valor canônico.  
**Critérios de aceite:** Vitest verifica 0 °C = 32 °F, 20 °C = 68 °F, -40 °C = -40 °F e conversão de volta.  
**Dependências:** T-04.  
**Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.

### T-09 — Testar códigos WMO e datas locais

**Tipo:** Test  
**Descrição:** Cobrir descrições meteorológicas e formatação pt-BR/timezone.  
**Critérios de aceite:** Vitest verifica código conhecido e desconhecido, data local e horário formatado no fuso fornecido.  
**Dependências:** T-05, T-06.  
**Arquivos prováveis:** `tests/unit/lib/weatherCodes.test.ts`, `tests/unit/lib/dateFormat.test.ts`.

## Entrega 3 — Acesso a dados

### T-10 — Implementar busca de cidades

**Tipo:** Data  
**Descrição:** Criar o service de geocoding e normalizar resultados para `City`.  
**Critérios de aceite:** Envia o termo aparado sem alterar acentos/apóstrofos; usa parâmetros do plano; retorna lista vazia separada de erros; classifica falha HTTP, rede, timeout e payload inválido.  
**Dependências:** T-02, T-03.  
**Arquivos prováveis:** `src/services/geocodingService.ts`.

### T-11 — Testar busca de cidades

**Tipo:** Test  
**Descrição:** Testar geocoding com `fetch` controlado, sem rede externa.  
**Critérios de aceite:** Vitest verifica parâmetros, caracteres especiais, homônimos, vazio, HTTP não-2xx, rede, timeout e resposta inválida.  
**Dependências:** T-10.  
**Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.

### T-12 — Implementar consulta de forecast

**Tipo:** Data  
**Descrição:** Criar o service de clima atual e previsão diária para a cidade selecionada.  
**Critérios de aceite:** Consulta usa `current`, `daily`, Celsius, timezone automático e cinco dias; mapeia para `WeatherData`; trata timeout, erro HTTP/rede e payload inválido.  
**Dependências:** T-02, T-03.  
**Arquivos prováveis:** `src/services/weatherService.ts`.

### T-13 — Testar consulta de forecast

**Tipo:** Test  
**Descrição:** Verificar parâmetros, mapeamento e falhas do service com `fetch` mockado.  
**Critérios de aceite:** Vitest cobre clima atual, cinco dias, timezone, campos parciais, séries desalinhadas, HTTP não-2xx, rede e timeout.  
**Dependências:** T-12.  
**Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.

## Entrega 4 — Estado e fluxo

### T-14 — Orquestrar busca, seleção e consulta

**Tipo:** Data  
**Descrição:** Implementar no hook os estados assíncronos, retry, unidade e descarte de resposta obsoleta.  
**Critérios de aceite:** Busca e clima têm estados independentes; vazio não consulta forecast; seleção usa suas coordenadas; retry mantém parâmetros; erros não viram vazio; unidade inicia em Celsius sem novo request ao alternar.  
**Dependências:** T-02, T-04, T-10, T-12.  
**Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.

### T-15 — Atualizar previsão na virada do dia local

**Tipo:** Data  
**Descrição:** Agendar renovação diária conforme o fuso da cidade selecionada.  
**Critérios de aceite:** Nova cidade recalcula o horário; meia-noite ou retomada da aba atualiza as datas; não há polling contínuo nem atualização por resposta obsoleta.  
**Dependências:** T-06, T-14.  
**Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.

### T-16 — Testar estados e atualização diária do hook

**Tipo:** Test  
**Descrição:** Validar orquestração com services substituídos e relógio controlado.  
**Critérios de aceite:** Vitest cobre `idle`, `loading`, `success`, `empty`, `error`, retry, retenção da seleção, concorrência, meia-noite e retomada da aba.  
**Dependências:** T-14, T-15.  
**Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.

## Entrega 5 — Componentes de UI

### T-17 — Implementar busca e seleção de cidade

**Tipo:** UI  
**Descrição:** Criar o formulário de busca e a lista de localidades.  
**Critérios de aceite:** Campo vazio comunica o erro de validação; opções exibem cidade, região e país; seleção chama o callback correto; controles são operáveis por teclado.  
**Dependências:** T-14.  
**Arquivos prováveis:** `src/components/CitySearch.tsx`.

### T-18 — Exibir condições atuais

**Tipo:** UI  
**Descrição:** Renderizar cidade, temperatura, condição e horário observado.  
**Critérios de aceite:** Mostra a localidade selecionada; converte unidade na apresentação; campos ausentes aparecem como “Dados indisponíveis”; horário é exibido quando fornecido.  
**Dependências:** T-04, T-05, T-06, T-14.  
**Arquivos prováveis:** `src/components/CurrentWeather.tsx`.

### T-19 — Exibir previsão de cinco dias

**Tipo:** UI  
**Descrição:** Renderizar previsão diária para hoje e os quatro dias seguintes.  
**Critérios de aceite:** Exibe exatamente cinco datas em ordem local; cada dia mostra condição e mín./máx.; campos ausentes são identificados; temperaturas seguem a unidade ativa.  
**Dependências:** T-04, T-05, T-06, T-14.  
**Arquivos prováveis:** `src/components/Forecast.tsx`.

### T-20 — Exibir estados e ações de erro

**Tipo:** UI  
**Descrição:** Criar feedback de loading, vazio e erros de busca/clima com retry.  
**Critérios de aceite:** Mensagens de AC-17 são exatas e em pt-BR; carregamento termina em estado final; retry aciona a operação correspondente.  
**Dependências:** T-14.  
**Arquivos prováveis:** `src/components/WeatherStatus.tsx`.

### T-21 — Implementar controle de unidade

**Tipo:** UI  
**Descrição:** Criar controle acessível para alternar Celsius e Fahrenheit.  
**Critérios de aceite:** A unidade inicial é Celsius; alteração atualiza todas as temperaturas visíveis sem nova consulta; o controle expõe estado/label acessível.  
**Dependências:** T-14.  
**Arquivos prováveis:** `src/components/UnitToggle.tsx`.

### T-22 — Compor a tela Weather App

**Tipo:** UI  
**Descrição:** Conectar componentes e hook na tela principal e definir o layout responsivo.  
**Critérios de aceite:** Busca, resultados, estados, clima, previsão e unidade usam o mesmo estado de tela; interface funciona sem rolagem horizontal a partir de 320 px.  
**Dependências:** T-17, T-18, T-19, T-20, T-21.  
**Arquivos prováveis:** `src/App.tsx`, `src/index.css`.

## Entrega 6 — Testes de UI e E2E

### T-23 — Testar busca e seleção na UI

**Tipo:** Test  
**Descrição:** Validar formulário, opções e seleção com Testing Library.  
**Critérios de aceite:** Cobertura inclui vazio, cidade homônima com região/país, seleção, nomes acessíveis e teclado.  
**Dependências:** T-17.  
**Arquivos prováveis:** `tests/unit/components/CitySearch.test.tsx`.

### T-24 — Testar componentes meteorológicos

**Tipo:** Test  
**Descrição:** Verificar apresentação do clima atual e da previsão.  
**Critérios de aceite:** Testing Library cobre cinco dias, unidade, condição, horário disponível e campos nulos nos componentes isoladamente.  
**Dependências:** T-18, T-19.  
**Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/Forecast.test.tsx`.

### T-25 — Testar feedback e controle de unidade

**Tipo:** Test  
**Descrição:** Validar estados de interface, mensagens e alternância de unidade.  
**Critérios de aceite:** Testing Library cobre loading, erro, vazio, sucesso, retry, mensagens AC-17, unidade ativa e operação por teclado.  
**Dependências:** T-20, T-21.  
**Arquivos prováveis:** `tests/unit/components/WeatherStatus.test.tsx`, `tests/unit/components/UnitToggle.test.tsx`.

### T-26 — Cobrir os fluxos E2E em desktop e mobile

**Tipo:** Test  
**Descrição:** Exercitar jornadas completas com respostas Open-Meteo interceptadas.  
**Critérios de aceite:** Playwright cobre busca, homônimos, seleção, previsão, vazio, erros, retry e concorrência; viewport mobile de 320 px não tem rolagem horizontal nem controles inacessíveis; desktop passa.  
**Dependências:** T-16, T-22, T-23, T-24, T-25.  
**Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.

## Entrega 7 — Acessibilidade e publicação

### T-27 — Adicionar scanner automatizado de acessibilidade

**Tipo:** Infra  
**Descrição:** Incluir `@axe-core/playwright` após aprovação do NFR-03, sem alterar a configuração E2E existente além do necessário.  
**Critérios de aceite:** Dependência fica registrada e instalada pelo lockfile; Playwright continua executando os projetos desktop e mobile já configurados.  
**Dependências:** T-26 e aprovação do NFR-03.  
**Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`.

### T-28 — Auditar acessibilidade dos fluxos

**Tipo:** Test  
**Descrição:** Combinar scanner automatizado com revisão manual WCAG 2.2 AA.  
**Critérios de aceite:** Auditoria cobre fluxos principais, teclado, foco, nomes acessíveis e contraste; violações aplicáveis são registradas e resolvidas.  
**Dependências:** T-27.  
**Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`.

### T-29 — Validar publicação HTTPS no GitHub Pages

**Tipo:** Infra  
**Descrição:** Validar build e publicação do app no caminho `/app/` pelo workflow existente.  
**Critérios de aceite:** `VITE_BASE` mantém assets em `/app/`; site é servido por HTTPS e usa endpoints externos HTTPS; não é adicionada autenticação ou persistência no servidor; workflow conclui.  
**Dependências:** T-01, T-22, T-26.  
**Arquivos prováveis:** `.github/workflows/pages.yml`, `vite.config.ts`.

## Decisões pendentes

As metas propostas de desempenho (NFR-02), disponibilidade (NFR-04), matriz de navegadores (NFR-05), timeout (AC-16) e acessibilidade (NFR-03) dependem de aprovação. Não tratá-las como gates antes da decisão; T-27 e T-28 dependem da aprovação de acessibilidade.
