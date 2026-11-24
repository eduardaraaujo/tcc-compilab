/* Reconhecedor léxico compartilhado pelos dois laboratórios.
   Regras fixas e ordem de prioridade: espaços, números, identificadores,
   operadores mais longos, pontuação. Não interpreta a sintaxe da linguagem. */
(function (global) {
  'use strict';
  const words = new Set(['let', 'const', 'var', 'if', 'else', 'return', 'true', 'false', 'while', 'for']);
  const rules = [
    ['whitespace', /\s+/y],
    ['number', /\d+(?:\.\d+)?/y],
    ['identifier', /[A-Za-z_][A-Za-z0-9_]*/y],
    ['operator', /(?:===|!==|==|!=|<=|>=|&&|\|\||[=+*\/<>!%\-])/y],
    ['punctuation', /[;(){},:]/y]
  ];
  const labels = { keyword: 'Palavra reservada', identifier: 'Identificador', number: 'Número', operator: 'Operador', punctuation: 'Pontuação', error: 'Não reconhecido' };
  function tokenize(source) {
    const tokens = []; let index = 0, line = 1, column = 1;
    while (index < source.length) {
      let matched = null;
      for (const [kind, re] of rules) { re.lastIndex = index; const m = re.exec(source); if (m) { matched = { kind, value: m[0] }; break; } }
      if (!matched) matched = { kind: 'error', value: source[index] };
      const start = index, tokenLine = line, tokenCol = column;
      for (const ch of matched.value) { if (ch === '\n') { line++; column = 1; } else column++; }
      index += matched.value.length;
      if (matched.kind === 'whitespace') continue;
      if (matched.kind === 'identifier' && words.has(matched.value)) matched.kind = 'keyword';
      tokens.push({ ...matched, offset: start, line: tokenLine, column: tokenCol });
    }
    return tokens;
  }
  global.CompiLabLexer = Object.freeze({ tokenize, labels });
})(window);
