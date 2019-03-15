const Matter = require("matter-js");

const SIZE = 500;

const players = new Map();
const apples = new Map();
apples.set("1", createApple());
apples.set("2", createApple());
const world = {
  apples
};

const SPEED = 3;
const ROTATION_SPEED = 0.08;

function createApple() {
  return { x: Math.random() * SIZE, y: Math.random() * SIZE, radius: 50 };
}

/**
 * Adds a new player
 * @param {string} playerId
 */
function newPlayer(playerId) {
  const initialState = {
    x: Math.random() * SIZE,
    y: Math.random() * SIZE,
    radius: 24,
    length: 50,
    path: [],
    rotation: Math.random() * 2 * Math.PI
  };
  players.set(playerId, {
    pressedKeys: {},
    state: initialState
  });
}

/**
 * Removes a player
 * @param {string} playerId
 */
function removePlayer(playerId) {
  players.delete(playerId);
}

/**
 * Checks whether a player is still alive
 * @param {string} id
 */
function isAlive(id) {
  return players.has(id);
}

/**
 * Turns the player if the `a` or `d` key has been pressed
 * @returns {number} The rotation of the player, in radians
 */
function turnPlayer(pressedKeys, state) {
  if (pressedKeys.a === "keydown") {
    return state.rotation - ROTATION_SPEED;
  }
  if (pressedKeys.d === "keydown") {
    return state.rotation + ROTATION_SPEED;
  }
  return state.rotation;
}

function wrapAround({ x, y }) {
  let wrappedX = x % SIZE;
  let wrappedY = y % SIZE;
  if (wrappedX < 0) {
    wrappedX += SIZE;
  }
  if (wrappedY < 0) {
    wrappedY += SIZE;
  }
  return { x: wrappedX, y: wrappedY };
}

/**
 * Moves the player if the `w` or `s` key has been pressed
 * @returns {{x: number, y: number}} The new position of the player
 */
function movePlayer(pressedKeys, state) {
  let translation = Matter.Vector.create(0, -1);
  translation = Matter.Vector.rotate(translation, state.rotation);
  translation = Matter.Vector.mult(translation, SPEED);

  const currentPosition = Matter.Vector.create(state.x, state.y);
  const nextPosition = Matter.Vector.add(currentPosition, translation);
  const actualPosition = wrapAround(nextPosition);

  return actualPosition;
}

/**
 * Check pressedkeys, update player state
 * @param {{pressedKeys: {}, state: {x: number, y: number, width:number, height: number, rotation: number}}} player
 * @param {*} id
 */
function updatePlayer(player, id) {
  const { pressedKeys, state } = player;

  state.rotation = turnPlayer(pressedKeys, state);

  const { x, y } = movePlayer(pressedKeys, state);
  state.path.unshift({ x, y });
  state.path = state.path.slice(0, state.length);
  state.x = x;
  state.y = y;

  players.set(id, { ...player, state });
}

function checkCollisions() {
  // Check all players vs all bullets for spherical collision
  const apples = world.apples;
  apples.forEach((apple, appleId) => {
    players.forEach(({ state: player }, playerId) => {
      const dx = player.x - apple.x;
      const dy = player.y - apple.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < player.radius + apple.radius) {
        apples.set(appleId, createApple());
        player.length += 10;
      }
    });
  });
}

/**
 * Updates state according to pressedKeys and last state
 * @returns The updated state
 */
function updateState() {
  players.forEach(updatePlayer);

  checkCollisions();

  const nextState = {
    players: [...players.keys()]
      .map(id => ({ id, state: players.get(id).state }))
      .reduce((prevState, client) => {
        return { ...prevState, [client.id]: client.state };
      }, {}),
    world: {
      apples: [...apples.keys()].map(id => ({ id, ...apples.get(id) }))
    }
  };

  return nextState;
}

/**
 * Takes a list of key events and sets the pressedKeys object accordingly
 * @param {{id: string, type: string, key: string}[]} keyEvents
 */
function handleKeyInput(keyEvents) {
  keyEvents.forEach(keyEvent => {
    const client = players.get(keyEvent.id);
    if (client) {
      if (
        client.pressedKeys[keyEvent.key] === "keydown" &&
        keyEvent.type === "keyup"
      ) {
        client.pressedKeys[keyEvent.key] = "release";
      } else {
        client.pressedKeys[keyEvent.key] = keyEvent.type;
      }
      // check if previously keydown and now keyup
    }
  });
}

/**
 * Runs the game loop according to key events and current state
 * @param {{id: string, type: string, key: string}[]} keyEvents
 */
function gameLoop(keyEvents) {
  handleKeyInput(keyEvents);
  const nextState = updateState();
  return nextState;
}

module.exports = { gameLoop, newPlayer, removePlayer, isAlive };
