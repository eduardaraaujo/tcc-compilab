/* Busca e filtros locais*/
(() => {
  'use strict';
  const input = document.querySelector('#glossary-search');
  const buttons = [...document.querySelectorAll('.gl-filter')];
  const sections = [...document.querySelectorAll('.gl-section')];
  const count = document.querySelector('#glossary-count');
  const empty = document.querySelector('#gl-no-results');
  const reset = document.querySelector('#gl-reset');
  let activeFilter = 'all';

  const normalize = text => (text || '').toLocaleLowerCase('pt-BR')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  function update() {
    const query = normalize(input.value);
    let visible = 0;
    for (const section of sections) {
      const matchesGroup = activeFilter === 'all' || section.dataset.group === activeFilter;
      let inSection = 0;
      for (const term of section.querySelectorAll('.gl-term')) {
        const terms = normalize(term.textContent + ' ' + term.dataset.keywords);
        const show = matchesGroup && (!query || terms.includes(query));
        term.hidden = !show;
        if (show) { visible++; inSection++; }
      }
      section.hidden = !inSection;
      const sectionCount = section.querySelector('.gl-section-count');
      if (sectionCount) sectionCount.textContent = `${inSection} ${inSection === 1 ? 'conceito' : 'conceitos'}`;
    }
    count.textContent = `${visible} ${visible === 1 ? 'conceito encontrado' : 'conceitos encontrados'}`;
    empty.hidden = visible !== 0;
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    buttons.forEach(other => {
      const chosen = button === other;
      other.classList.toggle('is-current', chosen);
      other.setAttribute('aria-pressed', String(chosen));
    });
    update();
  }));
  input.addEventListener('input', update);
  reset.addEventListener('click', () => {
    input.value = '';
    buttons.find(button => button.dataset.filter === 'all').click();
    input.focus();
  });
  update();
})();
