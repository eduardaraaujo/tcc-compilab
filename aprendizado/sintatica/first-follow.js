(() => {
  const first = document.getElementById('cl-ff-first');
  const follow = document.getElementById('cl-ff-follow');
  if (!first || !follow) return;
  const resolution = document.getElementById('cl-ff-resolution');
  const warning = document.getElementById('cl-ff-alert');
  let firstCorrect = false;
  let followCorrect = false;
  function wire(section, feedbackId, onAnswer) {
    const feedback = document.getElementById(feedbackId);
    section.querySelectorAll('button[data-ff-answer]').forEach(button => button.addEventListener('click', () => {
      const correct = button.dataset.correct === 'true';
      section.querySelectorAll('button[data-ff-answer]').forEach(choice => {
        choice.classList.remove('is-correct', 'is-wrong');
        choice.setAttribute('aria-pressed', 'false');
      });
      button.classList.add(correct ? 'is-correct' : 'is-wrong');
      button.setAttribute('aria-pressed', 'true');
      feedback.hidden = false;
      feedback.className = 'cl-syn-feedback ' + (correct ? 'is-correct' : 'is-wrong');
      feedback.replaceChildren();
      const strong = document.createElement('strong');
      strong.textContent = correct ? 'Correto!' : 'Vamos revisar esta alternativa.';
      const span = document.createElement('span');
      span.textContent = button.dataset.feedback || '';
      feedback.append(strong, span);
      warning.hidden = true;
      onAnswer(correct);
    }));
  }
  wire(first, 'cl-ff-first-feedback', correct => {
    firstCorrect = correct;
    if (correct) {
      follow.hidden = false;
      follow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (!correct) {
      follow.hidden = true;
      followCorrect = false;
      follow.querySelectorAll('button[data-ff-answer]').forEach(choice => {
        choice.classList.remove('is-correct', 'is-wrong');
        choice.setAttribute('aria-pressed', 'false');
      });
      const followFeedback = document.getElementById('cl-ff-follow-feedback');
      if (followFeedback) followFeedback.hidden = true;
      resolution.hidden = true;
    }
  });
  wire(follow, 'cl-ff-follow-feedback', correct => {
    followCorrect = correct;
    resolution.hidden = !(firstCorrect && followCorrect);
    if (firstCorrect && followCorrect) resolution.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  document.querySelectorAll('[data-locked-step]').forEach(button => button.addEventListener('click', () => { warning.hidden = false; warning.textContent = 'Conclua FIRST e FOLLOW nesta página antes de avançar.'; warning.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }));
  document.querySelectorAll('[data-next-lesson]').forEach(link => link.addEventListener('click', e => {
    if (firstCorrect && followCorrect) return;
    e.preventDefault(); warning.hidden = false;
    warning.textContent = firstCorrect ? 'Responda corretamente à questão de FOLLOW antes de avançar.' : 'Responda corretamente à questão de FIRST e depois à de FOLLOW antes de avançar.';
    warning.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }));
})();