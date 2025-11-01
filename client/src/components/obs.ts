import Player from "./player";

export default class Obs {
  public ctx: CanvasRenderingContext2D;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public image: HTMLImageElement;
  public id: number;
  public hasTriggeredQuestion: boolean = false;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    image: HTMLImageElement,
    id: number
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    this.id = id;
  }

  isCollidingWith(player: Player): boolean {
    const adjustment = 1.4;
    if (
      this.x < (player.x + player.width) / adjustment &&
      (this.x + this.width) / adjustment > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    ) {
      return true;
    } else {
      return false;
    }
  }

  update(
    speed: number,
    deltaTime: number,
    gameSpeed: number,
    scaleRatio: number
  ) {
    this.x -= speed * deltaTime * gameSpeed * scaleRatio * 0.25;
  }

  draw() {
    if (this.image.complete && this.image.naturalHeight !== 0) {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}
