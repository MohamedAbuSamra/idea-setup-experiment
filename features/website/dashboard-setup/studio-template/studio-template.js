import { setStudioTemplate } from "../shared/studio-state.js";

export function bindStudioTemplate() {
  const canvas = document.querySelector('[data-feature-canvas="studio-template"]');
  if (!canvas) return;
  const continueBtn = canvas.querySelector("#studioTemplateContinue");
  const cards = canvas.querySelectorAll("[data-template]");
  cards.forEach((card) => {
    card.onclick = () => {
      cards.forEach((other) => other.classList.toggle("is-selected", other === card));
      setStudioTemplate(card.dataset.template);
      if (continueBtn) continueBtn.disabled = false;
    };
  });
}
