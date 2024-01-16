import {
  GameObject,
  GameScreen,
  MouseDownEvent,
  GameMouseEventListener,
  Scene,
} from "../api";

class Character extends GameObject {
  constructor(scene: Scene, public name: string) {
    const html = Character.generateHtml("red");
    super(scene, html);
  }

  sayHello() {
    alert(`Hello, my name is ${this.name}`);
  }

  static generateHtml(color: string) {
    const html = document.createElement("div");
    html.classList.add("character");
    html.classList.add(`char-${color}`);
    return html;
  }

  toBlue() {
    this.updateTextureHtml(Character.generateHtml("blue"));
  }

  toRed() {
    this.updateTextureHtml(Character.generateHtml("red"));
  }
}

class Bar extends GameObject {
  constructor(scene: Scene, color: string) {
    const html = document.createElement("div");
    html.classList.add("bar");
    html.classList.add(color);

    super(scene, html);
  }
}

class MainScene extends Scene {
  constructor() {
    super();
  }
}

export function init() {
  const screen = new GameScreen();
  const scene = new MainScene();
  const char1 = new Character(scene, "Robert");
  const char2 = new Character(scene, "Jon");
  const char3 = new Character(scene, "Brandon");

  const bar1 = new Bar(scene, "green");
  const bar2 = new Bar(scene, "brown");

  screen.setActiveScene(scene);

  scene.addObject(char1);
  scene.addObject(char2);
  scene.addObject(char3);

  scene.addObject(bar1);
  scene.addObject(bar2);

  char1.setXY(100, 100);
  char2.setXY(200, 350);
  char3.setXY(300, 200);

  bar1.setY(500);
  bar2.setY(500 + bar1.getBoundaries().bottom - bar1.getBoundaries().top);
  bar2.getTextureHtml().style.height = "5rem";

  bar1.setCollision(true);
  bar2.setCollision(true);

  char1.setCollision(true);
  char2.setCollision(true);
  char3.setCollision(true);

  scene.objects.forEach((char) => {
    const clickToGetHello = new GameMouseEventListener(
      new MouseDownEvent(),
      () => {
        char.setGravity(true);
        char.getAdControl().setActive(!char.getAdControl().getActive());
        // char.getWsadControl().setActive(!char.getWsadControl().getActive());
        char.getJumpYControl().setActive(!char.getJumpYControl().getActive());
        // char
        //   .getFollowCursorOnMoveControl()
        //   .setActive(!char.getFollowCursorOnMoveControl().getActive());

        if (char.getAdControl().getActive()) {
          // char.toBlue();
        } else {
          if (char instanceof Character) {
            char.toRed();
          }
        }
      }
    );
    char.mouse.addListener(clickToGetHello);
  });
}
