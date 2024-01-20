import { GameObject } from ".";
import { Scene } from "../scene";

export class GrassChunk extends GameObject {
  constructor(scene: Scene, surfaceHeight = 16, dirtHeight = 96, width = 64) {
    super(scene, GrassChunk.generateHtml(surfaceHeight, dirtHeight));
    this.setWidth(width);
    this.setHeight(surfaceHeight + dirtHeight);
  }

  static generateHtml(surfaceHeight: number, dirtHeight: number) {
    const html = document.createElement("div");

    const surface = document.createElement("div");
    surface.style.background = "lime";
    surface.style.height = `${surfaceHeight}px`;

    html.appendChild(surface);

    const terrain = document.createElement("div");
    terrain.style.background = "rgb(126, 89, 71)";
    terrain.style.height = `${dirtHeight}px`;

    html.appendChild(terrain);

    return html;
  }
}
