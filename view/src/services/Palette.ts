/**
 * Canvas colors, read from the CSS custom properties in style.css so the
 * board and the page share one source of truth.
 */
export interface Palette {
  readonly boardA: string;
  readonly boardB: string;
  readonly snake: string;
  readonly snakeAlt: string;
  readonly snakeHead: string;
  readonly food: string;
  readonly leaf: string;
  readonly ink: string;
  readonly shadow: string;
}

export function loadPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string): string => style.getPropertyValue(name).trim();

  return {
    boardA: read("--board-a"),
    boardB: read("--board-b"),
    snake: read("--snake"),
    snakeAlt: read("--snake-alt"),
    snakeHead: read("--snake-head"),
    food: read("--food"),
    leaf: read("--leaf"),
    ink: read("--ink"),
    shadow: read("--shadow"),
  };
}
