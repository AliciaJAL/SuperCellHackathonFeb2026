const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [Load, Play],
    autoFocus: true
  };
  
const game = new Phaser.Game(config);
  
// STOP auto start
game.scene.stop('playScene');