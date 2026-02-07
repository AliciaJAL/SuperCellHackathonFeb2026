class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }


    preload() {
        // loading bar
        let loadingBar = this.add.graphics();
        this.load.on('progress', (value) => {
            loadingBar.clear();                                 // reset fill/line style
            loadingBar.fillStyle(0xFFFFFF, 1);                  // (color, alpha)
            loadingBar.fillRect(0, window.innerWidth/2, window.innerHeight/2 * value, 5);  // (x, y, w, h)
        });
        this.load.on('complete', () => {
            loadingBar.destroy();
        });


        // load images
        this.load.image('correctDoor', './assets/correctDoor.png')
        this.load.image('wrongDoor', './assets/wrongDoor.png')
        this.load.image('background', './assets/background.jpg')
        // load audio
        // this.load.audio('doorOpen', './assets/doorOpen.mp3')

    }


    create() {
        this.scene.start('menuScene')
    }
}