class MainScene extends Scene {
  constructor(screen) {
    super(screen);

    this.setWidth(window.innerWidth);
  }
}

class Ground extends GameObject {
  static INITIAL_TYPE = "grass";

  constructor(scene) {
    const textureHtml = Ground.generateHtml(Ground.INITIAL_TYPE);
    super(scene, textureHtml);

    this.type = Ground.INITIAL_TYPE;
  }

  /**
   * @param {string} type - "grass" | "dirt" | "sand" | "snow"
   * @returns {HTMLDivElement}
   * @static
   */
  static generateHtml(type = "grass") {
    const html = document.createElement("div");
    html.classList.add("ground");

    const surface = document.createElement("div");
    surface.classList.add("surface");
    surface.classList.add(type);
    html.appendChild(surface);

    const terrain = document.createElement("div");
    terrain.classList.add("terrain");

    const terrainTextureMap = {
      grass: "dirt",
      dirt: "dirt",
      sand: "sand",
      snow: "dirt",
    };
    terrain.classList.add(terrainTextureMap[type]);

    html.appendChild(terrain);

    return html;
  }

  setType(type) {
    this.type = type;
    this.updateTextureHtml(Ground.generateHtml(type));
  }

  getType() {
    return this.type;
  }
}

class Sphere extends GameObject {
  constructor(scene) {
    const html = Sphere.generateHtml();

    super(scene, html);
  }

  static generateHtml() {
    const html = document.createElement("div");
    html.classList.add("sphere");
    return html;
  }
}

(function init() {
  const screen = new GameScreen();
  const scene = new MainScene(screen);
  const camera = new Camera();

  scene.setCamera(camera);

  scene.setBackgroundColor("skyblue");

  screen.setActiveScene(scene);

  const ground = new Ground(scene);
  ground.displayOnScene(0, 0, 0);
  ground.setY(
    window.innerHeight -
      ground.getContainerHtml().getBoundingClientRect().height
  );
  ground.setCollision(true);

  const sphere = new Sphere(scene);
  sphere.displayOnScene(0, 0, 0);
  sphere.getAdControl().setActive(true);
  sphere.getJumpYControl().setActive(true);
  sphere.setGravity(true);
  sphere.setCollision(true);

  const sphere2 = new Sphere(scene);
  sphere2.displayOnScene(500, 300, 0);
  sphere2.setCollision(true);
  sphere2.setGravity(true);

  scene.getCamera().setAttachedObject(sphere);

  scene.setClosedBorders(true);

  const changeLevelOnSpacePressEvent = new KeyDownEvent(" ", (event) => {
    const random = ["grass", "dirt", "sand", "snow"].filter(
      (s) => s !== ground.getType()
    )[Math.floor(Math.random() * 3)];
    ground.setType(random);
  });

  // scene.keyboard.addEvent(changeLevelOnSpacePressEvent);
})();
