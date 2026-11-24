# Laboratório de Análise Léxica

Abra `scanner.html`. A interface usa os estilos do laboratório sintático e organiza:

- **Coluna esquerda, parte superior:** definições léxicas editáveis (expressões regulares), botão **Verificar definições**, opção **Restaurar exemplo** e editor com destaque de sintaxe enquanto digita.
- **Coluna esquerda, parte inferior:** código-fonte, botão **Analisar código**, limpeza e exemplos.
- **Coluna direita:** abas **Tokens**, **Autômato (DFA)** e **Transições**.

## Scanner configurável

As definições seguem a forma `NOME = expressão` e aceitam, dentro de um subconjunto didático, `[]`, `()`, `|`, `*`, `+`, `?`, literais entre aspas e referências como `{LETRA}`. Os nomes devem estar em maiúsculas (`A-Z`, algarismos e `_`), começando por letra.

- `DIGITO` e `LETRA`, quando referenciadas por outras regras, são **auxiliares** e não emitem tokens independentes.
- As definições **não referenciadas** (exceto `IGNORAR`) são reconhecedores de tokens. O nome da definição aparece na fita.
- A regra especial `IGNORAR` reconhece e descarta espaços, tabulações e quebras de linha (ou outros padrões que você definir).
- O scanner considera a correspondência mais longa entre as regras; em empate, a primeira regra declarada vence. Alternativas no primeiro nível de `|` também são comparadas pelo maior comprimento. Em construções de regex aninhadas, valem as regras de alternativas do motor JavaScript.
- Alterar as definições invalida a fita anterior. **Analisar código** verifica as regras e só então processa a nova entrada.
- Erros de sintaxe, nomes repetidos, referências ausentes ou cíclicas e regras que aceitam texto vazio impedem a análise.
- O scanner informa lexemas, regra reconhecida, linha e coluna. Não valida estruturas gramaticais nem executa o código.

O exemplo inicial inclui palavras reservadas, identificadores, números inteiros e decimais, operadores, pontuação e `IGNORAR`. Exemplos em múltiplas linhas são inseridos como quebras de linha reais.

## Visualizações de referência

O **Autômato** e a **Tabela de transições** mostram somente identificadores e números. **São fixos** e não mudam quando o estudante altera expressões regulares. Gerar DFA a partir de regex arbitrárias está fora do escopo desta revisão.

## Separação entre os laboratórios

O laboratório sintático continua usando `assets/lexer-core.js` e sua GLC fixa LL(1). As definições personalizadas deste laboratório léxico **não são compartilhadas automaticamente** com o sintático.

## Arquivos principais

- `scanner.html`: interface.
- `scanner.css`: layout e complementos visuais.
- `rules-editor.js`: verificação, expansão de macros e tokenização a partir de regex editadas.
- `scanner.js`: abas, resultados, exemplos e DFAs de referência.


Interface compacta: o editor apresenta cores de sintaxe durante a edição, sem um segundo painel de prévia. O scanner fica diretamente abaixo do editor.

## Leitura por lexema

A aba **Tokens** agora contém um controle curto para avançar pelos **lexemas completos** já reconhecidos. Cada etapa destaca o trecho do código, o token correspondente na fita e a linha da tabela. Isso não altera regras, resultados ou os DFA fixos das outras abas. Use **Anterior**, **Próximo** e **Reiniciar** para explorar sem executar novamente o scanner.
