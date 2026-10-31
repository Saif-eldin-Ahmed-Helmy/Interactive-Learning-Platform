import owlImageSrc from "../assets/owl1.png";
// owl4 plants the back foot while the front kicks, so both legs alternate with owl1.
import owlImageSrc2 from "../assets/owl4.png";
import { isMobile } from "./Canva";

export enum PlayerState {
  Run,
  Jump,
}

export default class Player {
  public ctx: CanvasRenderingContext2D;
  public canva: HTMLCanvasElement;
  public width: number;
  public height: number;
  public jumpHeight: number;
  public scaleratio: number;
  public x: number = 0;
  public y: number = 0;
  public standingstillImage: HTMLImageElement;
  public RunningImages: HTMLImageElement[];
  public image: HTMLImageElement;

  public ConstAnimtionTimer = 600;
  public animationTimer = this.ConstAnimtionTimer;
  public index = 0;

  // Jump physics properties
  public y_velocity = 0;
  public gravity = 0.1;
  public isJumping = false;
  public y_ground: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    jump: number,
    scaleratio: number
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.jumpHeight = jump;
    this.scaleratio = scaleratio;
    this.canva = ctx.canvas;
    this.x = scaleratio * 10;
    this.y_ground = this.canva.height - this.height - 6 * scaleratio;
    if (isMobile) {
      this.y_ground = this.canva.height - this.height - 16 * scaleratio;
    }
    this.y = this.y_ground;

    this.standingstillImage = new Image();
    this.standingstillImage.src = owlImageSrc;
    this.RunningImages = [];
    this.RunningImages.push(this.standingstillImage);
    this.image = new Image();
    this.image.src = owlImageSrc2;
    this.RunningImages.push(this.image);
  }

  // A jump rises to twice jumpHeight and lands after jumpDuration ms on any screen size or refresh rate.
  private jumpDuration = 650;

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.gravity = (16 * this.jumpHeight) / this.jumpDuration ** 2;
      this.y_velocity = (-8 * this.jumpHeight) / this.jumpDuration;
    }
  }

  getState(): PlayerState {
    return this.isJumping ? PlayerState.Jump : PlayerState.Run;
  }

  update(deltatime: number, Game_Speed: number) {
    this.run(deltatime, Game_Speed);
    this.applyGravity(deltatime);
  }

  applyGravity(deltatime: number) {
    if (!this.isJumping) return;
    this.y_velocity += this.gravity * deltatime;
    this.y += this.y_velocity * deltatime;

    if (this.y > this.y_ground) {
      this.y = this.y_ground;
      this.y_velocity = 0;
      this.isJumping = false;
    }
  }

  run(deltatime: number, Game_Speed: number) {
    if (this.animationTimer <= 0) {
      this.image = this.RunningImages[this.index % 2];
      this.animationTimer = this.ConstAnimtionTimer;
      this.index++;
    }
    this.animationTimer -= deltatime * Game_Speed * this.scaleratio;
  }

  draw() {
    if (this.image.complete && this.image.naturalHeight !== 0) {
      this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }
}
