import { Application, Sprite, loader } from "pixi.js";
import { bindKey, KEYS } from "./keyboard";

let PlayerTextures;
let AppleTexture;

const app = new Application();
const playerSprites = {};
const appleSprites = [];
const playerSpriteMap = {};
let playerConnectionNumber = 0;
let id;
let state;
let timeToLog = 1;

const getNextPlayerSprite = playerId => {
  if (!playerSpriteMap[playerId]) {
    playerSpriteMap[playerId] = PlayerTextures[playerConnectionNumber];
    playerConnectionNumber += 1;
  }
  return playerSpriteMap[playerId];
};

function renderApples(newState) {
  appleSprites.forEach(appleSprite => {
    app.stage.removeChild(appleSprite);
  });
  appleSprites.length = 0; // emptying appleSprites array
  Object.keys(newState.world.apples).forEach(appleId => {
    const apple = newState.world.apples[appleId];
    const appleSprite = new Sprite(AppleTexture);
    appleSprite.anchor.set(0.5, 0.5);
    appleSprite.x = apple.x;
    appleSprite.y = apple.y;
    appleSprite.width = apple.radius * 2;
    appleSprite.height = apple.radius * 2;
    app.stage.addChild(appleSprite);
    appleSprites.push(appleSprite);
  });
}

/**
 * Renders a player on the screen, including potential new players
 * @param {string} playerId
 * @param {{players: {}, world: {bullets: {}[]}}} newState
 */
function renderPlayer(playerId, newState) {
  const player = newState.players[playerId];
  const { path } = player;

  path.forEach((coords, i) => {
    if (!playerSprites[playerId]) {
      playerSprites[playerId] = {};
    }
    if (!playerSprites[playerId][i]) {
      const newPlayer = new Sprite(getNextPlayerSprite(playerId));
      newPlayer.anchor.set(0.5, 0.5);
      app.stage.addChild(newPlayer);
      playerSprites[playerId][i] = newPlayer;
      playerSprites[playerId][i].width = player.radius * 2;
      playerSprites[playerId][i].height = player.radius * 2;
    }

    playerSprites[playerId][i].x = coords.x;
    playerSprites[playerId][i].y = coords.y;
    playerSprites[playerId][i].rotation = player.rotation;
  });
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
  renderApples(newState);

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
    Object.values(KEYS).forEach(key => {
      bindKey(id, key, ws);
    });
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
  const url = "0.0.0.0";
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
  const PLAYER_IMAGE_ASSETS = [
    "assets/player1.png",
    "assets/player2.png",
    "assets/player3.png",
    "assets/player4.png",
    "assets/player5.png",
    "assets/player6.png",
    "assets/player7.png"
  ];
  const APPLE_IMAGE_ASSET = "assets/apple.png";

  return new Promise(res => {
    loader.add([...PLAYER_IMAGE_ASSETS, APPLE_IMAGE_ASSET]).load(() => {
      PlayerTextures = PLAYER_IMAGE_ASSETS.map(
        asset => loader.resources[asset].texture
      );
      AppleTexture = loader.resources[APPLE_IMAGE_ASSET].texture;
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
