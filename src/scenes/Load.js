class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        // Loading bar
        let loadingBar = this.add.graphics();
        this.load.on('progress', (value) => {
            loadingBar.clear();
            loadingBar.fillStyle(0xFFFFFF, 1);
            loadingBar.fillRect(0, window.innerHeight / 2, window.innerWidth * value, 5);
        });
        this.load.on('complete', () => {
            loadingBar.destroy();
        });

        // Load assets
        this.load.image('correctDoor', './assets/correctDoor.png');
        this.load.image('wrongDoor', './assets/wrongDoor.png');
        this.load.image('background', './assets/background.jpg');
    }

    create() {
        // Check for uploaded notes
        const notes = window.gameNotes || ["Default note 1", "Default note 2"];
        this.scene.start('playScene', { notes });
    }
}