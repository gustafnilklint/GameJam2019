import { Application, Sprite, loader } from "pixi.js";
import { bindKey, KEYS } from "./keyboard";

let PlayerTexture;
let BulletTexture;

const app = new Application();
const playerSprites = {};
const bulletSprites = [];
let id;
let state;

/**
 * Renders bullets by removing them all and adding them again
 * @param {object} newState
 */
function renderBullets(newState) {
  bulletSprites.forEach(bulletSprite => {
    app.stage.removeChild(bulletSprite);
  });
  bulletSprites.length = 0; // emptying bulletSprites array

  newState.world.bullets.forEach(bullet => {
    const bulletSprite = new Sprite(BulletTexture);
    bulletSprite.x = bullet.x;
    bulletSprite.y = bullet.y;
    app.stage.addChild(bulletSprite);
    bulletSprites.push(bulletSprite);
  });
}

/**
 * Renders a player on the screen, including potential new players
 * @param {string} playerId
 * @param {{players: {}, world: {bullets: {}[]}}} newState
 */
function renderPlayer(playerId, newState) {
  const player = newState.players[playerId];

  if (!playerSprites[playerId]) {
    const newPlayer = new Sprite(PlayerTexture);
    newPlayer.anchor.set(0.5, 0.5);
    app.stage.addChild(newPlayer);
    playerSprites[playerId] = newPlayer;
    playerSprites[playerId].width = player.width;
    playerSprites[playerId].height = player.height;
  }

  playerSprites[playerId].x = player.x;
  playerSprites[playerId].y = player.y;
  playerSprites[playerId].rotation = player.rotation;
}

/**
 * Removes a dead player
 * @param {string} playerId
 */
function removeDeadPlayer(playerId) {
  app.stage.removeChild(playerSprites[playerId]);
  delete playerSprites[playerId];
}

/**
 * Renders the game according to the newState object
 * @param {object} newState
 */
function render(newState) {
  state = state || newState; // handle first state update

  const serverPlayers = Object.keys(newState.players);
  const clientPlayers = Object.keys(state.players);

  const alivePlayers = serverPlayers.filter(x => clientPlayers.includes(x));
  const deadPlayers = clientPlayers.filter(x => !serverPlayers.includes(x));

  deadPlayers.forEach(removeDeadPlayer);
  alivePlayers.forEach(playerId => renderPlayer(playerId, newState));
  renderBullets(newState);

  state = newState;
}

/**
 * Handles a message from the server
 * @param {{data: { type: string, value: any}}} message
 * @param {WebSocket} ws
 */
function handleMessage(message, ws) {
  const data = JSON.parse(message.data);
  if (data.type === "id") {
    id = data.value;
    Object.values(KEYS).forEach(key => bindKey(id, key, ws));
  } else if (data.type === "state") {
    render(data.value);
  } else if (data.type === "ping") {
    ws.send(JSON.stringify({ id, type: "pong" }));
  }
}

/**
 * Initiates a connection to the server
 */
function initiateSockets() {
  const url = "127.0.0.1";
  const port = 3000;
  const ws = new WebSocket(`ws://${url}:${port}`);
  ws.onmessage = message => handleMessage(message, ws);
}

/**
 * Sets up background color and size playing field
 */
function setupRenderer() {
  app.renderer.backgroundColor = 0x1e1e1e;
  app.renderer.resize(600, 600);
}

/**
 * Loads assets for player and bullet
 */
function loadAssets() {
  const PLAYER_IMAGE_ASSET = "assets/player.png";
  const BULLET_IMAGE_ASSET = "assets/bullet.png";

  return new Promise(res => {
    loader.add([PLAYER_IMAGE_ASSET, BULLET_IMAGE_ASSET]).load(() => {
      PlayerTexture = loader.resources[PLAYER_IMAGE_ASSET].texture;
      BulletTexture = loader.resources[BULLET_IMAGE_ASSET].texture;
      res();
    });
  });
}

/**
 * Starts the game
 */
async function main() {
  await loadAssets();
  setupRenderer();
  initiateSockets();
}

document.body.appendChild(app.view);
main();
