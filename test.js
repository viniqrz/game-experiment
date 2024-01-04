(function init() {
  const screen = new GameScreen();
  const scene = new Scene();
  const char1 = new Character(scene, "Robert");
  const char2 = new Character(scene, "Jon");

  screen.setScene(scene);

  scene.addObject(char1);
  scene.addObject(char2);

  char1.setXY(100, 100);
  char2.setXY(200, 350);

  char1.setCollision(true);
  char2.setCollision(true);

  const characters = [char1, char2];

  characters.forEach((char) => {
    const clickToGetHello = new MouseDownEvent(() => {
      char.getWsadControl().setActive(!char.getWsadControl().getActive());
      char.getJumpYControl().setActive(!char.getJumpYControl().getActive());
      // char.setGravity(!char.getGravity());

      if (char.getWsadControl().getActive()) {
        char.setColor("tomato");
      } else {
        char.setColor("cyan");
      }
    });

    char.mouse.addEvent(clickToGetHello);
  });
})();
