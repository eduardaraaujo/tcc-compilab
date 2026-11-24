(() => {
  const choices = [...document.querySelectorAll('.cl-syn-option[data-answer]')];
  const feedback = document.getElementById('cl-syn-feedback');
  const alertBox = document.getElementById('cl-syn-alert');
  const revealBlocks = [...document.querySelectorAll('[data-show-on-correct]')];
  let correctAnswerSelected = false;
  if (!choices.length || !feedback) return;

  function selectChoice(option) {
    const isCorrect = option.dataset.correct === 'true';
    choices.forEach(button => {
      button.classList.remove('is-correct', 'is-wrong');
      button.setAttribute('aria-pressed', 'false');
    });
    option.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
    option.setAttribute('aria-pressed', 'true');
    correctAnswerSelected = isCorrect;
    revealBlocks.forEach(block => { block.hidden = !isCorrect; });
    feedback.hidden = false;
    feedback.className = `cl-syn-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`;
    feedback.replaceChildren();
    const title = document.createElement('strong');
    title.textContent = isCorrect ? 'Correto!' : 'Vamos revisar esta opção.';
    const explanation = document.createElement('span');
    explanation.textContent = option.dataset.feedback || '';
    feedback.append(title, explanation);
    if (alertBox) alertBox.hidden = true;
  }

  choices.forEach(button => button.addEventListener('click', () => selectChoice(button)));
  document.querySelectorAll('[data-locked-step]').forEach(button => {
    button.addEventListener('click', () => {
      if (alertBox) { alertBox.hidden = false; alertBox.textContent = 'Responda à atividade atual antes de avançar para a próxima parte da trilha.'; alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    });
  });

  // Bloqueia SOMENTE os links de avanço da atividade atual. Links de retorno são livres.
  document.querySelectorAll('[data-next-lesson]').forEach(link => {
    link.addEventListener('click', event => {
      if (correctAnswerSelected) return;
      event.preventDefault();
      if (alertBox) {
        alertBox.hidden = false;
        alertBox.textContent = choices.some(b => b.getAttribute('aria-pressed') === 'true')
          ? 'Antes de avançar, revise a alternativa escolhida e encontre a resposta correta.'
          : 'Escolha uma alternativa antes de avançar para o próximo assunto.';
        alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      choices[0]?.focus({ preventScroll: true });
    });
  });
})();
