declare module "snake_game" {
  export class World {
    static new(): World;
    get_width(): number;
    get_snake_head_idx(): number;
    update_snake_head(): void;
  }
}
