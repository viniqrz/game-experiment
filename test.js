class Character extends GameObject {
  constructor(scene, name, age, items) {
    const html = Character.generateHtml("red");

    super(scene, html);

    this.name = name;
    this.age = age;
    this.items = items;
  }

  sayHello() {
    alert(`Hello, my name is ${this.name}`);
  }

  static generateHtml(color) {
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
  constructor(scene) {
    const html = document.createElement("div");
    html.classList.add("bar");

    super(scene, html);
  }
}

(function init() {
  const screen = new GameScreen();
  const scene = new Scene();
  const char1 = new Character(scene, "Robert");
  const char2 = new Character(scene, "Jon");
  const char3 = new Character(scene, "Brandon");

  const bar = new Bar(scene);
  bar.name = "bar";

  screen.setScene(scene);

  scene.addObject(char1);
  scene.addObject(char2);
  scene.addObject(char3);

  scene.addObject(bar);

  char1.setXY(100, 100);
  char2.setXY(200, 350);
  char3.setXY(300, 200);

  bar.setY(500);

  bar.setCollision(true);

  char1.setCollision(true);
  char2.setCollision(true);
  char3.setCollision(true);

  scene.objects.forEach((char) => {
    const clickToGetHello = new MouseDownEvent(() => {
      char.setGravity(true);
      char.getAdControl().setActive(!char.getAdControl().getActive());
      // char.getWsadControl().setActive(!char.getWsadControl().getActive());
      char.getJumpYControl().setActive(!char.getJumpYControl().getActive());
      // char
      //   .getFollowCursorOnMoveControl()
      //   .setActive(!char.getFollowCursorOnMoveControl().getActive());

      if (char.getAdControl().getActive()) {
        console.time();
        char.toBlue();
        console.timeEnd();
      } else {
        char.toRed();
      }
    });
    char.mouse.addEvent(clickToGetHello);
  });
})();
