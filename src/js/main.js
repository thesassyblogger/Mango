import { initInteractions } from "./interactions.js";
import { createMangoScene } from "./scene.js";

const canvas = document.querySelector("#mango-scene");

if (canvas) {
  const sceneControls = createMangoScene(canvas);
  initInteractions(sceneControls);
}
