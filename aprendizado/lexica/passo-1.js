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
  feedback.innerHTML = regexAnswerCorrect
    ? '<strong>Correto!</strong><p>A primeira parte, <code>[a-zA-Z_]</code>, exige letra ou sublinhado no início. A segunda, <code>[a-zA-Z0-9_]*</code>, permite letras, números e sublinhados depois. O asterisco significa “zero ou mais”.</p>'
    : '<strong>Revise a regra do identificador.</strong><p>O primeiro caractere não pode ser um dígito. Depois dele podem aparecer letras, números e sublinhados. Compare a descrição das alternativas e experimente <code>_total2</code> e <code>2total</code> no testador ao lado.</p>';
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
