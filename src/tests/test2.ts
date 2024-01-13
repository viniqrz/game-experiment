import {
  Camera,
  ControlEventListener,
  GameObject,
  GameScreen,
  Platform,
  PlatformChunk,
  Scene,
  StatusActiveControlEvent,
  StatusInactiveControlEvent,
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

class GrassChunk extends PlatformChunk {
  constructor(surfaceHeight = 16, dirtHeight = 96) {
    super(
      GrassChunk.generateHtml(surfaceHeight, dirtHeight),
      surfaceHeight + dirtHeight
    );
  }

  static generateHtml(surfaceHeight: number, dirtHeight: number) {
    const html = document.createElement("div");

    const surface = document.createElement("div");
    surface.style.background = "linear-gradient(to right, lime, darkgreen)";
    surface.style.height = `${surfaceHeight}px`;

    html.appendChild(surface);

    const terrain = document.createElement("div");
    terrain.style.background = "rgb(126, 89, 71)";
    terrain.style.height = `${dirtHeight}px`;

    html.appendChild(terrain);

    return html;
  }
}

export function init() {
  const screen = new GameScreen();
  const scene = new MainScene();
  const camera = new Camera();

  scene.setCamera(camera);

  scene.setClosedBorders(true);
  scene.setBackgroundColor("skyblue");

  screen.setActiveScene(scene);

  const platform = new Platform(scene);
  platform.renderNextChunk(new GrassChunk(12));
  platform.renderNextChunk(new GrassChunk(32));
  platform.renderNextChunk(new GrassChunk());
  platform.renderNextChunk(new GrassChunk());
  platform.displayOnScene(0, window.innerHeight, 0);
  platform.setCollision(true);

  const sphere = new Sphere(scene);
  sphere.displayOnScene(0, 0, 0);
  sphere.getAdControl().setActive(true);
  sphere.getJumpYControl().setActive(true);
  sphere.setGravity(true);
  sphere.setCollision(true);

  (() => {
    const FACTOR = 8;

    sphere.getAdControl().addControlEventListener(
      new ControlEventListener(StatusActiveControlEvent, () => {
        sphere.setHeight(32 * (FACTOR / 10));
      })
    );
    sphere.getAdControl().addControlEventListener(
      new ControlEventListener(StatusInactiveControlEvent, () => {
        sphere.up(32 * ((10 - FACTOR) / 10));
        sphere.setHeight(32 * 1);
      })
    );
  })();

  const sphere2 = new Sphere(scene);
  sphere2.displayOnScene(500, 300, 0);
  sphere2.setCollision(true);
  sphere2.setGravity(true);

  scene.getCamera().setAttachedObject(sphere);
}
