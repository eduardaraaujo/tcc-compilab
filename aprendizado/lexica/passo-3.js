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
  const classifications = new Map();
  const isCorrect = id => classifications.get(id) === byId[id].category;
  const correctCount = () => tokens.filter(token => isCorrect(token.id)).length;
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
  const progressionNotice = document.getElementById('lex-step-required');
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
    tokens.filter(token => classifications.has(token.id)).forEach(token => {
      const correct = isCorrect(token.id);
      const badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'cl-reviewed-token';
      badge.dataset.classification = correct ? 'correct' : 'wrong';
      badge.textContent = `${correct ? '✓' : '✕'} ${token.id} · ${token.name}`;
      badge.setAttribute('aria-label', `Reclassificar ${token.id}: ${correct ? 'correto' : 'incorreto'}`);
      badge.addEventListener('click', () => selectToken(token.id));
      ribbon.appendChild(badge);
    });
  }
  function drawCode() {
    codeButtons.forEach(button => {
      const id = button.dataset.tokenId;
      const classified = classifications.has(id);
      button.className = 'code-token cl-token-code cursor-pointer px-2.5 py-1 rounded-md font-mono transition-all';
      button.classList.toggle('cl-token-active', id === active);
      button.classList.toggle('cl-token-solved', classified && isCorrect(id));
      button.classList.toggle('cl-token-incorrect', classified && !isCorrect(id));
      if (classified) button.dataset.classification = isCorrect(id) ? 'correct' : 'wrong';
      else delete button.dataset.classification;
      button.setAttribute('aria-pressed', String(id === active));
      button.setAttribute('aria-label', `Selecionar lexema ${id}${classified ? (isCorrect(id) ? ', correto' : ', incorreto') + ', pode reclassificar' : ''}`);
    });
  }
  function selectToken(id) {
    if (!byId[id]) return;
    active = id;
    promptToken.textContent = id;
    const category = classifications.get(id);
    subtitle.textContent = category
      ? 'Este lexema já foi classificado. Você pode escolher outra categoria para reclassificá-lo.'
      : 'Escolha a categoria correspondente ao lexema destacado.';
    choices.forEach(button => {
      const selected = button.dataset.category === category;
      button.classList.toggle('cl-category-good', selected && isCorrect(id));
      button.classList.toggle('cl-category-wrong', selected && !isCorrect(id));
      button.setAttribute('aria-pressed', String(selected));
    });
    hint.classList.add('hidden');
    success.classList.add('hidden');
    if (category) {
      if (isCorrect(id)) showSuccess(byId[id].meaning);
      else showHint('Classificação incorreta', `“${id}” ainda não foi classificado corretamente.`,
        'Escolha outra categoria para tentar novamente.');
    }
    drawCode();
  }
  choices.forEach(button => {
    button.addEventListener('click', () => {
      const token = byId[active];
      const chosen = button.dataset.category;
      classifications.set(active, chosen);
      if (progressionNotice) progressionNotice.hidden = true;
      choices.forEach(option => {
        const selected = option === button;
        option.classList.toggle('cl-category-good', selected && isCorrect(active));
        option.classList.toggle('cl-category-wrong', selected && !isCorrect(active));
        option.setAttribute('aria-pressed', String(selected));
      });
      if (isCorrect(active)) {
        showSuccess(token.meaning);
        subtitle.textContent = correctCount() === tokens.length
          ? 'Todos os lexemas estão corretos. Você pode continuar.'
          : 'Correto! Selecione outro lexema ou revise esta classificação.';
      } else {
        const clues = {
          keyword: 'Palavras reservadas são termos definidos pela linguagem, como “let”.',
          ident: 'Identificadores são nomes usados para variáveis, como “total” e “preco”.',
          op: 'Operadores representam ações como atribuição (=) e multiplicação (*).',
          num: 'Números representam valores escritos diretamente, como “2”.',
          punct: 'Pontuação delimita partes da escrita do programa, como “;”.'
        };
        showHint('Observe a função do lexema', `“${active}” não pertence à categoria selecionada.`,
          `Pista: ${clues[token.category]}`);
        subtitle.textContent = 'Você pode escolher outra categoria para corrigir a classificação.';
      }
      drawRibbon();
      drawCode();
    });
  });
  codeButtons.forEach(button => button.addEventListener('click', () => selectToken(button.dataset.tokenId)));
  next.addEventListener('click', () => {
    const missing = required.filter(id => !isCorrect(id));
    if (!missing.length) {
      window.location.href = 'resultado-passo-3.html';
      return;
    }
    selectToken(missing[0]);
    if (progressionNotice) {
      progressionNotice.textContent = `Revise a classificação de “${missing[0]}” antes de avançar. Todos os sete lexemas devem estar corretos.`;
      progressionNotice.hidden = false;
      progressionNotice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
  hint?.setAttribute('aria-live', 'polite');
  success?.setAttribute('aria-live', 'polite');
  selectToken('let');
})();
