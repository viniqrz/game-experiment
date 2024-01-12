class MainScene extends Scene {
  constructor(screen) {
    super(screen);

    this.setHeight(window.innerHeight * 3);
    this.setWidth(window.innerWidth * 3);
    this.setBackground("linear-gradient(to bottom, skyblue, black)", {
      size: "cover",
      attachment: "scroll",
    });
    this.scaring = false;
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
  const scene = new MainScene();
  const camera = new Camera();

  scene.setCamera(camera);

  screen.setActiveScene(scene);

  const sphere = new Sphere(scene);
  sphere.displayOnScene(300, 300, 0);
  sphere.getWsadControl().setActive(true);
  sphere.getJumpYControl().setActive(false);

  const pressWToScare = new KeyDownEvent("w", () => {
    if (sphere.getY() > window.innerHeight * 2.5) {
      scene.scare();
    }
  });

  scene.keyboard.addEvent(pressWToScare);

  camera.setAttachedObject(sphere);
})();