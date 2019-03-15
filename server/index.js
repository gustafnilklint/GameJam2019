const WebSocket = require("ws");
const { newPlayer, removePlayer, gameLoop, isAlive } = require("./game");

const server = new WebSocket.Server({ port: 3000, clientTracking: true });

const clients = new Map();
const keyEvents = [];

/**
 * Takes data and broadcasts it to all clients
 * @param {any} data
 */
function broadcast(data) {
  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(data));
    }
  });
}

/**
 * Takes a message from a client and handles it correctly
 * @param {{type: string, id: string, key: string}} message
 */
function handleMessage(message) {
  const data = JSON.parse(message);
  if (data.type === "pong" && clients.has(data.id)) {
    clients.get(data.id).lastPong = new Date().getTime();
  } else {
    keyEvents.push(data);
  }
}

/**
 * Adds the new client to state and sends it an id
 * @param {WebSocket} ws
 */
function handleNewClient(ws) {
  const clientId = `player${clients.size}`;
  clients.set(clientId, { ws });

  newPlayer(clientId);
  ws.on("message", handleMessage);
  ws.send(JSON.stringify({ type: "id", value: clientId }));
}

/**
 * Calculate new state and broadcast it to clients
 */
function loop() {
  const nextState = gameLoop(keyEvents);
  keyEvents.length = 0; // empties the inputs array
  broadcast({ type: "state", value: nextState });
}

/**
 * Sends a heartbeat `ping` to clients to see if they have crashed/exited
 * Will remove clients after 30 seconds without response
 */
function heartbeat() {
  // Delete clients who have not responded in 30s
  clients.forEach((client, id) => {
    const ttl = 30 * 1000;
    const now = new Date().getTime();
    if (client.lastPong < now - ttl) {
      client.ws.close();
      clients.delete(id);
      removePlayer(id);
    }
    // Check that all clients have players, otherwise remove
    if (!isAlive(id)) {
      client.ws.close();
      clients.delete(id);
    }
  });

  broadcast({ type: "ping" });
}

server.on("connection", handleNewClient);
setInterval(loop, 1000 / 60); // 60 frames per second
setInterval(heartbeat, 5000); // Check that clients are still connected

console.log("Socket server up");
