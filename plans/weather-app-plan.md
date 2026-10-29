# Architecture

A aplicação será uma web app responsiva, organizada em camadas simples: interface, estado de página, serviços HTTP e normalização dos dados da Open-Meteo. Não haverá backend próprio, autenticação ou persistência no servidor (NFR-08).

```text
UI (busca, seleção, clima, previsão, unidade)
                 ↕
       Estado da página
                 ↕
 Serviços de geocodificação e meteorologia
                 ↕ HTTPS
 Open-Meteo Geocoding API / Forecast API
```

A seleção de uma cidade precede a consulta meteorológica (Assumption; FR-02, FR-03). Os dados exibidos devem corresponder à localidade selecionada; respostas de consultas anteriores não podem substituir a seleção mais recente (AC-03; Edge Cases). A interface e as mensagens serão em pt-BR (FR-09).

Os campos de clima atual, previsão e horário de atualização descritos neste plano refletem critérios provisórios da especificação. A aprovação dos campos mínimos e da apresentação do horário permanece em aberto (AC-04, AC-05, AC-15, AC-18; Open Questions).

# Tech Stack

- **React 19 e TypeScript 6:** interface componentizada e contratos tipados; compatíveis com o stack já declarado no projeto. Adequados à aplicação web responsiva (NFR-01).
- **Vite 8:** desenvolvimento e build da aplicação, conforme configuração e scripts existentes.
- **Tailwind CSS 3:** estilos responsivos sem introduzir uma camada adicional de componentes. A responsividade deve funcionar a partir de 320 px (NFR-01).
- **Fetch API:** chamadas HTTPS diretas às APIs da Open-Meteo, sem cliente HTTP adicional ou backend intermediário (NFR-07).
- **Vitest e React Testing Library:** testes unitários e de componentes; já disponíveis nas dependências do projeto.
- **Playwright:** testes dos fluxos no navegador; já disponível nas dependências do projeto.
- **Biome:** lint e formatação conforme configuração e scripts existentes.

A escolha de Tailwind CSS é uma decisão técnica, não um requisito de produto. A matriz de navegadores e versões continua pendente de aprovação (NFR-05; Open Questions).

# Project Structure

Estrutura proposta, alinhada ao stack existente. Os nomes de arquivos são contratos organizacionais, não uma exigência de implementação:

```text
src/
  app/          Composição da aplicação e estado dos fluxos
  components/   Componentes de busca, seleção, clima e previsão
  services/     Acesso HTTP e normalização das respostas Open-Meteo
  types/        Contratos de domínio e estados da interface
  utils/        Formatação pt-BR e conversão de temperatura
  styles/       Estilos globais e regras responsivas
tests/
  unit/         Testes de serviços, utilitários e componentes
  e2e/          Cenários Playwright dos fluxos principais
```

Manter a aplicação sem camadas adicionais de repositório, cache ou backend reduz complexidade; introduzi-las só se requisitos posteriores justificarem.

# Data Model

Contratos de domínio propostos. Valores meteorológicos podem estar ausentes; a interface deve manter os campos disponíveis e identificar os ausentes como “Dados indisponíveis”, sem estimativas (AC-15; Edge Cases).

```ts
type TemperatureUnit = "celsius" | "fahrenheit";

interface City {
  id: number;
  name: string;
  region?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface CurrentWeather {
  observedAt?: string;
  temperatureC: number | null;
  weatherCode: number | null;
}

interface ForecastDay {
  date: string;
  weatherCode: number | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
}

interface WeatherData {
  city: City;
  current: CurrentWeather;
  days: ForecastDay[];
  timezone?: string;
}

type SearchState =
  | { status: "idle" }
  | { status: "loading"; query: string }
  | { status: "success"; results: City[] }
  | { status: "empty"; query: string }
  | { status: "error"; query: string };

type WeatherState =
  | { status: "idle" }
  | { status: "loading"; city: City }
  | { status: "success"; data: WeatherData }
  | { status: "error"; city: City };
```

`City.id` corresponde ao identificador retornado pelo geocoding; região e país fornecem contexto para distinguir localidades homônimas (AC-02). `weatherCode` é o código WMO recebido da API; sua apresentação textual em pt-BR requer mapeamento local de códigos, sem alterar o dado de origem.

Os campos indicados como opcionais ou anuláveis não implicam aprovação do escopo meteorológico mínimo: essa decisão continua aberta (AC-04, AC-05, AC-15; Open Questions).

# Data Flow

1. O usuário informa uma cidade. A aplicação remove apenas espaços externos; campo vazio ou composto apenas por espaços não gera requisição e exibe “Informe uma cidade” (AC-13, AC-14).
2. A aplicação registra a busca em andamento e chama o serviço de geocoding com o termo preservado. Durante a solicitação, exibe “Carregando...” (AC-08).
3. Uma resposta vazia produz o estado `empty`, mostra “Nenhuma cidade encontrada” e não inicia consulta meteorológica (AC-10).
4. Resultados encontrados são exibidos com cidade, região e país. O usuário seleciona uma localidade (AC-02, AC-03).
5. A seleção dispara a consulta meteorológica por coordenadas. O estado de carregamento é visível até sucesso ou erro (AC-09).
6. O serviço converte a resposta da API para `WeatherData`. A UI apresenta clima atual e cinco datas em ordem cronológica, conforme os campos aprovados; campos ausentes permanecem explicitamente indisponíveis (AC-04, AC-05, AC-15).
7. A alternância de unidade atualiza os valores visíveis sem alterar a cidade selecionada (AC-07). A preferência inicia em Celsius (AC-06).
8. Em consultas concorrentes, somente a resposta associada à seleção mais recente pode atualizar a interface (Edge Cases).

# External APIs

As chamadas serão diretas, por HTTPS, à Open-Meteo. A cobertura geográfica e os termos de uso precisam ser validados antes do lançamento (Assumptions; Open Questions; Risks).

**Geocoding**

- Endpoint: `https://geocoding-api.open-meteo.com/v1/search`
- Parâmetros: `name` com o termo de busca aparado; `language=pt`; `format=json`; `count` opcional para limitar resultados.
- A quantidade de resultados a solicitar não está definida na especificação. Usar o padrão da API inicialmente ou aprovar um limite antes de fixá-lo como requisito.
- Campos de resposta usados: `id`, `name`, `admin1` quando disponível, `country`, `country_code`, `latitude`, `longitude` e `timezone`.
- Resultado vazio é distinto de falha de transporte ou resposta de erro (AC-10, AC-11).

**Forecast**

- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Parâmetros: `latitude` e `longitude` da cidade selecionada; `current=temperature_2m,weather_code`; `daily=weather_code,temperature_2m_max,temperature_2m_min`; `temperature_unit=celsius`; `timezone=auto`; `forecast_days=5`.
- `timezone=auto` permite interpretar o dia de referência no fuso da localidade, conforme AC-05 e Edge Cases.
- Campos consumidos: `current.time`, `current.temperature_2m`, `current.weather_code`, `daily.time`, `daily.weather_code`, `daily.temperature_2m_min` e `daily.temperature_2m_max`.
- Consultar em Celsius e converter para Fahrenheit na apresentação evita uma segunda chamada ao alternar a unidade. A precisão e o arredondamento da conversão permanecem decisões em aberto (Open Questions).
- Se uma cidade for localizada, mas não houver dados meteorológicos, manter a seleção e informar indisponibilidade; não substituir por outra localidade (Edge Cases).

# State Management

O estado viverá na aplicação React e será mantido em memória durante a sessão. Não se propõe biblioteca externa de estado para estes fluxos simples.

Estados separados de busca e consulta meteorológica permitem distinguir carregamento, vazio e falha. A busca, a cidade selecionada, os dados meteorológicos e a unidade ativa devem permanecer disponíveis para correção e nova tentativa, conforme NFR-06.

A unidade começa em Celsius (AC-06). Persisti-la entre sessões ou reiniciá-la a cada acesso é uma decisão pendente; até aprovação, o plano não assume persistência local (Assumptions; Open Questions). Não há persistência no servidor (NFR-08).

Para evitar atualização por resposta obsoleta, associar cada solicitação a seu termo ou cidade e ignorar respostas que não correspondam à seleção atual. Essa regra atende ao caso de consultas concorrentes sem exigir uma camada de cache (Edge Cases).

# Error Handling

- **Busca em andamento:** mostrar “Carregando...” e removê-lo quando a solicitação terminar (AC-08).
- **Campo inválido:** exibir “Informe uma cidade”; não chamar nenhuma API (AC-13).
- **Busca sem resultados:** exibir “Nenhuma cidade encontrada” e manter a busca disponível (AC-10).
- **Falha de geocoding:** exibir “Não foi possível buscar cidades” e oferecer “Tentar novamente”; não tratar a falha como resultado vazio (AC-11).
- **Falha meteorológica:** exibir “Não foi possível carregar os dados meteorológicos” e oferecer “Tentar novamente”, mantendo a cidade selecionada (AC-11, NFR-06).
- **Retry:** repetir a busca com o termo anterior ou a consulta com a cidade selecionada, conforme o fluxo que falhou (AC-12).
- **Dados incompletos:** exibir os campos recebidos e sinalizar os ausentes como “Dados indisponíveis”; não inventar valores (AC-15).
- **Timeout:** 10 segundos é o limite proposto pela especificação, não uma decisão aprovada. Se confirmado, timeout deve encerrar o carregamento, exibir a mensagem de erro correspondente e permitir nova tentativa (AC-16; Open Questions).
- **Cidade sem cobertura meteorológica:** preservar a localidade selecionada e comunicar que não há dados disponíveis para ela (Edge Cases).

Todas as mensagens e ações da interface serão em pt-BR (FR-09; AC-17).

# Testing Strategy

**Vitest e React Testing Library**

- Testar aparo de espaços externos e preservação de acentos, apóstrofos e demais caracteres do termo enviado (AC-13, AC-14).
- Testar mapeamento de respostas de geocoding, contexto de região e país, lista vazia e falha da API (AC-01, AC-02, AC-10, AC-11).
- Testar conversão de temperatura para os valores de referência de 0 °C, 20 °C e -40 °C, sem fixar precisão de apresentação ainda não aprovada (AC-07; Open Questions).
- Testar normalização de previsão de cinco datas, ordenação cronológica, dados parciais e mapeamento de códigos meteorológicos (AC-05, AC-15).
- Testar estados de carregamento, vazio, erro, retry e validação de mensagens em pt-BR (AC-08–AC-17).
- Testar que resposta antiga não sobrescreve a cidade selecionada mais recentemente (Edge Cases).

**Playwright**

- Cobrir o fluxo de busca, distinção e seleção de cidades homônimas e exibição dos dados correspondentes (US-01, US-03).
- Cobrir clima atual, cinco dias de previsão e alternância de unidade (US-01, US-02, US-04).
- Cobrir busca sem resultados, falhas de geocoding e meteorologia e nova tentativa (US-05).
- Executar testes com respostas de API controladas para evitar dependência da disponibilidade externa.
- Validar fluxo por teclado, foco, nomes acessíveis e layout em 320 px; a meta WCAG 2.2 AA é proposta e depende de aprovação (NFR-01, NFR-03; Open Questions).
- Definir matriz de navegadores, perfil de rede/dispositivo e critérios de medição de desempenho antes de tratar essas verificações como aceite final (NFR-02, NFR-05; Open Questions).

# Risks & Trade-offs

- **Dependência da Open-Meteo:** indisponibilidade, alterações, limites ou termos podem afetar a aplicação. Validar cobertura e termos; oferecer mensagens de erro, retry e timeout quando aprovado (NFR-06, NFR-07; Risks).
- **Cobertura e ambiguidade de localidades:** o geocoding pode retornar homônimos ou uma cidade sem dados meteorológicos. Mostrar região e país e nunca trocar silenciosamente a cidade escolhida (AC-02, AC-03; Edge Cases).
- **Dados parciais ou desatualizados:** campos ausentes não devem ser inventados; idade máxima aceitável para chamar os dados de atuais não está definida (AC-15; NFR-09; Open Questions).
- **Escopo meteorológico provisório:** os campos mínimos de clima atual e previsão ainda precisam de aprovação; os contratos devem ser ajustados após essa decisão (AC-04, AC-05, AC-15).
- **Conversão local versus nova consulta:** converter a partir de Celsius simplifica alternância e evita chamadas adicionais; precisão e arredondamento continuam pendentes (AC-07; Open Questions).
- **Preferência de unidade:** estado em memória simplifica a primeira versão, mas não define comportamento após fechar ou reabrir o navegador. Decidir entre persistência local e reinício em Celsius antes de finalizar o requisito (Open Questions).
- **Metas operacionais propostas:** desempenho, disponibilidade, WCAG e matriz de navegadores precisam de perfil, fórmula e aprovação antes de virarem critérios finais (NFR-02–NFR-05; Open Questions).
- **Plataforma:** a hipótese atual é web responsiva. PWA ou aplicativo nativo permanecem fora do escopo inicial até decisão de produto (Assumptions; Out of Scope; Open Questions).
