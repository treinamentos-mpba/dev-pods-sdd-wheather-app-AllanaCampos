# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para que usuários possam buscar cidades, consultar o clima atual e a previsão de cinco dias, alternar entre Celsius e Fahrenheit e acessar o serviço em dispositivos móveis. Este é o escopo central apresentado no briefing; critérios de aceitação e detalhes de uso serão definidos nas demais seções do discovery.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade pelo nome.
- **RF-02 — Selecionar cidade:** permitir que o usuário escolha a cidade desejada quando a pesquisa retornar resultados ambíguos ou múltiplos, mostrando contexto suficiente para distingui-los, como região e país.
- **RF-03 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-04 — Consultar previsão:** exibir a previsão de hoje e dos quatro dias seguintes para a cidade selecionada.
- **RF-05 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit e apresentar as temperaturas na unidade escolhida.
- **RF-06 — Informar carregamento:** indicar quando uma busca ou consulta meteorológica estiver em andamento.
- **RF-07 — Informar ausência de resultados:** informar quando a busca não encontrar cidades correspondentes.
- **RF-08 — Informar falhas:** apresentar uma mensagem compreensível quando não for possível consultar os dados meteorológicos e permitir tentar novamente.

## Requisitos Não-Funcionais

- **RNF-01 — Responsividade:** os fluxos principais devem funcionar em larguras de tela a partir de 320 px, sem rolagem horizontal ou perda de conteúdo e controles.
- **RNF-02 — Desempenho:** como meta inicial, 95% das interações da interface devem responder em até 2 segundos em condições de rede acordadas. O tempo de resposta da API externa deve ser medido separadamente.
- **RNF-03 — Acessibilidade:** atender ao nível AA da WCAG 2.2, incluindo operação por teclado, foco visível, nomes acessíveis para controles e contraste adequado.
- **RNF-04 — Disponibilidade:** como meta inicial, manter disponibilidade mensal de 99,5% para a aplicação; definir como falhas do provedor meteorológico entram no cálculo.
- **RNF-05 — Compatibilidade:** suportar os navegadores e versões acordados com o negócio, a serem definidos antes da validação.
- **RNF-06 — Resiliência:** falhas ou demora do provedor meteorológico não devem deixar a interface inutilizável; o usuário deve receber feedback e poder tentar novamente.
- **RNF-07 — Segurança de transporte:** servir a aplicação por HTTPS e usar HTTPS nas comunicações com serviços externos.

## Riscos

- A fonte de dados pode não oferecer cobertura ou precisão suficientes para todas as cidades pesquisadas.
- A Open-Meteo pode não oferecer cobertura ou precisão suficientes para todas as cidades pesquisadas.
- Resultados com nomes de cidades iguais podem levar à seleção de uma localização incorreta se não houver contexto adicional, como estado ou país.
- Indisponibilidade, limites de uso ou mudanças na API meteorológica podem impedir a consulta de dados.
- O briefing não define a frequência de atualização do clima atual; dados desatualizados podem gerar decisões equivocadas.
- O escopo de “usar em dispositivos móveis” pode ser interpretado de formas diferentes, como site responsivo ou aplicativo nativo.
- Sem critérios de desempenho, compatibilidade e acessibilidade, será difícil validar a qualidade da entrega.
- Sem metas aprovadas de desempenho, uma lista de navegadores suportados e critérios de validação acordados, será difícil avaliar a qualidade da entrega.
- As metas propostas de desempenho e disponibilidade podem não ser alcançáveis ou adequadas sem considerar a infraestrutura e a dependência do provedor externo.

## Perguntas em Aberto

- Qual fonte de dados meteorológicos deve ser utilizada? Há requisitos de licença, custo ou cobertura?
- A cobertura da Open-Meteo atende às localidades-alvo? Seus termos de uso são adequados para o produto?
- A busca deve aceitar apenas cidades ou também localização atual, CEP ou coordenadas?
- Como distinguir cidades com o mesmo nome? Devemos exibir estado, região e país?
- “Previsão de 5 dias” significa cinco dias corridos a partir de hoje ou cinco dias completos?
- Quais informações devem aparecer no clima atual e na previsão, além da temperatura?
- Com que frequência os dados devem ser atualizados?
- A unidade escolhida deve ser mantida entre sessões ou dispositivos?
- A unidade escolhida deve ser mantida localmente entre sessões no mesmo navegador ou reiniciada em Celsius? Não haverá sincronização por servidor.
- O produto deve ser um site responsivo, um aplicativo instalável ou ambos?
- Quais navegadores e versões devem ser suportados?
- As metas iniciais de desempenho (95% das interações em até 2 segundos) e disponibilidade (99,5% ao mês) são aceitáveis? Como medir cada uma e contabilizar a indisponibilidade da API externa?
- O nível AA da WCAG 2.2 é o padrão de acessibilidade esperado?

## Suposições

- A primeira versão será uma aplicação web responsiva, utilizável em navegadores móveis e desktop.
- O usuário buscará cidades pelo nome e selecionará um resultado antes de consultar o clima.
- A previsão será exibida para a cidade selecionada e terá cinco dias.
- A alternância de unidade afetará os valores de temperatura exibidos, sem alterar os dados meteorológicos subjacentes.
- A aplicação dependerá de um serviço externo para obter condições atuais e previsão.
- Não foram solicitados cadastro, autenticação, histórico de buscas, notificações ou personalização além da unidade de temperatura.
- Os detalhes ainda não confirmados neste documento, inclusive as metas quantitativas propostas, devem ser validados antes de se tornarem critérios definitivos de implementação.

## Decisões

- **D-01 — Fonte de dados: Open-Meteo, sem API key.** Justificativa: define o provedor para clima atual e previsão sem exigir gerenciamento de chave de API. Resolve a pergunta sobre qual fonte usar; cobertura para as localidades-alvo e termos de uso ainda devem ser confirmados.
- **D-02 — Período da previsão: hoje e os quatro dias seguintes.** Justificativa: estabelece uma janela de cinco dias com regra explícita. Resolve a ambiguidade sobre o significado de “previsão de 5 dias”.
- **D-03 — Unidade padrão: Celsius.** Justificativa: define a unidade inicial, mantendo disponível a alternância para Fahrenheit prevista em RF-05. Resolve qual unidade apresentar por padrão; a persistência da escolha continua em aberto.
- **D-04 — Sem autenticação e sem persistência de dados no servidor.** Justificativa: mantém o produto utilizável sem conta e limita o escopo de backend e tratamento de dados de usuário. Resolve se haverá login e armazenamento de preferências no servidor; a persistência local no navegador ainda precisa ser decidida.
- **D-05 — Idioma da interface: pt-BR.** Justificativa: define o idioma inicial de navegação e conteúdo. Resolve qual idioma a interface deve apresentar.

## Personas (Hipóteses)

As personas abaixo são hipóteses iniciais derivadas do briefing e devem ser validadas com usuários representativos.

### Persona 1 — Camila, a pessoa que se desloca diariamente

- **Objetivo principal:** saber rapidamente como está o tempo e o que esperar nos próximos dias para se preparar para o deslocamento e escolher o que vestir.
- **Contexto de uso:** principalmente no celular, antes de sair de casa ou durante o trajeto; consulta a cidade onde mora.
- **Métrica de sucesso percebida:** consegue encontrar a cidade e entender a temperatura e a condição atual em até 30 segundos, sem precisar repetir a busca.

### Persona 2 — Rafael, quem planeja passeios

- **Objetivo principal:** escolher um dia adequado para uma atividade considerando a previsão dos próximos cinco dias.
- **Contexto de uso:** principalmente em desktop, ao planejar com antecedência; pode voltar ao celular para uma consulta rápida.
- **Métrica de sucesso percebida:** consegue identificar e comparar as condições dos cinco dias e escolher quando fazer a atividade sem confundir datas ou unidades.

### Persona 3 — Joana, quem consulta o tempo em deslocamento

- **Objetivo principal:** verificar o clima de outra cidade e compreender a previsão mesmo quando está fora de casa ou usando uma unidade diferente da preferência inicial.
- **Contexto de uso:** principalmente no celular, em consultas rápidas durante viagens; pode usar desktop para planejar antes de partir.
- **Métrica de sucesso percebida:** encontra a localidade correta entre resultados semelhantes e alterna a unidade de temperatura com clareza, sem perder a cidade selecionada.

As métricas são propostas qualitativas ou de usabilidade, não metas de produto aprovadas. Devem ser refinadas e validadas em pesquisa com usuários.