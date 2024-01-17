import { Camera, GameObject, GameScreen, Scene } from "../api";
import { ControllableGameObject } from "../object";

class MainScene extends Scene {
  constructor() {
    super();

    this.setHeight(window.innerHeight);
  }
}

class Sphere extends GameObject {
  constructor(scene: Scene) {
    const html = Sphere.generateHtml();

    super(scene, html);
  }

  static generateHtml() {
    const html = document.createElement("div");
    html.classList.add("sphere");
    return html;
  }
}

class GrassChunk extends GameObject {
  constructor(scene: Scene, surfaceHeight = 16, dirtHeight = 96, width = 64) {
    super(scene, GrassChunk.generateHtml(surfaceHeight, dirtHeight));
    this.setWidth(width);
    this.setHeight(surfaceHeight + dirtHeight);
  }

  static generateHtml(surfaceHeight: number, dirtHeight: number) {
    const html = document.createElement("div");

    const surface = document.createElement("div");
    surface.style.background = "lime";
    surface.style.height = `${surfaceHeight}px`;

    html.appendChild(surface);

    const terrain = document.createElement("div");
    terrain.style.background = "rgb(126, 89, 71)";
    terrain.style.height = `${dirtHeight}px`;

    html.appendChild(terrain);

    return html;
  }
}

class Platform {
  chunks: GameObject[] = [];
  private width = 0;

  constructor(public scene: Scene, public x = 0) {}

  addChunk(object: GameObject) {
    if (object.scene.ID !== this.scene.ID) {
      throw new Error("Invalid scene");
    }
    if (!object.getWidth()) {
      alert("Object must have specified width");
      throw new Error("Object must have specified width");
    }
    if (!object.getHeight()) {
      alert("Object must have specified height");
      throw new Error("Object must have specified height");
    }
    this.chunks.push(object);

    object.displayOnScene(
      this.x + this.width,
      this.scene.getHeight() - object.getHeight(),
      0
    );
    object.setCollision(true);

    this.width += object.getWidth();
    if (this.width > this.scene.getWidth()) {
      this.scene.setWidth(this.width);
    }
  }

  setX(x: number) {
    for (const chunk of this.chunks) {
      chunk.right(x - this.x);
    }
    this.x = x;
  }

  getX() {
    return this.x;
  }
}

export class Character extends ControllableGameObject {
  constructor(scene: Scene) {
    const html = Character.generateHtml();
    super(scene, html);
    this.setWidth(32);
    this.getAdControl().setOnPressA(() => {
      this.textureHtml.style.transform = "rotateY(180deg)";
    });
    this.getAdControl().setOnPressD(() => {
      this.textureHtml.style.transform = "rotateY(0deg)";
    });
  }

  static generateHtml() {
    const html = document.createElement("div");
    const IMG = "mario.png";
    const img = document.createElement("img");
    img.style.width = "100%";
    img.src = IMG;
    html.appendChild(img);
    return html;
  }
}

export class SecondScene extends Scene {
  constructor() {
    super();
    this.setBackground(
      `url("https://www.spectator.co.uk/wp-content/uploads/2023/02/2MX0PT8.jpg")`,
      {
        size: "cover",
        attachment: "fixed",
      }
    );
  }
}

export function init() {
  const screen = new GameScreen();
  const scene = new MainScene();
  const camera = new Camera();

  screen.setActiveScene(scene);

  scene.setCamera(camera);
  scene.setClosedBorders(true);
  scene.setBackgroundColor("skyblue");

  const mario = new Character(scene);
  mario.getJumpYControl().setActive(true);
  mario.getAdControl().setActive(true);
  mario.displayOnScene(100, 100, 0);
  mario.setCollision(true);
  mario.setGravity(true);

  scene.getCamera()?.setAttachedObject(mario);

  (() => {
    const platform = new Platform(scene);

    for (let i = 1; i <= 10; i++) {
      const height = 32 * i;
      const grass = new GrassChunk(scene, 16, height - 32);
      platform.addChunk(grass);
    }
  })();

  // mario.onXChange = (diff) => {
  //   if (diff > 0) {
  //     const GAP = 10;
  //     if (mario.getX() >= scene.getWidth() - mario.getWidth() - GAP) {
  //       screen.setActiveScene(new SecondScene());
  //     }
  //   }
  // };

  mario.onLeaveSceneRight = () => screen.setActiveScene(new SecondScene());
}
