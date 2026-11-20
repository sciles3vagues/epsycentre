/** Writes a `data-*` attribute only when its value changes (avoids needless style recalculation on scroll). */
export function setDataAttribute(element: HTMLElement, key: string, value: string): void {
  if (element.dataset[key] !== value) {
    element.dataset[key] = value;
  }
}
