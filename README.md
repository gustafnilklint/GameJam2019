# GameJam2019

Starter repository for the "Make a game"-session of the K-weekend in Spring 2019

## Server

### Stack

- [ws](https://github.com/websockets/ws) (WebSocket library)
- [matter-js](https://github.com/liabru/matter-js) (For lin.alg. and physics simulation)

### How to use

`npm install` will install the packages needed.

`npm start` will start server. Do this before you start the client

## Client

### Stack

- [Pixi 4](http://www.pixijs.com/) (Renderer)
- [Mousetrap](https://github.com/ccampbell/mousetrap#readme) (Keyboard input)
- [Howler](https://howlerjs.com/) (Sound)

- [Babel 7](https://babeljs.io/) ([preset-env](https://github.com/babel/babel/tree/master/packages/babel-preset-env)) (Transpiler)
- [Webpack 4](https://webpack.js.org/) (Module bundler)
- [Jest 22](https://facebook.github.io/jest/) (Unit test runner)

### Requirements

- Node JS 8 (or later, probably)

### How to use

`npm install` will install the packages needed.

`npm start` will start client.

`npm run build` will produce a build of the client.

`npm test` will run all client tests, if any, using [Jest](https://jestjs.io/).

## "Game Design Tips"

Turn-based vs real-time

#### Suitable genres

- Simple Platformer (physics, hitboxes, realtime)
- Puzzle
- Social (Jackbox-ish)
