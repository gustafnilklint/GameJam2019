import { Application, Sprite, loader } from 'pixi.js';
import { isKeyDown, addKey } from './keyboard';

const app = new Application();

function setupRenderer() {
  app.renderer.backgroundColor = 0x061639;
  app.renderer.autoResize = true;

  app.renderer.view.style.position = 'absolute';
  app.renderer.view.style.display = 'block';
  app.renderer.autoResize = true;
  app.renderer.resize(window.innerWidth, window.innerHeight);
}

let red;
let blue;
const RED_IMAGE = 'assets/red.png';
const BLUE_IMAGE = 'assets/blue.png';

function loadSprites() {
  loader.add([RED_IMAGE, BLUE_IMAGE]).load(() => {
    red = new Sprite(loader.resources[RED_IMAGE].texture);
    red.x = 200;
    red.y = 200;
    red.scale.set(10, 10);

    blue = new Sprite(loader.resources[BLUE_IMAGE].texture);
    blue.x = 400;
    blue.y = 200;
    blue.scale.set(10, 10);


    app.stage.addChild(red);
    app.stage.addChild(blue);
  });
}

const KEYS = {
  left: 'left',
  right: 'right',
  up: 'up',
  down: 'down',
  a: 'a',
  d: 'd',
  w: 'w',
  s: 's',
};


function setupGameLoop() {
  const gameLoop = (delta) => {
    const SPEED = 5;

    // red
    if (isKeyDown(KEYS.left)) {
      red.x -= (1 + delta) * SPEED;
    } else if (isKeyDown(KEYS.right)) {
      red.x += (1 + delta) * SPEED;
    }

    if (isKeyDown(KEYS.up)) {
      red.y -= (1 + delta) * SPEED;
    } else if (isKeyDown(KEYS.down)) {
      red.y += (1 + delta) * SPEED;
    }

    // blue
    if (isKeyDown(KEYS.a)) {
      blue.x -= (1 + delta) * SPEED;
    } else if (isKeyDown(KEYS.d)) {
      blue.x += (1 + delta) * SPEED;
    }

    if (isKeyDown(KEYS.w)) {
      blue.y -= (1 + delta) * SPEED;
    } else if (isKeyDown(KEYS.s)) {
      blue.y += (1 + delta) * SPEED;
    }
  };
  app.ticker.add(delta => gameLoop(delta));
}

function setupKeyboard() {
  Object.values(KEYS).forEach(k => addKey(k));
}

setupRenderer();
loadSprites();
setupGameLoop();
setupKeyboard();


document.body.appendChild(app.view);
