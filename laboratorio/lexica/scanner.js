/* Interface do laboratório léxico: scanner configurado pelas definições editáveis.
   DFA e tabela de transições são apenas referências didáticas fixas. */
(() => {
   'use strict';
   const $ = s => document.querySelector(s);
   const ruleEngine = window.CompiLabLexRules;
   const source = $('#sourceInput');
   const tabs = [...document.querySelectorAll('.cl-tab[data-view]')];
   const tabPanels = { tokens: $('#tabContent1'), automato: $('#tabContent2'), transicoes: $('#tabContent3') };
   let selectedRule = 'identifier';
   function chooseTab(view) {
      if (!tabPanels[view]) view = 'tokens';
      for (const button of tabs) { const active = button.dataset.view === view; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; }
      for (const [key, panel] of Object.entries(tabPanels)) panel.hidden = key !== view;
      history.replaceState(null, '', '#' + view);
   }
   tabs.forEach((b, i) => {
      b.addEventListener('click', () => chooseTab(b.dataset.view));
      b.addEventListener('keydown', e => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i + tabs.length - 1) % tabs.length; tabs[next].focus(); chooseTab(tabs[next].dataset.view); });
   });
   function el(tag, text, cls) { const node = document.createElement(tag); if (cls) node.className = cls; if (text != null) node.textContent = String(text); return node; }
   let lexStep = 0, lexSession = null;
   function renderLexStep() {
      if (!lexSession) return;
      const { tokens, tape, body, position, preview } = lexSession;
      lexStep = Math.max(0, Math.min(lexStep, tokens.length));
      const token = lexStep ? tokens[lexStep - 1] : null;
      position.textContent = lexStep ? `Lexema ${lexStep} de ${tokens.length}` : `Início · ${tokens.length} lexemas`;
      const prev = lexSession.prev, next = lexSession.next, restart = lexSession.restart;
      prev.disabled = lexStep === 0; restart.disabled = lexStep === 0; next.disabled = lexStep === tokens.length;
      next.textContent = lexStep === tokens.length ? 'Concluído' : 'Próximo →';
      for (const [i, card] of [...tape.children].entries()) {
         card.classList.toggle('cl-lex-step-current', i === lexStep - 1);
         card.classList.toggle('cl-lex-step-done', i < lexStep - 1);
         if (i === lexStep - 1) card.setAttribute('aria-current', 'step'); else card.removeAttribute('aria-current');
      }
      for (const [i, row] of [...body.children].entries()) {
         row.classList.toggle('cl-lex-step-current', i === lexStep - 1);
         row.classList.toggle('cl-lex-step-done', i < lexStep - 1);
      }
      preview.replaceChildren();
      if (!token) { preview.append(el('span', 'Clique em Próximo para observar o primeiro lexema.')); return; }
      const info = el('p', token.name === 'ERRO' ? `Trecho não reconhecido na linha ${token.line}, coluna ${token.column}.` : `${JSON.stringify(token.value)} → ${token.name} · linha ${token.line}, coluna ${token.column}.`, 'cl-lex-step-info');
      const code = el('code', null, 'cl-lex-step-code'); const offset = token.offset;
      const start = Math.max(0, offset - 25), end = Math.min(source.value.length, offset + token.value.length + 25);
      const before = source.value.slice(start, offset), after = source.value.slice(offset + token.value.length, end);
      code.append(document.createTextNode((start ? '…' : '') + before));
      const mark = el('mark', token.value); code.append(mark, document.createTextNode(after + (end < source.value.length ? '…' : '')));
      preview.append(info, code);
   }
   function makeLexStepPlayer(tokens, tape, body) {
      const box = el('section', null, 'cl-lex-stepper'); box.setAttribute('aria-label', 'Simulação por lexema');
      const heading = el('div', null, 'cl-lex-step-heading'); heading.append(el('strong', 'Leitura por lexema'));
      const counter = el('span', null, 'cl-lex-step-counter'); heading.append(counter);
      const preview = el('div', null, 'cl-lex-step-preview');
      const controls = el('div', null, 'cl-lex-step-controls');
      const restart = el('button', '↺ Reiniciar', 'cl-btn cl-btn-secondary'), prev = el('button', '← Anterior', 'cl-btn cl-btn-secondary'), next = el('button', 'Próximo →', 'cl-btn cl-btn-primary');
      for (const b of [restart, prev, next]) b.type = 'button'; controls.append(restart, prev, next);
      box.append(heading, preview, controls);
      lexStep = 0; lexSession = { tokens, tape, body, position: counter, preview, prev, next, restart };
      prev.addEventListener('click', () => { lexStep--; renderLexStep(); });
      next.addEventListener('click', () => { lexStep++; renderLexStep(); });
      restart.addEventListener('click', () => { lexStep = 0; renderLexStep(); });
      renderLexStep(); return box;
   }
   function render() {
      const dest = $('#lexical-result'), status = $('#lexical-status'); dest.replaceChildren(); status.replaceChildren(); lexSession = null; lexStep = 0;
      const definitions = ruleEngine.checkRules(true);
      if (!definitions.valid) {
         const msg = el('div', null, 'cl-status is-error'); msg.setAttribute('role', 'alert');
         msg.append(el('span', null, 'cl-dot'), el('span', 'Corrija as definições léxicas à esquerda para analisar o código.'));
         status.append(msg); dest.append(el('p', 'A análise não foi executada porque as regras estão inválidas.', 'cl-empty'));
         return;
      }
      if (!source.value.trim()) { dest.append(el('p', 'Digite um trecho de código antes de analisar.', 'cl-empty')); return; }
      let tokens;
      try { tokens = ruleEngine.tokenize(source.value, definitions); } catch (error) {
         const msg = el('div', null, 'cl-status is-error'); msg.setAttribute('role', 'alert');
         msg.append(el('span', null, 'cl-dot'), el('span', error.message)); status.append(msg); return;
      }
      const errors = tokens.filter(t => t.kind === 'error');
      const box = el('div', null, 'cl-status' + (errors.length ? ' is-error' : '')); box.setAttribute('role', 'status');
      box.append(el('span', null, 'cl-dot'), el('span', errors.length
         ? `${tokens.length - errors.length} token(s) reconhecido(s) e ${errors.length} trecho(s) não reconhecido(s) pelas definições atuais.`
         : `${tokens.length} token(s) reconhecido(s) com as definições do editor. Isso não garante que o código seja sintaticamente válido.`));
      status.append(box);
      const tape = el('div', null, 'cl-token-strip'); tape.setAttribute('aria-label', 'Fita de tokens');
      const wrap = el('div', null, 'cl-table-scroll'), table = el('table', null, 'cl-data-table'), head = el('thead'), hrow = el('tr');
      for (const col of ['Lexema', 'Regra reconhecida', 'Linha', 'Coluna']) hrow.append(el('th', col)); head.append(hrow); table.append(head);
      const body = el('tbody'); for (const t of tokens) {
         const card = el('span', null, 'cl-token-card'); card.dataset.kind = t.kind; card.append(el('span', t.value), el('small', t.name === 'ERRO' ? 'Não reconhecido' : t.name)); tape.append(card);
         const row = el('tr'); for (const v of [t.value, t.name === 'ERRO' ? 'Não reconhecido' : t.name, t.line, t.column]) row.append(el('td', v)); body.append(row);
      } table.append(body); wrap.append(table); dest.append(makeLexStepPlayer(tokens, tape, body), tape, wrap);
   }
   const automata = {
      identifier: { title: 'Identificador: [A-Za-z_][A-Za-z0-9_]*', headers: ['Letra ou _', 'Dígito', 'Outro'], rows: [['q0 (inicial)', 'q1', '—', '—'], ['q1 (aceitação)', 'q1', 'q1', '—']], svg: `<svg viewBox="0 0 600 170" role="img" aria-label="Autômato de identificador: q0 passa para q1 com letra ou sublinhado; q1 aceita letras, dígitos e sublinhados"><defs><marker id="lab-arr-i" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#43557d"/></marker></defs><path d="M30 101 H129" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-i)"/><circle cx="169" cy="101" r="38" fill="#ecf1ff" stroke="#6079d3" stroke-width="2"/><text x="169" y="106" font-family="sans-serif" font-size="19" text-anchor="middle" fill="#2846a0">q0</text><path d="M207 101 H375" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-i)"/><text x="291" y="90" font-family="sans-serif" text-anchor="middle" font-size="13" fill="#36425b">letra / _</text><circle cx="420" cy="101" r="38" fill="#e7f8ef" stroke="#059669" stroke-width="2"/><circle cx="420" cy="101" r="32" fill="none" stroke="#059669" stroke-width="2"/><text x="420" y="106" font-family="sans-serif" font-size="19" text-anchor="middle" fill="#047857">q1</text><path d="M397 73 C365 0 475 0 443 73" fill="none" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-i)"/><text x="420" y="22" font-size="12" font-family="sans-serif" text-anchor="middle" fill="#36425b">letra / dígito / _</text></svg>` },
      number: { title: 'Número: [0-9]+(\\.[0-9]+)?', headers: ['Dígito', 'Ponto .', 'Outro'], rows: [['q0 (inicial)', 'q1', '—', '—'], ['q1 (aceitação)', 'q1', 'q2', '—'], ['q2', 'q3', '—', '—'], ['q3 (aceitação)', 'q3', '—', '—']], svg: `<svg viewBox="0 0 750 190" role="img" aria-label="Autômato de número: q0 para q1 com dígito; q1 aceita e permite mais dígitos, ponto para q2, dígito para q3 que aceita decimais"><defs><marker id="lab-arr-n" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#43557d"/></marker></defs><path d="M12 114 H74" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-n)"/><circle cx="109" cy="114" r="32" fill="#ecf1ff" stroke="#6079d3" stroke-width="2"/><text x="109" y="120" font-size="18" font-family="sans-serif" text-anchor="middle" fill="#2846a0">q0</text><path d="M141 114 H228" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-n)"/><text x="183" y="100" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#36425b">dígito</text><circle cx="263" cy="114" r="32" fill="#e7f8ef" stroke="#059669" stroke-width="2"/><circle cx="263" cy="114" r="26" fill="none" stroke="#059669" stroke-width="2"/><text x="263" y="120" font-size="18" text-anchor="middle" font-family="sans-serif" fill="#047857">q1</text><path d="M242 89 C207 16 317 16 284 89" fill="none" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-n)"/><text x="263" y="37" font-size="12" font-family="sans-serif" text-anchor="middle" fill="#36425b">dígito</text><path d="M295 114 H379" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-n)"/><text x="338" y="100" font-family="sans-serif" text-anchor="middle" font-size="12" fill="#36425b">.</text><circle cx="414" cy="114" r="32" fill="#ecf1ff" stroke="#6079d3" stroke-width="2"/><text x="414" y="120" font-size="18" text-anchor="middle" font-family="sans-serif" fill="#2846a0">q2</text><path d="M446 114 H530" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-n)"/><text x="488" y="100" text-anchor="middle" font-size="12" font-family="sans-serif" fill="#36425b">dígito</text><circle cx="565" cy="114" r="32" fill="#e7f8ef" stroke="#059669" stroke-width="2"/><circle cx="565" cy="114" r="26" fill="none" stroke="#059669" stroke-width="2"/><text x="565" y="120" font-size="18" text-anchor="middle" font-family="sans-serif" fill="#047857">q3</text><path d="M544 89 C510 16 620 16 586 89" fill="none" stroke="#43557d" stroke-width="2" marker-end="url(#lab-arr-n)"/><text x="565" y="37" font-size="12" font-family="sans-serif" text-anchor="middle" fill="#36425b">dígito</text></svg>` }
   };
   function drawRule() {
      const data = automata[selectedRule];
      $('#lex-rule-description').textContent = data.title;
      $('#lex-dfa').innerHTML = data.svg;
      const host = $('#lex-transition-table'); host.replaceChildren(); const table = el('table', null, 'cl-data-table'), thead = el('thead'), r = el('tr'); for (const h of ['Estado', ...data.headers]) r.append(el('th', h)); thead.append(r); table.append(thead); const body = el('tbody'); for (const cells of data.rows) { const row = el('tr'); for (const v of cells) row.append(el('td', v)); body.append(row); } table.append(body); host.append(table);
      document.querySelectorAll('[data-rule]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.rule === selectedRule)));
   }
   document.querySelectorAll('[data-rule]').forEach(b => b.addEventListener('click', () => { selectedRule = b.dataset.rule; drawRule(); }));
   document.querySelectorAll('[data-code]').forEach(b => b.addEventListener('click', () => { source.value = b.dataset.code.replace(/\\n/g, '\n'); render(); chooseTab('tokens'); }));
   $('#btnExecuteScan').addEventListener('click', () => { render(); chooseTab('tokens'); });
   $('#btnReset').addEventListener('click', () => { source.value = ''; $('#lexical-result').replaceChildren(el('p', 'Digite um trecho de código e clique em “Analisar código”.', 'cl-empty')); $('#lexical-status').replaceChildren(); chooseTab('tokens'); source.focus(); });
   source.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); render(); chooseTab('tokens'); } });
   source.addEventListener('input', () => { $('#lexical-status').replaceChildren(); $('#lexical-result').replaceChildren(el('p', 'Entrada modificada. Clique em “Analisar código” para atualizar os tokens.', 'cl-empty')); });
   $('#lexRulesInput').addEventListener('ruleschanged', () => { $('#lexical-status').replaceChildren(); $('#lexical-result').replaceChildren(el('p', 'Definições alteradas. Execute a análise para atualizar os tokens.', 'cl-empty')); });
   drawRule(); render(); chooseTab(location.hash.slice(1) || 'tokens');
})();
