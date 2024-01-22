export class Exception {
  constructor(public message: string) {
    alert(`ERROR: ${message}`);
    console.error(message);
    //@ts-ignore
    const screen = window.gameScreen;
    if (screen) {
      screen.shutdown();
    }
  }
}
