/* Atividade de classificação dos sete lexemas do exemplo.*/
(() => {
  const tokens = [
    { id: 'let', category: 'keyword', name: 'Palavra reservada', symbol: '◆', meaning: '“let” é uma palavra reservada que inicia uma declaração de variável.' },
    { id: 'total', category: 'ident', name: 'Identificador', symbol: '●', meaning: '“total” é um nome escolhido para a variável declarada.' },
    { id: '=', category: 'op', name: 'Operador', symbol: '+', meaning: '“=” é o operador que atribui um valor à variável.' },
    { id: 'preco', category: 'ident', name: 'Identificador', symbol: '●', meaning: '“preco” identifica um valor utilizado na expressão.' },
    { id: '*', category: 'op', name: 'Operador', symbol: '+', meaning: '“*” indica uma operação de multiplicação.' },
    { id: '2', category: 'num', name: 'Número', symbol: '■', meaning: '“2” é uma constante numérica escrita diretamente no código.' },
    { id: ';', category: 'punct', name: 'Pontuação', symbol: '▲', meaning: '“;” é o delimitador que encerra a instrução.' }
  ];
  const byId = Object.fromEntries(tokens.map(token => [token.id, token]));
  const required = tokens.map(token => token.id);
  const solved = new Set();
  const choices = [...document.querySelectorAll('.cat-btn')];
  const codeButtons = [...document.querySelectorAll('.code-token')];
  const promptToken = document.getElementById('active-prompt-token');
  const title = document.getElementById('active-prompt-title');
  const subtitle = document.getElementById('active-prompt-subtitle');
  const hint = document.getElementById('pedagogical-hint');
  const hintTitle = document.getElementById('hint-title');
  const hintDesc = document.getElementById('hint-desc');
  const hintClue = document.getElementById('hint-clue');
  const success = document.getElementById('pedagogical-success');
  const successTitle = document.getElementById('success-title');
  const successDesc = document.getElementById('success-desc');
  const ribbon = document.getElementById('classified-tokens-ribbon');
  const next = document.getElementById('continue-step-btn');
  if (!promptToken || !title || !choices.length || !next) return;
  let active = 'let';

  function showHint(heading, message, tip) {
    success.classList.add('hidden'); hint.classList.remove('hidden');
    hintTitle.textContent = heading; hintDesc.textContent = message;
    hintClue.textContent = tip;
  }
  function showSuccess(message) {
    hint.classList.add('hidden'); success.classList.remove('hidden');
    successTitle.textContent = 'Correto!'; successDesc.textContent = message;
  }
  function drawRibbon() {
    ribbon.replaceChildren();
    tokens.filter(token => solved.has(token.id)).forEach(token => {
      const badge = document.createElement('span');
      badge.className = 'cl-reviewed-token';
      badge.dataset.category = token.category;
      badge.textContent = `${token.symbol} ${token.id} · ${token.name}`;
      ribbon.appendChild(badge);
    });
  }
  function drawCode() {
    codeButtons.forEach(button => {
      const id = button.dataset.tokenId;
      button.className = 'code-token cl-token-code cursor-pointer px-2.5 py-1 rounded-md font-mono transition-all';
      button.classList.toggle('cl-token-active', id === active);
      button.classList.toggle('cl-token-solved', solved.has(id));
      if (solved.has(id)) button.dataset.tokenCategory = byId[id].category;
      else delete button.dataset.tokenCategory;
      button.setAttribute('aria-pressed', String(id === active));
      button.setAttribute('aria-label', `Selecionar lexema ${id}${solved.has(id) ? ', classificado' : ''}`);
    });
  }
  function selectToken(id) {
    if (!byId[id]) return;
    active = id; promptToken.textContent = id;
    subtitle.textContent = solved.has(id)
      ? 'Este lexema já foi classificado. Escolha outro para continuar.'
      : 'Escolha a categoria correspondente ao lexema destacado.';
    choices.forEach(b => {
      b.classList.remove('cl-category-good', 'cl-category-wrong');
      b.setAttribute('aria-pressed', 'false');
    });
    hint.classList.add('hidden'); success.classList.add('hidden');
    if (solved.has(id)) {
      // A classificação permanece evidente quando se revisita um lexema.
      const chosenOption = choices.find(button => button.dataset.category === byId[id].category);
      if (chosenOption) {
        chosenOption.classList.add('cl-category-good');
        chosenOption.setAttribute('aria-pressed', 'true');
      }
      showSuccess(byId[id].meaning);
    }
    drawCode();
  }
  choices.forEach(button => {
    button.addEventListener('click', () => {
      const token = byId[active]; const chosen = button.dataset.category;
      // Tokens classificados são somente consultáveis; não podem ser reclassificados.
      if (solved.has(active)) return;
      choices.forEach(b => {
        b.classList.remove('cl-category-good', 'cl-category-wrong');
        b.setAttribute('aria-pressed', 'false');
      });
      if (chosen === token.category) {
        solved.add(active); button.classList.add('cl-category-good');
        button.setAttribute('aria-pressed', 'true');
        showSuccess(token.meaning); drawRibbon(); drawCode();
        subtitle.textContent = solved.size === tokens.length
          ? 'Todos os lexemas foram classificados. Você pode continuar.'
          : 'Selecione outro lexema para continuar a classificação.';
      } else {
        button.classList.add('cl-category-wrong');
        button.setAttribute('aria-pressed', 'true');
        const clues = {
          keyword: 'Palavras reservadas são termos definidos pela linguagem, como “let”.',
          ident: 'Identificadores são nomes usados para variáveis, como “total” e “preco”.',
          op: 'Operadores representam ações como atribuição (=) e multiplicação (*).',
          num: 'Números representam valores escritos diretamente, como “2”.',
          punct: 'Pontuação delimita partes da escrita do programa, como “;”.'
        };
        showHint('Observe a função do lexema', `“${active}” não pertence à categoria selecionada.`,
          `Pista: ${clues[token.category]}`);
      }
    });
  });
  codeButtons.forEach(button => button.addEventListener('click', () => selectToken(button.dataset.tokenId)));
  next.addEventListener('click', () => {
    const missing = required.filter(id => !solved.has(id));
    if (!missing.length) { window.location.href = 'resultado-passo-3.html'; return; }
    const pending = missing[0]; selectToken(pending);
    showHint('Antes de continuar', `Falta classificar “${pending}”.`,
      'Todos os sete tokens precisam ser classificados. Observe o lexema destacado e escolha sua categoria.');
  });
  hint?.setAttribute('aria-live', 'polite');
  success?.setAttribute('aria-live', 'polite');
  selectToken('let');
})();
