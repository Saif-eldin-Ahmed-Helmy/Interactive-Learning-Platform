import owlImageSrc from "../assets/owl1.png";
import owlImageSrc2 from "../assets/owl2.png";
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

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.y_velocity = -this.jumpHeight * this.scaleratio * 0.05;
      if (isMobile) {
        this.y_velocity = -this.jumpHeight * this.scaleratio * 0.2;
      }
    }
  }

  getState(): PlayerState {
    return this.isJumping ? PlayerState.Jump : PlayerState.Run;
  }

  update(deltatime: number, Game_Speed: number) {
    this.run(deltatime, Game_Speed);
    this.applyGravity();
  }

  applyGravity() {
    if (isMobile) {
      this.y_velocity += this.gravity * this.scaleratio * 0.3;
      this.y += this.y_velocity * 0.3;
    } else {
      this.y_velocity += this.gravity * this.scaleratio * 0.6;
      this.y += this.y_velocity * 0.6;
    }

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
