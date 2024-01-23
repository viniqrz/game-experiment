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
import { Spam } from "../spam";

class MainScene extends Scene {
  public isReady = false;

  constructor() {
    const camera = new Camera();
    super(camera);
  }

  init() {
    if (this.isReady) return;
    this.setClosedBorders(true);
    this.setBackgroundColor("skyblue");

    const platform = new Platform(this);

    for (let i = 0; i < 8; i++) {
      const height = i % 2 === 0 ? 128 : 64;
      const ground = new GrassChunk(this, 16, height, 256);
      platform.addChunk(ground);
    }

    const bar = new Bar(this);

    bar.displayOnScene(this.getWidth() / 2, this.getHeight() / 2, 0);
    bar.setCollision(true);

    this.isReady = true;
  }
}

export class NetherChunk extends GameObject {
  constructor(scene: Scene, height = 128, width = 128) {
    super(scene, NetherChunk.generateHtml(height, width));
  }

  static generateHtml(height: number, width: number) {
    const html = document.createElement("div");

    html.style.background = "#4a2615";
    html.style.height = height + "px";
    html.style.width = width + "px";

    return html;
  }
}

export class SecondScene extends Scene {
  isReady = false;

  constructor() {
    const camera = new Camera();
    super(camera);
  }

  init(char: Character) {
    if (this.isReady) return;
    this.setClosedBorders(true);
    this.getCamera().setAttachedObject(char);
    this.setBackground("#a85832");

    const platform = new Platform(this);

    for (let i = 0; i < 8; i++) {
      const height = i % 2 === 0 ? 128 : 64;
      const ground = new NetherChunk(this, height, 128);
      platform.addChunk(ground);
      ground.getCollision();
    }

    this.isReady = true;
  }
}

export class NightScene extends Scene {
  isReady = false;

  constructor() {
    super(new Camera());
  }

  init(char: Character) {
    if (this.isReady) return;
    this.setClosedBorders(true);
    this.getCamera().setAttachedObject(char);
    this.setBackground("#2f17cf");

    const platform = new Platform(this);

    for (let i = 0; i < 8; i++) {
      const height = i % 2 === 0 ? 128 : 64;
      const ground = new NetherChunk(this, height, 128);
      platform.addChunk(ground);
      ground.getCollision();
    }
    this.isReady = true;
  }
}

export class Bar extends GameObject {
  spam: Spam;

  constructor(scene: Scene) {
    super(scene, Bar.generateHtml());

    this.spam = new Spam(() => {
      this.left();
    }, 1);

    this.spam.start();
  }

  static generateHtml() {
    const html = document.createElement("div");
    html.style.width = 200 + "px";
    html.style.height = 24 + "px";
    html.style.background = "#2f17cf";
    return html;
  }
}

export class Character extends ControllableGameObject {
  constructor(scene: Scene, type: "mario" | "ghost", isMainCharacter = false) {
    const html = Character.generateHtml(type);
    super(scene, html);

    this.setWidth(32);
    this.getJumpYControl().setActive(isMainCharacter);
    this.getAdControl().setActive(isMainCharacter);
    this.setCollision(true);
    this.setGravity(true);

    this.listen(GameObjectEvent.X_CHANGE, (diff: number) => {
      this.rotateY(diff > 0 ? 0 : 180);
    });
  }

  rotateY(n: number) {
    this.textureHtml.style.transform = `rotateY(${n}deg)`;
  }

  static generateHtml(type: "mario" | "ghost") {
    const html = document.createElement("div");
    const IMG = type + ".png";
    const img = document.createElement("img");
    img.style.width = "100%";
    img.src = IMG;
    html.appendChild(img);
    return html;
  }
}

export function init() {
  const screen = new GameScreen();

  const mainScene = new MainScene();
  const secondScene = new SecondScene();
  const nightScene = new NightScene();

  const mario = new Character(mainScene, "mario", true);
  const ghost = new Character(mainScene, "ghost");

  const scenes = [mainScene, secondScene, nightScene];

  let currentSceneIndex = 0;

  screen.setActiveScene(scenes[currentSceneIndex]);
  scenes[currentSceneIndex].init(mario);

  mario.displayOnScene(mainScene.getWidth() / 2 - mario.getWidth(), 10, 0);
  mainScene.getCamera().setAttachedObject(mario);

  ghost.displayOnScene(
    (mainScene.getWidth() * 3) / 4 - ghost.getWidth(),
    10,
    0
  );

  // mario.setSpeed(3);

  mario.listen(GameObjectEvent.LEAVE_SCENE_RIGHT, () => {
    if (currentSceneIndex >= scenes.length - 1) return;
    currentSceneIndex++;
    screen.setActiveScene(scenes[currentSceneIndex]);
    scenes[currentSceneIndex].init(mario);
    mario.switchScene(scenes[currentSceneIndex], 0, mario.getY() - 128, 0);
  });

  mario.listen(GameObjectEvent.LEAVE_SCENE_LEFT, () => {
    if (currentSceneIndex <= 0) return;
    currentSceneIndex--;
    const activeScene = scenes[currentSceneIndex];
    screen.setActiveScene(activeScene);
    activeScene.init(mario);
    mario.switchScene(
      activeScene,
      activeScene.getWidth() - mario.getWidth(),
      mario.getY() - 128,
      0
    );
  });
}
