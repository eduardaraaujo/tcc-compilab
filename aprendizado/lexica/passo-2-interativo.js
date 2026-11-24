/* Trilha léxica: leitura de "total" um caractere por vez, sem alterar o exercício. */
(() => {
    'use strict';
    const root = document.getElementById('lex-dfa-trace');
    if (!root) return;
    const chars = [...root.querySelectorAll('[data-lex-dfa-cell]')];
    const history = [...root.querySelectorAll('[data-dfa-trace-state]')];
    const acceptance = document.getElementById('cl-dfa-acceptance');
    const current = document.getElementById('cl-dfa-state'), pos = document.getElementById('cl-dfa-position'), explain = document.getElementById('cl-dfa-explain');
    const prev = document.getElementById('cl-dfa-prev'), next = document.getElementById('cl-dfa-next'), reset = document.getElementById('cl-dfa-reset');
    const diagram = root.previousElementSibling?.querySelector('svg') || root.parentElement?.querySelector('svg');
    const q0 = diagram?.querySelector('circle[cx="95"]'), q1 = diagram?.querySelector('circle[cx="295"]');
    let index = 0;
    function setStep(target) {
        index = Math.max(0, Math.min(target, chars.length));
        const letter = index ? ['t', 'o', 't', 'a', 'l'][index - 1] : '';
        current.textContent = index === 0 ? 'q0 · estado inicial' : index === chars.length ? 'q1 · estado de aceitação' : 'q1 · identificador em leitura';
        pos.textContent = `${index} de ${chars.length} caracteres`;
        explain.textContent = index === 0 ? 'O autômato está em q0. Avance para ler a primeira letra.' : index === 1 ? 'A letra “t” satisfaz [a-zA-Z_]: transição q0 → q1.' : index === chars.length ? 'A última letra foi lida. O DFA termina em q1, aceitando o identificador “total”.' : `A letra “${letter}” satisfaz [a-zA-Z0-9_]: o DFA permanece em q1.`;
        chars.forEach((cell, i) => {
            cell.classList.toggle('cl-dfa-read', i < index);
            cell.classList.toggle('cl-dfa-active', i === index - 1);
            const tag = cell.querySelector('span:last-child');
            if (tag) tag.textContent = i < index ? (i === 0 ? 'q0 → q1' : 'q1 → q1') : 'Aguardando';
        });
        history.forEach((state, i) => { state.hidden = i > index; state.classList.toggle('cl-dfa-active-state', i === index); });

        const trace = history[0]?.parentElement;
        if (trace) [...trace.children].forEach((piece, i) => { piece.hidden = i > index * 2; });
        if (acceptance) acceptance.hidden = index !== chars.length;
        if (q0) q0.classList.toggle('cl-dfa-node-active', index === 0);
        if (q1) q1.classList.toggle('cl-dfa-node-active', index > 0);
        prev.disabled = index === 0; reset.disabled = index === 0; next.disabled = index === chars.length;
        next.textContent = index === chars.length ? 'Concluído' : 'Próximo →';
    }
    next?.addEventListener('click', () => setStep(index + 1));
    prev?.addEventListener('click', () => setStep(index - 1));
    reset?.addEventListener('click', () => setStep(0));
    setStep(0);
    window.CompiLabDFALessonTest = { getStep: () => index, setStep };
})();
