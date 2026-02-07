class Play extends Phaser.Scene {

    constructor() {
        super('playScene')
		
    }


    create() {
		this.background = this.add.sprite(0, 0, "background").setOrigin(0.5, 0.5)

		this.background.setDisplaySize(window.innerWidth, window.innerHeight)
		this.background.setPosition(window.innerWidth / 2, window.innerHeight / 2)

        this.correctDoor = this.add.sprite(0, 0, "correctDoor").setOrigin(0.5, 0.5)
		this.correctDoor.setPosition(window.innerWidth / 2, (window.innerHeight / 4) *2)

		this.correctDoor = this.add.sprite(0, 0, "wrongDoor").setOrigin(0.5, 0.5)
		this.correctDoor.setPosition(window.innerWidth/6, (window.innerHeight / 4)*2)

		this.correctDoor = this.add.sprite(0, 0, "wrongDoor").setOrigin(0.5, 0.5)
		this.correctDoor.setPosition((window.innerWidth / 6)*5, (window.innerHeight /4)*2)

		
    }

    update(time, dt) {
		
	}		
}