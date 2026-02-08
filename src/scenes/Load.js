class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        // Simple Loading Bar
        let loadingBar = this.add.graphics();
        this.load.on('progress', (value) => {
            loadingBar.clear();
            loadingBar.fillStyle(0x8b5cf6, 1);
            loadingBar.fillRect(0, this.cameras.main.height / 2, this.cameras.main.width * value, 5);
        });
        this.load.on('complete', () => {
            loadingBar.destroy();
        });

        // Assets
        this.load.image('correctDoor', './assets/correctDoor.png');
        this.load.image('wrongDoor', './assets/wrongDoor.png');
        this.load.image('background', './assets/background.jpg');
    }

    create() {
        // DIRECT PASS: Just grab the global string and send it.
        const notes = window.gameNotes;
        
        console.log("Load Scene: Passing notes to Play Scene...");
        this.scene.start('playScene', { notes: notes });
    }
}