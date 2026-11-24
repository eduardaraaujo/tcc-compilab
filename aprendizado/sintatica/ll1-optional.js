/* Demonstração opcional do parser LL(1).
   A questão da trilha continua obrigatória (lesson.js), mas não é necessário
   revelar todas as ações para acessar o laboratório. */
(() => {
  'use strict';

  const next = document.getElementById('cl-ll1-next');
  const reset = document.getElementById('cl-ll1-reset');
  const rows = [...document.querySelectorAll('.cl-ll1-trace-row')];
  const status = document.getElementById('cl-ll1-status');
  const reminder = document.getElementById('cl-ll1-more');
  const footerReminder = document.getElementById('cl-ll1-footer-tip');

  if (!next || !reset || !rows.length || !status) return;

  let visibleCount = 1;

  function render(scrollToRow = false) {
    const done = visibleCount === rows.length;
    const remaining = rows.length - visibleCount;

    rows.forEach((row, index) => {
      row.hidden = index >= visibleCount;
    });

    next.disabled = done;
    next.textContent = done ? 'Entrada aceita' : 'Mostrar próxima ação';
    next.classList.toggle('is-accepted', done);
    next.setAttribute('aria-label', done
      ? 'Entrada aceita. Simulação concluída.'
      : 'Mostrar próxima ação da pilha');

    status.textContent = done
      ? 'A simulação terminou: a entrada e a pilha chegaram ao marcador $.'
      : `Ação ${visibleCount} de ${rows.length}. ${remaining} ${remaining === 1 ? 'ação restante' : 'ações restantes'}.`;

    // if (reminder) {
    //   reminder.hidden = done;
    //   reminder.textContent = `Ainda ${remaining === 1 ? 'há uma ação' : `há ${remaining} ações`} para explorar (opcional). Você pode seguir para o laboratório após acertar a pergunta.`;
    // }

    // if (footerReminder) {
    //   footerReminder.hidden = done;
    //   footerReminder.textContent = `Há ${remaining} ${remaining === 1 ? 'ação' : 'ações'} por revelar nesta simulação. Depois de acertar a pergunta, você pode seguir sem concluí-las.`;
    // }

    if (scrollToRow) {
      rows[visibleCount - 1]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  next.addEventListener('click', () => {
    visibleCount = Math.min(rows.length, visibleCount + 1);
    render(true);
  });

  reset.addEventListener('click', () => {
    visibleCount = 1;
    render(true);
  });

  // O bloqueio de avanço por resposta incorreta fica somente em lesson.js.
  render();
})();
