import BackGroundSrc from "../assets/background.png";

export default class Background {
  private ctx: CanvasRenderingContext2D;
  private canva: HTMLCanvasElement;
  private width: number;
  private height: number;
  private speed: number;
  private scaleratio: number;
  private x: number = 0;
  private y: number = 0;
  private BackgroundImage: HTMLImageElement;


  constructor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    speed: number,
    scaleratio: number
  ) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.scaleratio = scaleratio;
    this.canva = ctx.canvas;
    this.x =0;
    this.y = this.canva.height - this.height;
    this.BackgroundImage = new Image();
    this.BackgroundImage.src = BackGroundSrc;
  }


  update(deltatime: number,Game_Speed: number){

    this.x -= this.speed*deltatime*Game_Speed*this.scaleratio/4;

    if(this.x < -this.width){
      this.x = 0;
    }

  }

  draw() {
    if (
      this.BackgroundImage.complete &&
      this.BackgroundImage.naturalHeight !== 0
    ) {
      this.ctx.drawImage(
        this.BackgroundImage,
        this.x,
        this.y,
        this.width,
        this.height
      );
      this.ctx.drawImage(
        this.BackgroundImage,
        this.x+this.width,
        this.y,
        this.width,
        this.height
      );
    }
  }
}
