import * as Mousetrap from 'mousetrap';

const pressed = {};

export function isKeyDown(keyCode) {
  return pressed[keyCode];
}

function onKeyDown(event) {
  pressed[event] = true;
}

function onKeyUp(event) {
  pressed[event] = false;
}

export function addKey(key) {
  Mousetrap.bind(key, () => {
    onKeyDown(key);
  }, 'keydown');
  Mousetrap.bind(key, () => {
    onKeyUp(key);
  }, 'keyup');
}
