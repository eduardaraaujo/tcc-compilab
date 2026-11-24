/* Definições léxicas editáveis: validação e tokenização por maior correspondência.
   Subconjunto didático de regex JavaScript; não converte regex arbitrária em DFA. */
(function (global) {
  'use strict';
  const editor = document.getElementById('lexRulesInput');
  if (!editor) return;
  const statusHost = document.getElementById('lex-rules-status');
  const detailsHost = document.getElementById('lex-rules-details');
  const highlighted = document.getElementById('lex-rules-highlight');
  const codeMirror = document.getElementById('lexRulesEditor');
  const initial = editor.value;

  function lineError(line, message) { return { line, message }; }
  function escapeLiteral(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function regexSource(expr, resolve) {
    let output = '', quote = null, inClass = false;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (quote !== null) {
        if (ch === quote) { quote = null; continue; }
        if (ch === '\\' && i + 1 < expr.length) {
          const next = expr[++i];
          output += escapeLiteral(next === 'n' ? '\n' : next === 't' ? '\t' : next === 'r' ? '\r' : next);
        } else output += escapeLiteral(ch);
        continue;
      }
      if (inClass) {
        output += ch;
        if (ch === '\\' && i + 1 < expr.length) output += expr[++i];
        else if (ch === ']') inClass = false;
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '[') { inClass = true; output += ch; continue; }
      if (ch === '{') {
        const end = expr.indexOf('}', i + 1);
        if (end < 0) throw Error('Referência aberta sem fechar: use {NOME}.');
        const name = expr.slice(i + 1, end);
        if (!/^[A-Z][A-Z0-9_]*$/.test(name)) throw Error(`Nome inválido na referência {${name}}.`);
        output += '(?:' + resolve(name) + ')';
        i = end;
        continue;
      }
      if (/\s/.test(ch)) continue;
      if (ch === '\\' && i + 1 < expr.length) output += ch + expr[++i];
      else output += ch;
    }
    if (quote !== null) throw Error('Texto literal sem aspas de fechamento.');
    if (inClass) throw Error('Classe de caracteres sem ] de fechamento.');
    return output;
  }

  function topLevelAlternatives(expr) {
    const pieces = []; let start = 0, depth = 0, inClass = false, quote = null;
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '\\' && i + 1 < expr.length) { i++; continue; }
      if (quote) { if (ch === quote) quote = null; continue; }
      if (inClass) { if (ch === ']') inClass = false; continue; }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (ch === '[') { inClass = true; continue; }
      if (ch === '(') { depth++; continue; }
      if (ch === ')') { depth = Math.max(0, depth - 1); continue; }
      if (ch === '|' && depth === 0) { pieces.push(expr.slice(start, i)); start = i + 1; }
    }
    pieces.push(expr.slice(start)); return pieces;
  }

  function verify(text) {
    const definitions = new Map(), errors = [], referenced = new Set();
    const rows = text.split(/\r?\n/);
    if (text.length > 10000) errors.push(lineError(0, 'Limite de 10.000 caracteres nas definições.'));
    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i].trim();
      if (!raw || raw.startsWith('//') || raw.startsWith('#')) continue;
      const match = /^([A-Z][A-Z0-9_]*)\s*=\s*(.+)$/.exec(raw);
      if (!match) { errors.push(lineError(i + 1, 'Use NOME = expressão regular.')); continue; }
      const [, name, expr] = match;
      if (definitions.has(name)) { errors.push(lineError(i + 1, `${name} já aparece na linha ${definitions.get(name).line}.`)); continue; }
      definitions.set(name, { expr: expr.trim(), line: i + 1 });
    }
    if (definitions.size === 0) errors.push(lineError(0, 'Inclua pelo menos uma definição.'));
    if (definitions.size > 40) errors.push(lineError(0, 'Use no máximo 40 definições.'));
    const cache = new Map(), resolving = new Set();
    function expand(name) {
      if (!definitions.has(name)) throw Error(`Referência {${name}} não definida.`);
      if (cache.has(name)) return cache.get(name);
      if (resolving.has(name)) throw Error(`Referência circular envolvendo ${name}.`);
      resolving.add(name);
      try {
        const pattern = regexSource(definitions.get(name).expr, ref => { referenced.add(ref); return expand(ref); });
        if (pattern.length > 15000) throw Error('Expressão expandida muito extensa. Simplifique as referências.');
        const regex = new RegExp(pattern, 'y');
        for (const test of ['', 'a', '0', ' ', '=', 'let']) {
          regex.lastIndex = 0;
          const match = regex.exec(test);
          if (match && match[0].length === 0) throw Error('A regra reconhece texto vazio; um token deve consumir caracteres.');
        }
        cache.set(name, pattern);
        return pattern;
      } finally { resolving.delete(name); }
    }
    for (const [name, rule] of definitions) {
      try { expand(name); } catch (e) { errors.push(lineError(rule.line, `${name}: ${e.message}`)); }
    }
    const activeRules = [];
    for (const [name, rule] of definitions) {
      if (name !== 'IGNORAR' && (referenced.has(name) || name === 'LETRA' || name === 'DIGITO')) continue;
      if (cache.has(name)) {
        // Compara todas as alternativas de nível superior para preservar a
        // correspondência mais longa, inclusive quando uma alternativa é prefixo de outra.
        const alternatives = topLevelAlternatives(rule.expr).map(expr => regexSource(expr, ref => cache.get(ref)));
        activeRules.push({ name, pattern: cache.get(name), alternatives, line: rule.line, skip: name === 'IGNORAR' });
      }
    }
    if (activeRules.every(rule => rule.skip)) errors.push(lineError(0, 'Crie pelo menos uma regra de token, como ID = {LETRA}({LETRA}|{DIGITO})* ou NUM = {DIGITO}+. LETRA e DIGITO são classes auxiliares.'));
    errors.sort((a, b) => a.line - b.line);
    return {
      valid: errors.length === 0, errors, count: definitions.size, names: [...definitions.keys()],
      patterns: Object.fromEntries(cache), activeRules, macros: [...referenced].filter(name => definitions.has(name) && name !== 'IGNORAR')
    };
  }

  function tokenize(text, verified) {
    if (!verified?.valid) throw Error('Verifique as definições antes de analisar o código.');
    if (text.length > 20000) throw Error('O scanner aceita até 20.000 caracteres por análise.');
    const patterns = verified.activeRules.flatMap(rule => rule.alternatives.map(pattern => ({ ...rule, regex: new RegExp(pattern, 'y') })));
    const tokens = []; let offset = 0, line = 1, column = 1;
    while (offset < text.length) {
      let matched = null;
      for (const rule of patterns) {
        rule.regex.lastIndex = offset;
        const match = rule.regex.exec(text);
        if (!match || match[0].length === 0) continue;
        if (!matched || match[0].length > matched.value.length) matched = { name: rule.name, value: match[0], skip: rule.skip };
      }
      if (!matched) {
        // Um fragmento sem regra não é uma sequência de tokens de um caractere.
        // Consuma de uma vez um identificador inválido (ex.: 'abc123' sem ID),
        // sem absorver operadores/pontuação válidos que venham depois.
        const start = text[offset];
        let end = offset + 1;
        if (/[A-Za-z_]/.test(start)) {
          while (end < text.length && /[A-Za-z0-9_]/.test(text[end])) end++;
        } else if (/[0-9]/.test(start)) {
          while (end < text.length && /[0-9._A-Za-z]/.test(text[end])) end++;
        } else if (!/\s/.test(start)) {
          while (end < text.length && !/\s/.test(text[end])) {
            let canStartToken = false;
            for (const rule of patterns) { rule.regex.lastIndex = end; const m = rule.regex.exec(text); if (m && m[0].length) { canStartToken = true; break; } }
            if (canStartToken || /[A-Za-z0-9_]/.test(text[end])) break;
            end++;
          }
        }
        matched = { name: 'ERRO', value: text.slice(offset, end), skip: false };
      }
      const startLine = line, startCol = column, startOffset = offset;
      for (let j = 0; j < matched.value.length; j++) {
        const ch = matched.value[j];
        if (ch === '\n') { line++; column = 1; }
        else if (ch === '\r') { if (text[startOffset + j + 1] !== '\n') { line++; column = 1; } }
        else column++;
      }
      offset += matched.value.length;
      if (!matched.skip) tokens.push({
        value: matched.value, name: matched.name,
        kind: classifyRule(matched.name), line: startLine, column: startCol, offset: startOffset
      });
      if (tokens.length > 5000) throw Error('Limite de 5.000 tokens atingido. Reduza a entrada.');
    }
    return tokens;
  }
  function classifyRule(name) {
    if (name === 'ERRO') return 'error';
    if (/^(?:PALAVRA_RESERVADA|KEYWORD|RESERVADA|KW)$/.test(name)) return 'keyword';
    if (/^(?:ID|IDENTIFICADOR)$/.test(name)) return 'identifier';
    if (/^(?:NUM|NUMERO|NÚMERO)$/.test(name)) return 'number';
    if (/^(?:OP_|OPERADOR)/.test(name)) return 'operator';
    if (/^(?:PONTUACAO|DELIMITADOR|SEPARADOR)$/.test(name)) return 'punctuation';
    return 'custom';
  }

  function el(tag, value, cls) { const n = document.createElement(tag); if (cls) n.className = cls; if (value != null) n.textContent = String(value); return n; }
  function showVerification(result) {
    statusHost.replaceChildren(); detailsHost.replaceChildren();
    const box = el('div', null, 'cl-status' + (result.valid ? '' : ' is-error'));
    box.setAttribute('role', 'status');
    const message = result.valid
      ? `${result.count} definições válidas. ${result.activeRules.filter(r => !r.skip).length} regra(s) de tokens pronta(s) para o scanner.`
      : `${result.errors.length} problema(s) encontrado(s) nas definições.`;
    box.append(el('span', null, 'cl-dot'), el('span', message)); statusHost.append(box);
    if (!result.valid) {
      const list = el('ul'); for (const e of result.errors) {
        const item = el('li', null, 'is-error'); item.append(el('span', e.line ? 'Linha ' + e.line : 'Geral', 'cl-rule-line'), el('span', e.message)); list.append(item);
      } detailsHost.append(list);
    }
  }
  function appendHighlighted(parent, text) {
    const pattern = /(\{[A-Z][A-Z0-9_]*\}|\[(?:\\.|[^\]\\])*\]|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/g;
    let index = 0, match;
    while ((match = pattern.exec(text))) {
      if (match.index > index) parent.append(document.createTextNode(text.slice(index, match.index)));
      const value = match[0]; const type = value.startsWith('{') ? 'syntax-reference' : value.startsWith('[') ? 'syntax-class' : 'syntax-string';
      parent.append(el('span', value, type)); index = match.index + value.length;
    }
    if (index < text.length) parent.append(document.createTextNode(text.slice(index)));
  }
  function renderPreview() {
    if (!highlighted) return;
    highlighted.replaceChildren();
    for (const [index, line] of editor.value.split(/\r?\n/).entries()) {
      if (index) highlighted.append(document.createTextNode('\n'));
      const pair = /^(\s*)([A-Z][A-Z0-9_]*)(\s*=\s*)(.*)$/.exec(line);
      if (pair) {
        highlighted.append(document.createTextNode(pair[1]), el('span', pair[2], 'syntax-name'), document.createTextNode(pair[3]));
        appendHighlighted(highlighted, pair[4]);
      } else if (line.trim().startsWith('//') || line.trim().startsWith('#')) highlighted.append(el('span', line, 'syntax-comment'));
      else appendHighlighted(highlighted, line);
    }
  }
  function syncEditorScroll() {
    if (!highlighted) return;
    const mirror = highlighted.parentElement;
    mirror.scrollTop = editor.scrollTop;
    mirror.scrollLeft = editor.scrollLeft;
  }
  function checkRules(show = true) { const result = verify(editor.value); if (show) showVerification(result); return result; }
  document.getElementById('btnCheckRules').addEventListener('click', () => checkRules(true));
  document.getElementById('btnDefaultRules').addEventListener('click', () => {
    editor.value = initial; statusHost.replaceChildren(); detailsHost.replaceChildren(); renderPreview();
    syncEditorScroll(); editor.dispatchEvent(new Event('ruleschanged')); editor.focus();
  });
  editor.addEventListener('input', () => {
    statusHost.replaceChildren(); detailsHost.replaceChildren(); renderPreview(); syncEditorScroll(); editor.dispatchEvent(new Event('ruleschanged'));
  });
  editor.addEventListener('scroll', syncEditorScroll, { passive: true });
  renderPreview();
  if (codeMirror && highlighted) { codeMirror.classList.add('has-highlight'); syncEditorScroll(); }
  global.CompiLabLexRules = Object.freeze({ verify, tokenize, checkRules, classifyRule });
  global.CompiLabLexRuleValidator = Object.freeze({ verify });
})(window);
