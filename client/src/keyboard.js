import * as Mousetrap from "mousetrap";
import { Howl } from "howler";

export const KEYS = {
  a: "a",
  d: "d",
  w: "w",
  s: "s",
  left: "left",
  right: "right",
  space: "space"
};

const sound = new Howl({
  src: ["../assets/laser1.wav"],
  volume: 0.5
});

/**
 * Binds a keyboard key to send message to the server when pressed.
 * @param {string} id
 * @param {string} key
 * @param {WebSocket} ws
 */
export function bindKey(id, key, ws) {
  const keydown = "keydown";
  Mousetrap.bind(
    key,
    () => {
      ws.send(JSON.stringify({ id, type: keydown, key }));
    },
    keydown
  );

  const keyup = "keyup";
  Mousetrap.bind(
    key,
    () => {
      if (key === KEYS.space) {
        sound.play();
        console.log("playing sound");
      }
      ws.send(JSON.stringify({ id, type: keyup, key }));
    },
    keyup
  );
}
