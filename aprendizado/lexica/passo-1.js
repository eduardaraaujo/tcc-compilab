/* Atividade de expressões regulares e testador de identificadores. */
let regexAnswerCorrect = false;

function selectOption(choice) {
  regexAnswerCorrect = choice === 'a';
  for (const opt of ['a', 'b', 'c', 'd']) {
    const button = document.getElementById(`opt-${opt}`);
    if (!button) continue;
    button.classList.toggle('cl-choice-correct', opt === choice && regexAnswerCorrect);
    button.classList.toggle('cl-choice-wrong', opt === choice && !regexAnswerCorrect);
    button.classList.add('cl-lesson-choice');
    button.setAttribute('aria-pressed', String(opt === choice));
  }
  const feedback = document.getElementById('feedback-box');
  feedback.classList.remove('hidden');
  feedback.setAttribute('aria-live', 'polite');
  feedback.className = regexAnswerCorrect
    ? 'cl-lesson-feedback cl-feedback-good'
    : 'cl-lesson-feedback cl-feedback-try';


  const mensagens = {
    a: `
    <strong>Correto!</strong>
    <p>
      A primeira parte, <code>[a-zA-Z_]</code>, exige
      uma letra ou sublinhado no início. A segunda,
      <code>[a-zA-Z0-9_]*</code>, permite letras,
      números e sublinhados nas posições seguintes.
      O asterisco representa zero ou mais repetições.
    </p>
  `,

    b: `
    <strong>Atenção ao primeiro caractere!</strong>
    <p>
      A expressão <code>[0-9]+[a-zA-Z]*</code>
      exige que o identificador comece com pelo menos
      um número. Entretanto, nossa regra não permite
      identificadores iniciados por dígitos.
      Por exemplo, <code>2total</code> seria aceito
      por essa expressão, mas é inválido.
    </p>
  `,

    c: `
    <strong>Essa expressão é muito restritiva.</strong>
    <p>
      A expressão <code>[a-z]+</code> reconhece
      somente sequências de letras minúsculas.
      Ela rejeitaria identificadores válidos como
      <code>total2</code>, <code>Preco</code>
      e <code>_valor</code>.
      Precisamos aceitar também maiúsculas,
      sublinhados e números após o primeiro caractere.
    </p>
  `,

    d: `
    <strong>Essa expressão é muito abrangente.</strong>
    <p>
      A expressão <code>.*</code> permite qualquer
      sequência de caracteres, inclusive uma sequência
      vazia. Assim, aceitaria entradas como
      <code>2total</code> e <code>@valor</code>,
      que não respeitam a regra dos identificadores.
      Uma expressão regular precisa limitar
      quais caracteres são permitidos.
    </p>
  `
  };

  feedback.innerHTML = mensagens[choice];
  document.getElementById('lex-step-required').hidden = true;
}

function validateIdentifier(value) {
  const status = document.getElementById('tester-status');
  if (!status) return;
  const valid = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
  status.className = valid
    ? 'cl-tester-status cl-tester-valid'
    : (value.trim() ? 'cl-tester-status cl-tester-invalid' : 'cl-tester-status');
  status.textContent = value.trim() ? (valid ? 'Reconhecido' : 'Inválido') : 'Aguardando...';
}

document.addEventListener('DOMContentLoaded', () => {
  for (const option of document.querySelectorAll('#options-group button')) {
    option.classList.add('cl-lesson-choice');
    option.setAttribute('aria-pressed', 'false');
  }
  // Navegação sequencial: não pular etapas pela barra superior.
  // O bloqueio vale somente para seguir à frente; revisar os passos anteriores é livre.
  document.querySelectorAll('a[href="passo-2.html"], a[href="passo-3.html"]').forEach(next => next.addEventListener('click', (event) => {
    const jumpingAhead = next.getAttribute('href') === 'passo-3.html';
    if (!jumpingAhead && regexAnswerCorrect) return;
    event.preventDefault();
    const notice = document.getElementById('lex-step-required');
    notice.textContent = jumpingAhead && regexAnswerCorrect
      ? 'Siga para Autômatos (DFA) antes de Classificação de tokens.'
      : 'Responda corretamente à atividade de expressões regulares antes de avançar.';
    notice.hidden = false;
    notice.setAttribute('tabindex', '-1');
    notice.focus({ preventScroll: true });
    notice.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }));
  const tester = document.getElementById('tester-input');
  if (tester) validateIdentifier(tester.value);
});
