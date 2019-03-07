const Matter = require("matter-js");

const players = new Map();
const world = {
  bullets: []
};

const SPEED = 5;
const ROTATION_SPEED = 0.08;
const BULLET_SPEED = 10;

/**
 * Adds a new player
 * @param {string} playerId
 */
function newPlayer(playerId) {
  const initialState = {
    x: Math.random() * 500,
    y: Math.random() * 500,
    width: 52,
    height: 70,
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
 * Moves the bullets, and removes them if they are out of bounds
 * @param {{x: number, y: number, direction: Matter.Vector}[]} bullets The current bullets
 * @returns {{x: number, y: number, direction: Matter.Vector}[]} The new bullets
 */
function moveBullets(bullets) {
  return bullets
    .filter(bullet => bullet)
    .map(bullet => {
      let newPositionVector = Matter.Vector.create(bullet.x, bullet.y);
      newPositionVector = Matter.Vector.add(
        newPositionVector,
        Matter.Vector.mult(bullet.direction, BULLET_SPEED)
      );

      // If bullet is out of bounds, remove from state
      const WIDTH = 600;
      const HEIGHT = 600;
      const { x, y } = newPositionVector;
      const bulletIsOutOfBounds = x > WIDTH || x < 0 || y > HEIGHT || y < 0;
      return bulletIsOutOfBounds
        ? null
        : { ...bullet, x: newPositionVector.x, y: newPositionVector.y };
    })
    .filter(b => !!b);
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

/**
 * Moves the player if the `w` or `s` key has been pressed
 * @returns {{x: number, y: number}} The new position of the player
 */
function movePlayer(pressedKeys, state) {
  if (pressedKeys.w === "keydown" || pressedKeys.s === "keydown") {
    const speed = pressedKeys.w === "keydown" ? SPEED : -SPEED;

    let translation = Matter.Vector.create(0, -1);
    translation = Matter.Vector.rotate(translation, state.rotation);
    translation = Matter.Vector.mult(translation, speed);

    const currentPosition = Matter.Vector.create(state.x, state.y);
    const nextPosition = Matter.Vector.add(currentPosition, translation);

    return { x: nextPosition.x, y: nextPosition.y };
  }
  return { x: state.x, y: state.y };
}

/**
 * Shoots if space key was released.
 * @returns {void}
 */
function shoot(pressedKeys, state) {
  if (pressedKeys.space === "release") {
    const direction = Matter.Vector.rotate(
      Matter.Vector.create(0, -1),
      state.rotation
    );

    world.bullets.push({
      x: state.x + direction.x * state.height,
      y: state.y + direction.y * state.width,
      radius: 6,
      direction
    });
    pressedKeys.space = "keyup";
  }
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
  state.x = x;
  state.y = y;

  shoot(pressedKeys, state);

  players.set(id, { ...player, state });
}

function checkCollisions() {
  // Check all players vs all bullets for spherical collision
  const { bullets } = world;
  bullets.forEach(bullet => {
    players.forEach(({ state: player }, playerId) => {
      const playerRadius = Math.min(player.width, player.height);

      const dx = player.x - bullet.x;
      const dy = player.y - bullet.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < playerRadius + bullet.radius) {
        players.delete(playerId);
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

  world.bullets = moveBullets(world.bullets);

  checkCollisions();

  const nextState = {
    players: [...players.keys()]
      .map(id => ({ id, state: players.get(id).state }))
      .reduce((prevState, client) => {
        return { ...prevState, [client.id]: client.state };
      }, {}),
    world
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
