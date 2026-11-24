/* Uma questão sobre a primeira transição de um DFA para identificadores. */
(() => {
  const choices = [...document.querySelectorAll('[data-lesson-choice]')];
  const feedback = document.getElementById('lesson-choice-feedback');
  const nextLinks = [...document.querySelectorAll('a[data-lex-next="true"]')];
  const warning = document.getElementById('lex-step-required');
  if (!choices.length || !feedback) return;

  let answeredCorrectly = false;
  const messages = {
    A: 'Correto. A letra “t” corresponde à classe [a-zA-Z_]. Ao lê-la no estado q0, o autômato segue a transição para q1, que aceita o início de um identificador.',
    B: 'O estado de rejeição é usado quando o primeiro caractere não satisfaz a regra de entrada, como em “2total”. Aqui a entrada começa com “t”, que é uma letra válida. Observe a seta que sai de q0 para letras e sublinhado e tente novamente.',
    C: 'O autômato não permanece em q0 ao ler “t”. Como esse caractere atende à regra inicial [a-zA-Z_], ele consome o caractere e muda de estado. Repare no arco que corresponde à letra “t” e escolha o destino dessa transição.'
  };

  choices.forEach(choice => {
    choice.setAttribute('tabindex', '0');
    choice.setAttribute('aria-pressed', 'false');
    choice.addEventListener('click', () => {
      choices.forEach(other => {
        other.classList.remove('cl-choice-correct', 'cl-choice-wrong');
        other.setAttribute('aria-pressed', 'false');
      });
      const id = choice.dataset.lessonChoice;
      answeredCorrectly = choice.dataset.correct === 'true';
      choice.classList.add(answeredCorrectly ? 'cl-choice-correct' : 'cl-choice-wrong');
      choice.setAttribute('aria-pressed', 'true');
      const radio = choice.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      feedback.hidden = false;
      feedback.className = 'cl-lesson-feedback ' + (answeredCorrectly ? 'cl-feedback-good' : 'cl-feedback-try');
      feedback.textContent = messages[id] ?? 'Observe qual caractere é consumido e para onde aponta a transição.';
      if (warning) warning.hidden = true;
    });
    choice.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && choice.tagName === 'LABEL') {
        e.preventDefault(); choice.click();
      }
    });
  });
  nextLinks.forEach(next => next.addEventListener('click', e => {
    if (answeredCorrectly) return;
    e.preventDefault();
    if (warning) {
      warning.hidden = false;
      warning.textContent = choices.some(choice => choice.getAttribute('aria-pressed') === 'true')
        ? 'A transição escolhida não é a correta. Observe por qual arco a letra “t” sai de q0 e tente novamente.'
        : 'Responda à pergunta: para qual estado o autômato vai ao ler a letra “t”?';
      warning.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }));
})();
