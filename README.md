# Cubo · laboratório visual de SQL

Abra `index.html` em um navegador moderno. Não requer instalação, build ou servidor. Fontes do Google são opcionais: a interface usa fontes locais se estiver offline.

Em telas acima de 900 px, o cubo permanece visível à esquerda enquanto controles, resultados e agrupamentos rolam à direita. Sua altura se adapta à janela para acompanhar as mudanças também em notebooks. Em telas menores, os painéis seguem em uma coluna.

## Como explorar

1. Arraste o cubo com mouse ou toque; com o canvas focado, use as setas. O botão Girar ativa rotação contínua.
2. Desative dimensões para transformar o cubo em um plano 2D, uma linha 1D e um total 0D. Apenas os eixos preservados aparecem; a composição da soma é mostrada em texto, sem reintroduzir blocos 3D nos níveis reduzidos.
3. Selecione uma célula no desenho ou uma linha da tabela para ver a soma correspondente.
4. Compare GROUP BY, ROLLUP e CUBE. O mapa de agrupamentos permite escolher cada nível; ROLLUP preserva os prefixos da ordem região, produto, trimestre.
5. Alterne entre o SQL da operação completa e o nível visualizado. Baixe um exemplo com os dados em uma CTE para executar no PostgreSQL.

## Dados e semântica

São 12 vendas fictícias: 3 regiões × 2 produtos × 2 trimestres, total de R$ 1.960. Cada nível conserva esse total. GROUP BY consulta um conjunto escolhido; ROLLUP gera 4 conjuntos e 22 linhas; CUBE gera 8 conjuntos e 36 linhas. Não se devem somar linhas de diferentes níveis para calcular o total geral.

Na interface, “Todos” representa a dimensão agregada. No SQL completo, essa posição recebe NULL e GROUPING permite identificar a agregação. A tabela mostra somente o nível selecionado; os subtotais são calculados em JavaScript, sem conexão a um banco de dados. O SQL baixado permite reproduzi-los no PostgreSQL.

Referência: https://www.postgresql.org/docs/current/queries-table-expressions.html#QUERIES-GROUPING-SETS

## Arquivos

- `index.html`: estrutura e conteúdo em português.
- `style.css`: layout responsivo e estilos.
- `app.js`: dados, agregações, SQL e projeção 3D em Canvas, sem bibliotecas.

Validação: sintaxe JavaScript; oito conjuntos de agrupamento e conservação do total; contagem das linhas de ROLLUP e CUBE; seleção sincronizada com a tabela; rotação e layout móvel no navegador.
