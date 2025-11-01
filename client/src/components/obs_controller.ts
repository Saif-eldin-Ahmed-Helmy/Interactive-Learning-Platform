import Obs from "./obs";
import Player from "./player";
import { isMobile } from "./Canva";
export default class ObsController {
  private ctx: CanvasRenderingContext2D;
  private obsImages: any[];
  private scaleRatio: number;
  private speed: number;
  private obstacles: Obs[] = [];
  private obs_interval_timer: number = 0;
  private Next_Obs: any = null;
  private obstacleIdCounter: number = 0;

  constructor(
    ctx: CanvasRenderingContext2D,
    obsImages: any[],
    scaleRatio: number,
    speed: number
  ) {
    this.ctx = ctx;
    this.obsImages = obsImages;
    this.scaleRatio = scaleRatio;
    this.speed = speed;
    this.scheduleNextObs();
  }
  scheduleNextObs() {
    // const interval =
    //   Math.floor(
    //     Math.random() * (this.obs_interval_max - this.obs_interval_min + 1)
    //   ) + this.obs_interval_min;
    // this.obs_interval_timer = interval;
    this.obs_interval_timer = 2000;
    return;
  }
  GetNext_Obs() {
    const randomIndex = Math.floor(Math.random() * this.obsImages.length);
    this.Next_Obs = this.obsImages[randomIndex];
    const xPos = this.ctx.canvas.width * 2;
    var yPos =
      this.ctx.canvas.height -
      this.Next_Obs.height * this.scaleRatio/1.8 -
      6 * this.scaleRatio;
    if (isMobile) {
      yPos =
        this.ctx.canvas.height -
        this.Next_Obs.height * 4 * this.scaleRatio +
        18 * this.scaleRatio;
        this.Next_Obs.height = this.Next_Obs.height * 4;
        this.Next_Obs.width = this.Next_Obs.width * 4;
    }

    const obs = new Obs(
      this.ctx,
      xPos,
      yPos,
      this.Next_Obs.width * this.scaleRatio /1.8,
      this.Next_Obs.height * this.scaleRatio /1.8,
      this.Next_Obs.image,
      this.obstacleIdCounter++
    );
    this.obstacles.push(obs);
    return;
  }
  isCollidingWith(player: Player): boolean {
    return this.obstacles.some((obs) => obs.isCollidingWith(player));
  }

  isObsNearToPlayer(player: Player, threshold: number): Obs | null {
    return this.obstacles.find(
      (obs) => obs.x < player.x + threshold && 
               obs.x + obs.width > player.x &&
               !obs.hasTriggeredQuestion
    ) || null;
  }

  update(deltaTime: number, gameSpeed: number) {
    if (this.obs_interval_timer <= 0) {
      this.GetNext_Obs();
      this.scheduleNextObs();
    }

    this.obs_interval_timer -= deltaTime;
    this.obstacles.forEach((obs) => {
      obs.update(this.speed, deltaTime, gameSpeed, this.scaleRatio);
    });
    this.obstacles = this.obstacles.filter((obs) => obs.x + obs.width > 0);
  }
  draw() {
    this.obstacles.forEach((obs) => {
      obs.draw();
    });
  }
}
