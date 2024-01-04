(function init() {
  const screen = new GameScreen();
  const scene = new Scene();
  const char1 = new Character(scene, "Robert");
  const char2 = new Character(scene, "Jon");
  const char3 = new Character(scene, "Brandon");

  screen.setScene(scene);

  scene.addObject(char1);
  scene.addObject(char2);
  scene.addObject(char3);

  char1.setXY(100, 100);
  char2.setXY(200, 350);
  char3.setXY(300, 200);

  char1.setCollision(true);
  char2.setCollision(true);
  char3.setCollision(true);

  char1.getDragAndDropControl().setActive(true);
  char2.getDragAndDropControl().setActive(true);
  char3.getDragAndDropControl().setActive(true);

  // const characters = [char1, char2];

  // characters.forEach((char) => {
  //   const clickToGetHello = new MouseDownEvent(() => {
  //     char.getWsadControl().setActive(!char.getWsadControl().getActive());
  //     char.getJumpYControl().setActive(!char.getJumpYControl().getActive());
  //     // char
  //     //   .getFollowCursorControl()
  //     //   .setActive(!char.getFollowCursorControl().getActive());

  //     if (char.getWsadControl().getActive()) {
  //       char.setColor("tomato");
  //     } else {
  //       char.setColor("cyan");
  //     }
  //   });

  //   char.mouse.addEvent(clickToGetHello);
  // });
})();
