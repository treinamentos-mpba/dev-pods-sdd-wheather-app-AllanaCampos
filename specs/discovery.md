# Discovery: Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação para consultar informações meteorológicas por cidade. Usuários precisam encontrar uma cidade, consultar as condições atuais e visualizar a previsão para os próximos cinco dias. A interface também deve permitir alternar entre Celsius e Fahrenheit e funcionar em dispositivos móveis.

Esta análise organiza o briefing inicial. Detalhes sobre fontes de dados, atualização, plataformas e critérios de desempenho ainda precisam ser confirmados.

## Decisões

- **Fonte de dados — Open-Meteo, sem API key:** usar Open-Meteo para obter geocodificação e dados meteorológicos. Isso resolve a escolha do provedor e elimina a necessidade de gerenciar uma chave de API; cobertura, limites de uso e condições de licença ainda devem ser verificados.
- **Período da previsão — hoje + 4 dias:** apresentar cinco dias no total, incluindo o dia atual. Isso esclarece como contar os “5 dias” solicitados.
- **Unidade padrão — Celsius:** exibir temperaturas em Celsius inicialmente; o usuário ainda poderá alternar para Fahrenheit. Isso define o valor inicial da preferência de unidade.
- **Autenticação e persistência — sem autenticação e sem persistência de servidor:** não exigir conta e não armazenar preferências ou dados do usuário em servidor. Isso fecha as dúvidas sobre cadastro e persistência no backend; persistência local no dispositivo não está definida por esta decisão.
- **Idioma da interface — pt-BR:** apresentar textos e mensagens da UI em português brasileiro. Isso define o idioma inicial do produto; formatos regionais e suporte a outros idiomas permanecem fora desta decisão.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade pelo nome.
- **RF-02 — Selecionar cidade:** permitir que o usuário escolha a cidade desejada quando a pesquisa retornar resultados ambíguos ou múltiplos, mostrando contexto suficiente para distingui-los, como região e país.
- **RF-03 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-04 — Consultar previsão:** exibir a previsão para os próximos cinco dias da cidade selecionada.
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
- Resultados com nomes de cidades iguais podem levar à seleção de uma localização incorreta se não houver contexto adicional, como estado ou país.
- Indisponibilidade, limites de uso ou mudanças na API meteorológica podem impedir a consulta de dados.
- O briefing não define a frequência de atualização do clima atual; dados desatualizados podem gerar decisões equivocadas.
- O escopo de “usar em dispositivos móveis” pode ser interpretado de formas diferentes, como site responsivo ou aplicativo nativo.
- Sem critérios de desempenho, compatibilidade e acessibilidade, será difícil validar a qualidade da entrega.
- As metas propostas de desempenho e disponibilidade podem não ser alcançáveis ou adequadas sem considerar a infraestrutura e a dependência do provedor externo.

## Perguntas em Aberto

- Qual fonte de dados meteorológicos deve ser utilizada? Há requisitos de licença, custo ou cobertura?
- A busca deve aceitar apenas cidades ou também localização atual, CEP ou coordenadas?
- Como distinguir cidades com o mesmo nome? Devemos exibir estado, região e país?
- “Previsão de 5 dias” significa cinco dias corridos a partir de hoje ou cinco dias completos?
- Quais informações devem aparecer no clima atual e na previsão, além da temperatura?
- Com que frequência os dados devem ser atualizados?
- A unidade escolhida deve ser mantida entre sessões ou dispositivos?
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