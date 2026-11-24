/* Apresentação progressiva de exemplos já resolvidos da trilha sintática. */
(() => {
   'use strict';
   const root = document.querySelector('[data-progressive]'); if (!root) return;
   const mode = root.dataset.progressive;
   const label = root.querySelector('[data-prog-count]'), description = root.querySelector('[data-prog-description]');
   const prev = root.querySelector('[data-prog-prev]'), next = root.querySelector('[data-prog-next]'), restart = root.querySelector('[data-prog-restart]');
   const explanation = root.querySelector('.cl-syn-wide-explanation');
   let current = 0, total = 0;
   const derivation = root.querySelectorAll('ol.cl-syn-detailed-sequence li');
   const svg = root.querySelector('.cl-syn-topdown-tree svg');
   const treeNotes = [
      'A construção começa pelo não terminal E.',
      'E → T E′: a expressão se divide em termo e continuação.',
      'T → F T′: o primeiro termo começa por um fator.',
      'F → id: o primeiro fator reconhece o identificador preco.',
      'T′ → * F T′: o operador de multiplicação e o próximo fator aparecem.',
      'F → num: o segundo fator reconhece o número 2.',
      'T′ → ε: o termo termina, pois não há outra multiplicação.',
      'E′ → ε: a expressão termina antes do ponto e vírgula.'
   ];
   const treeRectSteps = [3, 2, 4, 5, 4, 6, 4, 2, 1, 7, 1, 0];
   const treeEdgeSteps = [3, 5, 6, 4, 4, 4, 2, 2, 7, 1, 1];
   let drawable = [];
   if (mode === 'tree' && svg) {
      const rectangles = [...svg.querySelectorAll('rect')], edges = [...svg.querySelectorAll('path')];
      if (rectangles.length === treeRectSteps.length && edges.length === treeEdgeSteps.length) {
         rectangles.forEach((rect, i) => {
            const text = rect.nextElementSibling;
            drawable.push({ node: rect, step: treeRectSteps[i] });
            if (text?.tagName.toLowerCase() === 'text') drawable.push({ node: text, step: treeRectSteps[i] });
         });
         edges.forEach((edge, i) => drawable.push({ node: edge, step: treeEdgeSteps[i] }));
      }
   }
   total = mode === 'derivation' ? Math.max(0, derivation.length - 1) : treeNotes.length - 1;
   function setStep(value) {
      current = Math.max(0, Math.min(value, total));
      label.textContent = `Etapa ${current} de ${total}`;
      if (mode === 'derivation') {
         derivation.forEach((line, i) => {
            if (i > current) line.setAttribute('data-prog-hidden', ''); else line.removeAttribute('data-prog-hidden');
            if (i === current) line.setAttribute('data-prog-active', ''); else line.removeAttribute('data-prog-active');
         });
         const latest = derivation[current];
         description.textContent = latest ? latest.textContent.trim().replace(/\s+/g, ' ') : 'Comece pela expressão E.';
      } else {
         for (const item of drawable) item.node.style.display = item.step <= current ? '' : 'none';
         description.textContent = treeNotes[current];
      }
      if (explanation) explanation.hidden = current !== total;
      prev.disabled = restart.disabled = current === 0;
      next.disabled = current === total;
      next.textContent = current === total ? 'Concluído' : 'Próximo →';
   }
   prev.addEventListener('click', () => setStep(current - 1));
   next.addEventListener('click', () => setStep(current + 1));
   restart.addEventListener('click', () => setStep(0));
   // Se a pessoa mudar a alternativa depois de acertar, o exemplo volta ao início.
   new MutationObserver(() => { if (!root.hidden) setStep(0); }).observe(root, { attributes: true, attributeFilter: ['hidden'] });
   setStep(0);
   window.CompiLabProgressiveLessonTest = { getStep: () => current, getMax: () => total, setStep };
})();
