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
    const camera = new Camera();
    super(camera);

    this.setHeight(window.innerHeight);
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
    const camera = new Camera();
    super(camera);
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

  screen.setActiveScene(scene);

  scene.setClosedBorders(true);
  scene.setBackgroundColor("skyblue");

  const mario = new Character(scene);
  mario.getJumpYControl().setActive(true);
  mario.getAdControl().setActive(true);
  mario.displayOnScene(10, 10, 0);
  mario.setCollision(true);
  mario.setGravity(true);

  const camera = new Camera();

  scene.setCamera(camera);
  scene.getCamera()?.setAttachedObject(mario);

  const platform = new Platform(scene);

  const height = 32 * 2;

  const ground = new GrassChunk(scene, 16, height - 32, 256);
  platform.addChunk(ground);

  mario.listen(GameObjectEvent.LEAVE_SCENE_RIGHT, () =>
    screen.setActiveScene(new SecondScene())
  );
}
