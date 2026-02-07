let config = {
    type: Phaser.AUTO,
	width: window.innerWidth,  // Dynamically set to the window size
    height: window.innerHeight, // Dynamically set to the window size
    scale: {
        mode: Phaser.Scale.RESIZE, // Fit the game to the screen
        autoCenter: Phaser.Scale.CENTER_BOTH // Center the game canvas
    },

	physics: {

		scale: {
			mode: Phaser.Scale.FIT,
			autoCenter: Phaser.Scale.CENTER_BOTH,
		},
	},
    scene: [Load, Menu, Play]
	
}

let game = new Phaser.Game(config)