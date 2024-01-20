import {
  Camera,
  ControllableGameObject,
  GameKeyboardEvent,
  GameKeyboardEventListener,
  GameObject,
  GameScreen,
  KeyboardKey,
  Scene,
} from "../api";

class MainScene extends Scene {
  scaring = false;

  constructor() {
    const camera = new Camera();
    super(camera);

    this.setHeight(window.innerHeight * 3);
    this.setWidth(window.innerWidth * 3);
    this.setBackground("linear-gradient(to bottom, skyblue, black)", {
      size: "cover",
      attachment: "scroll",
    });
  }

  scare() {
    if (this.scaring) return;
    this.scaring = true;
    const old = this.getBackground();

    this.setBackground(
      `url("https://www.spectator.co.uk/wp-content/uploads/2023/02/2MX0PT8.jpg")`,
      {
        size: "cover",
        attachment: "fixed",
      }
    );

    setTimeout(() => {
      this.setBackground(old, {
        size: "cover",
        attachment: "scroll",
      });
      this.scaring = false;
    }, 1000);
  }
}

class Sphere extends ControllableGameObject {
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

export function init() {
  const screen = new GameScreen();
  const scene = new MainScene();

  screen.setActiveScene(scene);

  const sphere = new Sphere(scene);
  sphere.displayOnScene(300, 300, 0);
  sphere.getFollowCursorOnMoveControl().setActive(true);
  sphere
    .getFollowCursorOnMoveControl()
    .setRadiusThreshold(sphere.getWidth() / 2);
  sphere.setCollision(true);

  const sphere2 = new Sphere(scene);
  sphere2.displayOnScene(500, 300, 0);
  sphere2.setCollision(true);

  const pressWToScare = new GameKeyboardEventListener(
    GameKeyboardEvent.KEYDOWN,
    KeyboardKey.W,
    () => {
      if (sphere.getY() > window.innerHeight * 2.5) {
        scene.scare();
      }
    }
  );

  scene.keyboard.addListener(pressWToScare);
  scene.getCamera().setAttachedObject(sphere);
}
