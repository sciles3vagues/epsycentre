/** Skips the write when unchanged (called on every scroll frame). */
export function setDataAttribute(element: HTMLElement, key: string, value: string): void {
  if (element.dataset[key] !== value) {
    element.dataset[key] = value;
  }
}
