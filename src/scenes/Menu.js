class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }


    create() {
		this.background = this.add.sprite(0, 0, "background").setOrigin(0.5, 0.5)

		this.background.setDisplaySize(window.innerWidth, window.innerHeight)
		this.background.setPosition(window.innerWidth / 2, window.innerHeight / 2)

        this.startKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.startKey)) {      
          this.scene.start('playScene')    
        }
    }
}