/* Parser preditivo top-down LL(1), com gramática fixa da trilha sintática.
   Gera a tabela por FIRST/FOLLOW e usa a mesma tabela para traço e árvore de derivação. */
(() => {
   'use strict';
   const $ = s => document.querySelector(s);
   const lexer = window.CompiLabLexer;
   const input = $('#syntax-input');
   const stepDock = $('.cl-step-buttons');
   const dockCount = $('#step-dock-count');
   stepDock.hidden = true;
   const rules = {
      S: [['D', 'L']],
      L: [['D', 'L'], []],
      D: [['let', 'id', '=', 'E', ';']],
      E: [['T', "E'"]],
      "E'": [['+', 'T', "E'"], ['-', 'T', "E'"], []],
      T: [['F', "T'"]],
      "T'": [['*', 'F', "T'"], ['/', 'F', "T'"], []],
      F: [['(', 'E', ')'], ['-', 'F'], ['id'], ['num']]
   };
   const nts = Object.keys(rules), ntSet = new Set(nts), start = 'S', EPS = 'ε';
   const columns = ['let', 'id', '=', 'num', '+', '-', '*', '/', '(', ')', ';', '$'];
   function firstOf(seq, first) {
      const out = new Set(); if (!seq.length) { out.add(EPS); return out; }
      let nullable = true;
      for (const symbol of seq) {
         const set = ntSet.has(symbol) ? first[symbol] : new Set([symbol]);
         for (const t of set) if (t !== EPS) out.add(t);
         if (!set.has(EPS)) { nullable = false; break; }
      }
      if (nullable) out.add(EPS);
      return out;
   }
   function buildGrammar() {
      const first = Object.fromEntries(nts.map(n => [n, new Set()]));
      let changed = true;
      while (changed) { changed = false; for (const [nt, alts] of Object.entries(rules)) for (const rhs of alts) { for (const term of firstOf(rhs, first)) if (!first[nt].has(term)) { first[nt].add(term); changed = true; } } }
      const follow = Object.fromEntries(nts.map(n => [n, new Set()])); follow[start].add('$');
      changed = true;
      while (changed) {
         changed = false; for (const [nt, alts] of Object.entries(rules)) for (const rhs of alts) for (let i = 0; i < rhs.length; i++) {
            const current = rhs[i]; if (!ntSet.has(current)) continue;
            const tail = firstOf(rhs.slice(i + 1), first);
            const desired = new Set([...tail].filter(t => t !== EPS));
            if (tail.has(EPS)) for (const t of follow[nt]) desired.add(t);
            for (const t of desired) if (!follow[current].has(t)) { follow[current].add(t); changed = true; }
         }
      }
      const table = Object.fromEntries(nts.map(n => [n, {}])); let occupied = 0;
      for (const [nt, alts] of Object.entries(rules)) for (const rhs of alts) {
         const lookahead = firstOf(rhs, first), expected = new Set([...lookahead].filter(t => t !== EPS));
         if (lookahead.has(EPS)) for (const t of follow[nt]) expected.add(t);
         for (const t of expected) {
            if (table[nt][t]) throw new Error('Conflito LL(1): ' + nt + ' / ' + t);
            table[nt][t] = rhs; occupied++;
         }
      }
      return { first, follow, table, occupied };
   }
   const grammar = buildGrammar();
   function rhsText(rhs) { return rhs.length ? rhs.join(' ') : EPS; }
   function el(tag, value, cls) { const e = document.createElement(tag); if (cls) e.className = cls; if (value != null) e.textContent = String(value); return e; }
   function status(target, msg, error = false, info = false) { target.replaceChildren(); const b = el('div', undefined, 'cl-status' + (error ? ' is-error' : info ? ' is-info' : '')); b.setAttribute('role', 'status'); b.append(el('span', undefined, 'cl-dot'), el('span', msg)); target.append(b); }
   function renderGrammar() {
      const host = $('#lab-grammar'); host.replaceChildren();
      for (const [nt, alts] of Object.entries(rules)) {
         const line = el('div', undefined, 'cl-syn-grammar-line');
         line.append(el('span', nt.padEnd(2), 'cl-nt'), el('span', ' → ', 'cl-arrow'));
         alts.forEach((rhs, i) => {
            if (i) line.append(el('span', ' | ', 'cl-arrow'));
            if (!rhs.length) { line.append(el('span', EPS, 'cl-epsilon')); return; }
            rhs.forEach((symbol, j) => { if (j) line.append(document.createTextNode(' ')); line.append(el('span', symbol, ntSet.has(symbol) ? 'cl-symbol' : 'cl-literal')); });
         });
         host.append(line);
      }
   }
   function renderTable() {
      const host = $('#fixed-ll1-table'); host.replaceChildren(); const table = el('table', undefined, 'cl-data-table'); table.setAttribute('aria-label', 'Tabela preditiva LL(1) da gramática de referência');
      const header = el('thead'), row = el('tr'); for (const c of ['Não terminal', ...columns]) row.append(el('th', c)); header.append(row); table.append(header); const body = el('tbody');
      for (const nt of nts) { const tr = el('tr'); tr.dataset.nt = nt; tr.append(el('th', nt)); for (const terminal of columns) { const rhs = grammar.table[nt][terminal]; const cell = el('td', rhs === undefined ? '—' : nt + ' → ' + rhsText(rhs)); cell.dataset.lookahead = terminal; tr.append(cell); } body.append(tr); } table.append(body); host.append(table);
   }
   function renderSetTable(targetId, title, sets) {
      const host = $(targetId); host.replaceChildren(); const table = el('table', undefined, 'cl-data-table'); table.setAttribute('aria-label', title); const head = el('thead'), row = el('tr'); for (const c of ['Não terminal', title.startsWith('FIRST') ? 'FIRST' : 'FOLLOW', 'Leitura']) row.append(el('th', c)); head.append(row); table.append(head); const body = el('tbody');
      const notes = {
         'S': 'Programa completo: começa por uma declaração let.',
         'L': 'Lista de declarações; pode continuar com let ou encerrar por ε.',
         'D': 'Declaração let completa.',
         'E': 'Expressão aritmética.',
         "E'": 'Continuação opcional com soma ou subtração.',
         'T': 'Termo de maior precedência.',
         "T'": 'Continuação opcional com multiplicação ou divisão.',
         'F': 'Fator: parênteses, menos unário, identificador ou número.'
      };
      for (const nt of nts) { const tr = el('tr'); const ordered = [...(sets[nt] || [])].sort((a, b) => { if (a === EPS) return 1; if (b === EPS) return -1; if (a === '$') return 1; if (b === '$') return -1; return a.localeCompare(b); }); const setText = '{ ' + ordered.join(', ') + ' }'; tr.append(el('th', nt), el('td', setText), el('td', notes[nt] || '—')); body.append(tr); } table.append(body); host.append(table);
   }
   function renderFirstFollow() { renderSetTable('#first-table', 'FIRST de cada não terminal', grammar.first); renderSetTable('#follow-table', 'FOLLOW de cada não terminal', grammar.follow); }
   const views = ['arvore', 'first', 'follow', 'tabela'];
   const tabs = [...document.querySelectorAll('.cl-tab[data-view]')];
   function chooseTab(name) { if (!views.includes(name)) name = 'arvore'; for (const t of tabs) { const active = t.dataset.view === name; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; } for (const v of views) $('#panel-' + v).hidden = v !== name; history.replaceState(null, '', '#' + name); }
   tabs.forEach((b, i) => { b.addEventListener('click', () => chooseTab(b.dataset.view)); b.addEventListener('keydown', e => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return; e.preventDefault(); const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i + tabs.length - 1) % tabs.length; tabs[next].focus(); chooseTab(tabs[next].dataset.view); }); });
   function syntaxTokens(text) {
      const all = lexer.tokenize(text); const valid = new Set([...columns].filter(t => t !== '$'));
      const result = all.map(t => ({ ...t, symbol: t.kind === 'identifier' ? 'id' : t.kind === 'number' ? 'num' : t.value }));
      const bad = result.find(t => t.kind === 'error');
      if (bad) throw Error(`Caractere não reconhecido ${JSON.stringify(bad.value)} na linha ${bad.line}, coluna ${bad.column}.`);
      const unsupported = result.find(t => !valid.has(t.symbol));
      if (unsupported) throw Error(`O token ${JSON.stringify(unsupported.value)} (linha ${unsupported.line}, coluna ${unsupported.column}) não pertence à GLC do laboratório. Use declarações com let e os operadores permitidos.`);
      return result;
   }
   // Cada ação guarda o estado APÓS sua execução. O índice zero é o estado inicial.
   // Nós da árvore têm índices de criação/expansão para desenhar somente o que já foi produzido.
   function predictive(tokens) {
      const stream = [...tokens.map(t => t.symbol), '$']; let index = 0, serial = 0;
      const makeNode = (label, createdStep = 0) => ({ id: ++serial, label, children: [], nonterminal: ntSet.has(label), createdStep, expandedStep: null, consumedStep: null });
      const root = makeNode(start), stack = [{ symbol: '$', node: null }, { symbol: start, node: root }];
      const trace = [];
      const stackText = () => stack.map(e => e.symbol).join(' ') || '∅ (concluída)';
      function record(kind, { before, action, explanation, lookahead, focusId = null, tableNt = null, reason = '', consumedIndex = -1 } = {}) {
         trace.push({ kind, before: before ?? stackText(), stack: stackText(), rest: stream.slice(index).join(' '), inputIndex: index, action, explanation, lookahead: lookahead ?? stream[index], focusId, tableNt, reason, consumedIndex });
      }
      record('start', { action: 'Preparar análise', explanation: 'A pilha começa com $ S. Observe o primeiro token e avance para consultar a tabela LL(1).', focusId: root.id });
      function fail(msg, options = {}) {
         record('error', { ...options, action: 'Erro: entrada não reconhecida', explanation: msg });
         return { trace, tree: root, accepted: false, error: msg };
      }
      for (let count = 0; count < 2000; count++) {
         const top = stack[stack.length - 1], look = stream[index], before = stackText();
         if (!top) return fail('A pilha terminou antes da análise ser concluída.', { before, lookahead: look });
         if (top.symbol === '$' && look === '$') {
            stack.pop(); record('accept', { before, lookahead: look, action: 'Aceitar entrada', explanation: 'Pilha e entrada chegaram ao fim. Todas as produções foram aplicadas e todos os tokens foram consumidos.' });
            return { trace, tree: root, accepted: true, error: null };
         }
         if (!ntSet.has(top.symbol)) {
            if (top.symbol !== look) {
               const found = look === '$' ? 'fim da entrada' : JSON.stringify(tokens[index]?.value ?? look);
               const at = tokens[index] ? `linha ${tokens[index].line}, coluna ${tokens[index].column}` : 'fim da entrada';
               return fail(`Era esperado ${JSON.stringify(top.symbol)}, mas foi encontrado ${found} (${at}).`, { before, lookahead: look, focusId: top.node?.id || null });
            }
            stack.pop(); if (top.node) { top.node.lexeme = tokens[index]?.value || top.symbol; top.node.consumedStep = trace.length; }
            const lexeme = tokens[index]?.value ?? top.symbol;
            index++;
            record('consume', { before, lookahead: look, focusId: top.node?.id || null, consumedIndex: index - 1, action: 'Consumir ' + top.symbol, explanation: `O terminal ${top.symbol} no topo da pilha coincide com ${JSON.stringify(lexeme)} na entrada. O token é consumido e a pilha avança.` });
            continue;
         }
         const rhs = grammar.table[top.symbol][look];
         if (rhs === undefined) {
            const expected = Object.keys(grammar.table[top.symbol]);
            const found = look === '$' ? 'fim da entrada' : JSON.stringify(tokens[index]?.value ?? look);
            return fail(`Não há produção de ${top.symbol} para ${found}. Esperado: ${expected.join(', ')}.`, { before, lookahead: look, tableNt: top.symbol, focusId: top.node?.id || null, reason: `A célula M[${top.symbol}, ${look}] está vazia; o parser não pode escolher uma produção.` });
         }
         stack.pop(); const stepIndex = trace.length;
         const children = rhs.length ? rhs.map(symbol => makeNode(symbol, stepIndex)) : [makeNode(EPS, stepIndex)];
         top.node.children = children; top.node.expandedStep = stepIndex;
         for (let i = rhs.length - 1; i >= 0; i--)stack.push({ symbol: rhs[i], node: children[i] });
         const f = firstOf(rhs, grammar.first);
         const usesFollow = f.has(EPS) && !f.has(look);
         const reason = usesFollow
            ? `ε pertence a FIRST(${top.symbol} → ${rhsText(rhs)}) e ${look} pertence a FOLLOW(${top.symbol}). Por isso, a tabela aponta a produção vazia.`
            : `${look} pertence a FIRST(${top.symbol} → ${rhsText(rhs)}). A célula M[${top.symbol}, ${look}] seleciona esta produção.`;
         record('expand', { before, lookahead: look, tableNt: top.symbol, focusId: top.node.id, reason, action: `${top.symbol} → ${rhsText(rhs)}`, explanation: `O topo da pilha é ${top.symbol} e o próximo token é ${look}. O parser consulta M[${top.symbol}, ${look}], expande o nó da árvore e coloca os símbolos da produção na pilha.` });
      }
      return fail('O limite de ações foi atingido. Reduza o código de entrada.');
   }
   function drawTokens(tokens) {
      const dest = $('#syntax-tokens'); dest.replaceChildren(); if (!tokens.length) { dest.append(el('p', 'Nenhum token encontrado.', 'cl-empty')); return; }
      const table = el('table', undefined, 'cl-data-table'), head = el('thead'), row = el('tr'); for (const v of ['Lexema', 'Token', 'Linha', 'Coluna']) row.append(el('th', v)); head.append(row); table.append(head); const body = el('tbody');
      for (let i = 0; i < tokens.length; i++) { const t = tokens[i], tr = el('tr'); tr.dataset.tokenIndex = String(i); const a = el('td'); a.append(el('code', t.value, 'cl-mini-tag ' + (t.kind === 'number' ? 'is-number' : (t.kind === 'operator' ? 'is-op' : '')))); tr.append(a, el('td', t.symbol), el('td', t.line), el('td', t.column)); body.append(tr); } table.append(body); dest.append(table);
   }
   function drawTrace(actions) {
      const dest = $('#syntax-trace'); dest.replaceChildren(); const table = el('table', undefined, 'cl-data-table'); const head = el('thead'), row = el('tr'); for (const v of ['Etapa', 'Pilha antes', 'Entrada restante', 'Ação']) row.append(el('th', v)); head.append(row); table.append(head); const body = el('tbody');
      for (let i = 0; i < actions.length; i++) { const a = actions[i], r = el('tr'); r.dataset.stepIndex = String(i); const jump = el('button', String(i), 'cl-trace-jump'); jump.type = 'button'; jump.setAttribute('aria-label', `Ir à etapa ${i}`); jump.addEventListener('click', () => setStep(i)); const first = el('td'); first.append(jump); r.append(first, el('td', a.before), el('td', a.rest), el('td', a.action)); body.append(r); } table.append(body); dest.append(table);
   }
   const svgNS = 'http://www.w3.org/2000/svg';
   function svg(tag, attrs) { const n = document.createElementNS(svgNS, tag); for (const [k, v] of Object.entries(attrs || {})) n.setAttribute(k, String(v)); return n; }
   function findFirstExpression(node) { if (node.label === 'E') return node; for (const child of node.children) { const v = findFirstExpression(child); if (v) return v; } return null; }
   let lastSession = null, currentStep = 0;
   function visibleTree(node, step) {
      if (!node || node.createdStep > step) return null;
      return { ...node, children: node.expandedStep != null && node.expandedStep <= step ? node.children.map(c => visibleTree(c, step)).filter(Boolean) : [] };
   }
   function drawTree() {
      const dest = $('#syntax-tree'); dest.replaceChildren();
      if (!lastSession) { dest.append(el('p', 'Analise um código para visualizar a árvore.', 'cl-empty')); return; }
      const step = currentStep, scope = $('#tree-scope').value;
      const root = visibleTree(lastSession.tree, step);
      const node = scope === 'program' ? root : findFirstExpression(root);
      if (!node) { dest.append(el('p', 'A primeira expressão ainda não foi alcançada. Avance na simulação ou selecione “Programa completo (S)”.', 'cl-empty')); return; }
      let leafIndex = 0, maxDepth = 0;
      function place(n, d) { n._depth = d; maxDepth = Math.max(maxDepth, d); if (!n.children.length) { n._x = 72 + leafIndex++ * 102; return; } for (const c of n.children) place(c, d + 1); n._x = (n.children[0]._x + n.children[n.children.length - 1]._x) / 2; }
      place(node, 0);
      const width = Math.max(520, leafIndex * 102 + 80), height = (maxDepth + 1) * 90 + 48;
      const image = svg('svg', { viewBox: `0 0 ${width} ${height}`, width, height, role: 'img', 'aria-label': `Árvore parcial de derivação após a etapa ${step} da análise` });
      const focus = lastSession.trace[step]?.focusId;
      function render(n) {
         const x = n._x, y = 44 + n._depth * 90;
         for (const child of n.children) { const cy = 44 + child._depth * 90; image.append(svg('line', { x1: x, y1: y + 22, x2: child._x, y2: cy - 22, stroke: '#a7b5cc', 'stroke-width': '1.7' })); render(child); }
         const consumed = n.consumedStep != null && n.consumedStep <= step;
         const fill = n.nonterminal ? '#eaf0fe' : n.label === EPS ? '#f2f4f8' : consumed ? '#dcfce9' : '#f1f8f4';
         const stroke = n.id === focus ? '#3747d6' : n.nonterminal ? '#8598df' : n.label === EPS ? '#c3ccdc' : '#89cfae';
         image.append(svg('rect', { x: x - 39, y: y - 22, width: 78, height: 44, rx: 11, fill, stroke, 'stroke-width': n.id === focus ? 3 : 1.6 }));
         const detailVisible = consumed && n.lexeme && n.lexeme !== n.label;
         const label = svg('text', { x, y: y + (detailVisible ? -3 : 5), 'text-anchor': 'middle', 'font-family': 'JetBrains Mono,monospace', 'font-size': 13, 'font-weight': '600', fill: '#243e70' }); label.textContent = n.label; image.append(label);
         if (detailVisible) { const detail = svg('text', { x, y: y + 13, 'text-anchor': 'middle', 'font-family': 'JetBrains Mono,monospace', 'font-size': 10, fill: '#3f576d' }); detail.textContent = n.lexeme.length > 11 ? n.lexeme.slice(0, 10) + '…' : n.lexeme; image.append(detail); }
      }
      render(node); dest.append(image);
   }
   function setStep(next) {
      if (!lastSession) return;
      currentStep = Math.max(0, Math.min(next, lastSession.trace.length - 1));
      const data = lastSession.trace[currentStep], lastIndex = lastSession.trace.length - 1;
      $('#step-count').textContent = `Etapa ${currentStep} de ${lastIndex}`; dockCount.textContent = `${currentStep}/${lastIndex}`;
      $('#step-stack').textContent = data.stack;
      $('#step-input').textContent = data.rest;
      $('#step-action').textContent = data.action;
      $('#step-explanation').textContent = data.explanation;
      const reason = $('#step-reason'); reason.hidden = !data.reason; reason.textContent = data.reason;
      const action = $('.cl-step-action'); action.classList.toggle('is-error', data.kind === 'error'); action.classList.toggle('is-success', data.kind === 'accept');
      $('#step-prev').disabled = currentStep === 0; $('#step-reset').disabled = currentStep === 0; $('#step-next').disabled = currentStep === lastIndex;
      $('#step-next').textContent = currentStep === lastIndex ? (lastSession.accepted ? 'Concluído' : 'Erro encontrado') : 'Próximo →';
      for (const row of document.querySelectorAll('#syntax-tokens [data-token-index]')) {
         const i = Number(row.dataset.tokenIndex), isError = data.kind === 'error' && i === data.inputIndex;
         row.classList.toggle('is-current-token', i === data.inputIndex && data.kind !== 'accept' && !isError);
         row.classList.toggle('is-consumed', i < data.inputIndex);
         row.classList.toggle('is-error-token', isError);
         if (i === data.inputIndex) row.setAttribute('aria-current', 'step'); else row.removeAttribute('aria-current');
      }
      for (const row of document.querySelectorAll('#fixed-ll1-table tbody tr')) {
         const isRow = data.tableNt === row.dataset.nt;
         row.classList.toggle('is-ll1-row', isRow);
         for (const cell of row.querySelectorAll('td')) {
            const isCol = data.lookahead === cell.dataset.lookahead;
            cell.classList.toggle('is-ll1-col', Boolean(data.tableNt) && isCol);
            cell.classList.toggle('is-ll1-active', isRow && isCol);
         }
      }
      for (const row of document.querySelectorAll('#syntax-trace [data-step-index]')) {
         const active = Number(row.dataset.stepIndex) === currentStep;
         row.classList.toggle('is-trace-active', active);
         if (active) row.setAttribute('aria-current', 'step'); else row.removeAttribute('aria-current');
      }
      $('#token-message').replaceChildren(); $('#tree-message').replaceChildren();
      if (currentStep === lastIndex) {
         if (lastSession.accepted) { status($('#token-message'), `Entrada aceita: ${lastSession.tokens.length} tokens reconhecidos e ${lastIndex} ações da análise preditiva.`); status($('#tree-message'), 'Derivação concluída. Todas as produções aplicadas aparecem na árvore.'); }
         else { status($('#token-message'), 'A análise sintática encontrou um erro: ' + lastSession.error, true); status($('#tree-message'), 'Árvore parcial até o ponto em que a análise falhou.', true); }
      } else {
         status($('#token-message'), 'Acompanhe os tokens enquanto a análise avança.', false, true);
         status($('#tree-message'), 'Árvore parcial: avance na simulação para expandir os nós.', false, true);
      }
      drawTree();
   }
   function emptyAll() {
      lastSession = null; currentStep = 0; $('#syntax-player').hidden = true; stepDock.hidden = true;
      $('#token-message').replaceChildren(); $('#tree-message').replaceChildren();
      $('#syntax-tokens').replaceChildren(el('p', 'Digite um código e clique em “Analisar código”.', 'cl-empty'));
      $('#syntax-trace').replaceChildren(el('p', 'Execute uma análise para visualizar as ações.', 'cl-empty'));
      for (const row of document.querySelectorAll('#fixed-ll1-table tbody tr')) { row.classList.remove('is-ll1-row'); for (const cell of row.querySelectorAll('td')) cell.classList.remove('is-ll1-col', 'is-ll1-active'); }
      drawTree();
   }
   function run() {
      const source = input.value; emptyAll();
      if (!source.trim()) { status($('#token-message'), 'Digite pelo menos uma declaração let para analisar.', true); return; }
      let tokens;
      try { tokens = syntaxTokens(source); drawTokens(tokens); } catch (err) {
         const partial = lexer.tokenize(source).map(t => ({ ...t, symbol: t.kind === 'identifier' ? 'id' : t.kind === 'number' ? 'num' : t.value })); drawTokens(partial);
         status($('#token-message'), err.message, true); status($('#tree-message'), 'Corrija o erro léxico antes de iniciar a simulação.', true);
         $('#syntax-trace').replaceChildren(el('p', 'Corrija a entrada para consultar as ações.', 'cl-empty')); return;
      }
      const result = predictive(tokens);
      lastSession = { ...result, tokens }; drawTrace(result.trace); $('#syntax-player').hidden = false; stepDock.hidden = false; setStep(0);
   }
   $('#run-syntax').addEventListener('click', () => { run(); chooseTab('arvore'); });
   $('#reset-syntax').addEventListener('click', () => { input.value = ''; emptyAll(); chooseTab('arvore'); input.focus(); });
   document.querySelectorAll('[data-expression]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.expression.replace(/\\n/g, '\n'); run(); chooseTab('arvore'); }));
   input.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); chooseTab('arvore'); } });
   input.addEventListener('input', () => { emptyAll(); $('#syntax-tokens').replaceChildren(el('p', 'Entrada alterada. Execute novamente para atualizar os resultados.', 'cl-empty')); });
   $('#tree-scope').addEventListener('change', drawTree);
   $('#step-prev').addEventListener('click', () => setStep(currentStep - 1));
   $('#step-next').addEventListener('click', () => setStep(currentStep + 1));
   $('#step-reset').addEventListener('click', () => setStep(0));

   renderGrammar(); renderFirstFollow(); renderTable(); run(); chooseTab(location.hash.slice(1));
   window.CompiLabSyntacticLabTest = Object.freeze({
      getCellCount: () => grammar.occupied,
      getFirst: nt => [...(grammar.first[nt] || [])], getFollow: nt => [...(grammar.follow[nt] || [])],
      parse: source => { const result = predictive(syntaxTokens(source)); if (!result.accepted) throw Error(result.error); return result; },
      simulate: source => predictive(syntaxTokens(source)),
      getCurrentStep: () => currentStep,
      getStepCount: () => lastSession ? lastSession.trace.length - 1 : 0,
      goToStep: setStep,
      getSession: () => lastSession
   });
})();
