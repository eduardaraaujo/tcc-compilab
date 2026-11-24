# Laboratório Sintático — simulação LL(1)

A gramática fixa fica no cartão superior esquerdo, com o analisador logo abaixo. As abas de resultados ficam à direita: Tokens, Árvore de derivação, FIRST, FOLLOW e Tabela LL(1).

## Simular

1. Digite uma ou mais declarações `let` e clique em **Analisar código**.
2. A simulação começa na etapa zero, com `$ S` na pilha.
3. Use **Próximo**, **Anterior** ou **Reiniciar**, agora em uma **barra flutuante acessível durante a rolagem**. A pilha e a entrada no painel mostram o estado após cada ação.
4. Em **Tokens**, veja o próximo token e os já consumidos. Em **Árvore de derivação**, veja os nós surgirem por produção. Em **Tabela LL(1)**, veja a célula consultada e a explicação do papel de FIRST/FOLLOW.
5. Em **Tabela LL(1)**, consulte o **Registro completo de ações**, sempre visível abaixo da tabela preditiva. Clique em uma linha para retornar à etapa correspondente.

## Escopo e erros

O parser e a tabela são calculados sobre a GLC fixa já usada nas trilhas. A simulação funciona tanto para entradas aceitas quanto para entradas sintaticamente inválidas, mostrando o último estado e uma árvore parcial. Erros léxicos devem ser corrigidos antes de iniciar. O laboratório não edita GLCs arbitrárias, não executa análise semântica nem produz AST.
