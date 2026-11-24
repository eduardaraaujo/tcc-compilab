# CompiLab

Plataforma educacional para estudar fundamentos de compiladores, com **trilhas guiadas**, **laboratórios interativos** e **glossário teórico**. Desenvolvida em HTML, CSS e JavaScript, sem dependência de frameworks ou processo de compilação de arquivos.

## Executar

1. Extraia o arquivo `.zip`, preservando as pastas.
2. Abra `index.html` no navegador.

## Onde editar cada parte

| Arquivo ou pasta                        | Conteúdo                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `index.html`                            | Entrada do site, que redireciona para a página inicial                   |
| `inicio/`                               | Página inicial                                                           |
| `aprendizado/index.html`                | Escolha das trilhas                                                      |
| `aprendizado/lexica/`                   | Passos, exercícios e conclusão da trilha léxica                          |
| `aprendizado/sintatica/`                | Passos, exercícios, aprofundamento LL(1) e conclusão da trilha sintática |
| `laboratorio/lexica/scanner.html`       | Editor de definições léxicas, scanner, tokens, DFA e transições          |
| `laboratorio/lexica/rules-editor.js`    | Validação das definições e reconhecimento com regex editadas             |
| `laboratorio/lexica/scanner.js`         | Interface e visualizações do laboratório léxico                          |
| `laboratorio/sintatica/gramaticas.html` | Interface do parser LL(1) e suas abas                                    |
| `laboratorio/sintatica/lab.js`          | FIRST/FOLLOW, tabela preditiva, parser e simulação sincronizada          |
| `glossario/`                            | Consulta teórica com busca e filtros                                     |
| `assets/`                               | Estilos compartilhados, ícones e reconhecedor léxico da etapa sintática  |
| `manifest.json`                         | Relação das páginas e dos redirecionamentos do projeto                   |

Os estilos e scripts específicos de cada tela ficam, quando aplicável, ao lado do respectivo HTML. Os arquivos HTML de redirecionamento nos laboratórios foram mantidos para não quebrar links que apontem diretamente às abas.

## Como funcionam as atividades

**Trilhas:** os exercícios exigem a resposta correta para avançar ao assunto seguinte. As demonstrações progressivas não precisam ser concluídas para avançar. Em *Pilha, entrada e ação*, a pergunta é obrigatória, mas revelar todas as linhas da simulação é opcional.

**Laboratório léxico:** o editor permite escrever definições regulares com referências como `{LETRA}`. O scanner utiliza essas regras, identifica lexemas completos e apresenta posição e classe de cada token. As visualizações de DFA e transições são exemplos de referência e **não são geradas a partir das regras editadas**.

**Laboratório sintático:** usa uma GLC fixa para declarações `let` e expressões aritméticas. FIRST, FOLLOW, tabela LL(1), ações da pilha e árvore de derivação são calculados para a entrada analisada. **Anterior**, **Próximo** e **Reiniciar** controlam a mesma execução; o registro completo das ações fica visível na aba da Tabela LL(1). O laboratório sintático não usa automaticamente as definições personalizadas no léxico.

**Glossário & Teoria:** explica análise léxica, sintática e as demais fases de compiladores. Conteúdos sobre análise semântica, otimização e geração de código são **teóricos**: essas fases não são executadas pelos laboratórios.

## Gramática do laboratório sintático

```text
S  → D L
L  → D L | ε
D  → 'let' id '=' E ';'
E  → T E'
E' → '+' T E' | '-' T E' | ε
T  → F T'
T' → '*' F T' | '/' F T' | ε
F  → '(' E ')' | '-' F | id | num
```

O projeto não oferece edição de gramáticas sintáticas arbitrárias, interpretação semântica, geração de código, perfil, salvamento de progresso ou gamificação.

## Orientações para manutenção

- Mantenha os nomes e caminhos dos arquivos ao modificar as telas, pois os links entre elas são relativos.
- Ao alterar a GLC sintática, revise também a tabela LL(1), os exemplos da trilha e os testes de aceitação; a gramática atual está incorporada ao parser.
- Se modificar o editor léxico, valide a regra **IGNORAR**, as referências entre definições e a regra de correspondência mais longa.
- Confira os fluxos em desktop e celular e teste entradas corretas, incompletas e inválidas antes de compartilhar outra versão.
