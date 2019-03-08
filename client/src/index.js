import * as Phaser from 'phaser';

let player;
let cursors;

function preload() {
  this.load.image('logo', 'assets/logo.png');
}

function create() {
  cursors = this.input.keyboard.createCursorKeys();
  player = this.physics.add.image(400, 150, 'logo');
  player.setCollideWorldBounds(true);
}


function update() {
  player.setVelocity(0);
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  }
  if (cursors.up.isDown) {
    player.setVelocityY(-300);
  } else if (cursors.down.isDown) {
    player.setVelocityY(300);
  }
}

const config = {
  parent: 'game',
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);
