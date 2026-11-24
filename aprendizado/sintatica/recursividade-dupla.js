(() => {
  const direct = document.getElementById('cl-direct-stage');
  const indirect = document.getElementById('cl-indirect-stage');
  const alert = document.getElementById('cl-syn-alert');
  const reveal = document.querySelector('.cl-syn-reveal');
  if (!direct || !indirect || !alert || !reveal) return;
  let directOK = false, indirectOK = false;
  function sync() { reveal.hidden = !(directOK && indirectOK); }
  function bind(section, feedbackId, update) {
    const buttons = [...section.querySelectorAll('[data-stage-choice]')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const ok = button.dataset.correct === 'true';
      buttons.forEach(b => {
        b.classList.remove('is-correct', 'is-wrong');
        b.setAttribute('aria-pressed', 'false');
      });
      button.classList.add(ok ? 'is-correct' : 'is-wrong');
      button.setAttribute('aria-pressed', 'true');
      const feedback = document.getElementById(feedbackId);
      if (feedback) {
        feedback.hidden = false;
        feedback.className = 'cl-syn-feedback ' + (ok ? 'is-correct' : 'is-wrong');
        const title = document.createElement('strong');
        title.textContent = ok ? 'Correto!' : 'Vamos revisar esta opção.';
        const description = document.createElement('span');
        description.textContent = button.dataset.feedback || '';
        feedback.replaceChildren(title, description);
      }
      alert.hidden = true;
      const wasHidden = reveal.hidden;
      update(ok); sync();
      if (wasHidden && !reveal.hidden) reveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));
  }
  bind(direct, 'cl-syn-feedback', ok => { directOK = ok; });
  bind(indirect, 'cl-indirect-feedback', ok => { indirectOK = ok; });
  function warn() {
    alert.hidden = false;
    alert.textContent = 'Responda corretamente às duas questões (recursão direta e indireta) antes de continuar.';
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  document.querySelectorAll('[data-next-lesson]').forEach(a => a.addEventListener('click', e => {
    if (directOK && indirectOK) return;
    e.preventDefault(); warn();
  }));
  document.querySelectorAll('[data-locked-step]').forEach(b => b.addEventListener('click', warn));
})();
