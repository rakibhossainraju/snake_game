type OverlayState = "start" | "over" | "won" | null;

const BEST_SCORE_KEY = "snake.best";

/**
 * Class responsible for the DOM around the canvas: scores and the
 * start / game over / win overlay
 */
export class UIRenderer {
  private readonly overlay = document.getElementById("overlay")!;
  private readonly title = document.getElementById("overlay-title")!;
  private readonly detail = document.getElementById("overlay-detail")!;
  private readonly action = document.getElementById("overlay-action")!;
  private readonly scoreEl = document.getElementById("points-count")!;
  private readonly bestEl = document.getElementById("best-count")!;

  private shown: OverlayState = null;
  private lastPoints = -1;
  private best = 0;
  private bestAtRunStart = 0;

  constructor(onAction: () => void) {
    this.best = Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    this.bestEl.textContent = this.best.toString();

    this.action.addEventListener("click", () => {
      this.action.blur(); // keep Space from re-triggering the button
      onAction();
    });
  }

  public displayStartScreen(): void {
    if (this.shown === "start") return;
    this.bestAtRunStart = this.best;
    this.show(
      "start",
      "Ready?",
      "Eat apples to grow. Don't bite your own tail. Cross an edge and you come out the other side.",
      "Start",
    );
  }

  public displayGameOver(point: number): void {
    const newBest = point > this.bestAtRunStart;
    this.show(
      "over",
      "Game over",
      newBest
        ? `New best: ${point}.`
        : `You scored ${point}. Your best is ${this.best}.`,
      "Play again",
    );
  }

  public displayGameWon(point: number): void {
    this.show("won", "Board cleared", `A perfect ${point}.`, "Play again");
  }

  public hideOverlay(): void {
    if (this.shown === null) return;
    this.shown = null;
    this.overlay.hidden = true;
  }

  /**
   * Update the score readouts, only touching the DOM when the score changes
   */
  public updateScore(points: number): void {
    if (points === this.lastPoints) return;
    this.lastPoints = points;
    this.scoreEl.textContent = points.toString();

    if (points > this.best) {
      this.best = points;
      localStorage.setItem(BEST_SCORE_KEY, points.toString());
      this.bestEl.textContent = points.toString();
    }

    if (points > 0) this.bump(this.scoreEl);
  }

  private show(
    state: Exclude<OverlayState, null>,
    title: string,
    detail: string,
    actionLabel: string,
  ): void {
    if (this.shown === state) return;
    this.shown = state;
    this.title.textContent = title;
    this.detail.textContent = detail;
    this.action.textContent = actionLabel;
    this.overlay.hidden = false;
  }

  private bump(el: HTMLElement): void {
    el.classList.remove("score-bump");
    void el.offsetWidth; // restart the animation
    el.classList.add("score-bump");
  }
}
