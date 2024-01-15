import { Scene } from "../scene";

export class GameScreen {
  width = window.innerWidth;
  height = window.innerHeight;

  html = GameScreen.GenerateHtml();
  scene?: Scene;

  constructor() {
    //@ts-ignore
    if (window.gameScreen) return window.gameScreen;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    const main = document.getElementById("main");

    main!.innerHTML = "";
    main!.appendChild(this.html);

    //@ts-ignore
    window.gameScreen = this;
  }

  static GenerateHtml() {
    const html = document.createElement("div");
    html.classList.add("screen");
    return html;
  }

  getScreenSize() {
    return { width: this.width, height: this.height };
  }

  setActiveScene(scene: Scene) {
    this.scene = scene;
    this.html.innerHTML = "";
    this.html.appendChild(this.scene.getHtml());
  }
}
