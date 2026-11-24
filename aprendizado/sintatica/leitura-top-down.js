(() => {
  const stages = [1, 2, 3].map(i => document.getElementById('cl-reading-stage-' + i));
  const alert = document.getElementById('cl-reading-alert');
  if (stages.some(stage => !stage) || !alert) return;
  const correct = [false, false, false];
  stages.forEach((stage, index) => {
    stage.querySelectorAll('[data-reading-answer]').forEach(button => {
      button.addEventListener('click', () => {
        const ok = button.dataset.correct === 'true';
        stage.querySelectorAll('[data-reading-answer]').forEach(b => {
          b.classList.remove('is-correct', 'is-wrong');
          b.setAttribute('aria-pressed', 'false');
        });
        button.classList.add(ok ? 'is-correct' : 'is-wrong');
        button.setAttribute('aria-pressed', 'true');
        const feedback = document.getElementById('cl-reading-feedback-' + (index + 1));
        if (feedback) {
          feedback.hidden = false;
          feedback.className = 'cl-syn-feedback ' + (ok ? 'is-correct' : 'is-wrong');
          const title = document.createElement('strong');
          title.textContent = ok ? 'Correto!' : 'Vamos revisar esta alternativa.';
          const content = document.createElement('span');
          content.textContent = button.dataset.feedback || '';
          feedback.replaceChildren(title, content);
        }
        correct[index] = ok;
        alert.hidden = true;
      });
    });
  });
  function warn() {
    alert.hidden = false;
    alert.textContent = 'Responda corretamente às três perguntas sobre GLC, análise top-down e LL(1) antes de continuar.';
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  document.querySelectorAll('[data-locked-step]').forEach(button => button.addEventListener('click', warn));
  document.querySelectorAll('[data-next-lesson]').forEach(link => link.addEventListener('click', event => {
    if (correct.every(Boolean)) return;
    event.preventDefault(); warn();
  }));
})();
