export class Exception {
  constructor(public message: string) {
    alert(`ERROR: ${message}`);
    console.error(message);
  }
}
