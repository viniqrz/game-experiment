import {
  Camera,
  GameObject,
  GameScreen,
  Scene,
  ControllableGameObject,
  Platform,
  GrassChunk,
  GameObjectEvent,
} from "../api";

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
  mario.displayOnScene(10, 10, 0);
  mario.setCollision(true);
  mario.setGravity(true);

  scene.getCamera()?.setAttachedObject(mario);

  (() => {
    const platform = new Platform(scene);

    for (let i = 1; i <= 10; i++) {
      const height = 32 * i;
      const grass = new GrassChunk(scene, 16, height - 32);
      platform.addChunk(grass);
      if (i % 2 === 0) {
        // grass.setWidth(0);
        // grass.setCollision(false);
      }
    }
  })();

  mario.listen(GameObjectEvent.LEAVE_SCENE_RIGHT, () =>
    screen.setActiveScene(new SecondScene())
  );
}
