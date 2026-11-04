const studioChoice = { template: "Shop sales" };

export function setStudioTemplate(name) {
  studioChoice.template = name;
}

export function studioTemplateName() {
  return studioChoice.template;
}
