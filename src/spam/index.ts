export class Spam {
  callback: Function;
  delay: number;
  id: number | null;
  isRunning: boolean;
  lastStopAfter: number | null;

  constructor(callback: Function, delay: number) {
    this.callback = callback;
    this.delay = delay;
    this.id = null;
    this.isRunning = false;
    this.lastStopAfter = null;
  }

  async start(stopAfter: number | null = null) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.id = setInterval(this.callback, this.delay);
    this.lastStopAfter = stopAfter;

    if (stopAfter) {
      setTimeout(() => {
        this.stop();
      }, stopAfter);

      await this.sleep(stopAfter);
    }
  }

  sleep(time: number) {
    return new Promise((resolve) => setTimeout(() => resolve(true), time));
  }

  updateDelay(delay: number) {
    this.delay = delay;
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  getIsRunning() {
    return this.isRunning;
  }

  stop() {
    if (!this.id) return;
    this.isRunning = false;
    clearInterval(this.id);
  }
}
