class Play extends Phaser.Scene {
    constructor() {
        super('playScene');
    }

    init(data) {
        // Handle data passing (Load Scene vs Global vs HTML)
        if (data && data.notes) {
            this.notes = data.notes;
        } else if (window.gameNotes) {
            this.notes = window.gameNotes;
        }
        
        // Safety: Ensure notes are a string
        if (Array.isArray(this.notes)) {
            this.notes = this.notes.join("\n");
        }
    }

    create() {
        const { width, height } = this.scale;

        // 1. Background
        this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);

        // 2. Loading State
        this.loadingText = this.add.text(width / 2, height / 2, 'Consulting the Oracle...', {
            fontSize: '24px', color: '#ffffff', align: 'center', fontFamily: '"Segoe UI", sans-serif'
        }).setOrigin(0.5);

        // 3. Validation
        if (!this.notes || typeof this.notes !== 'string' || this.notes.trim().length === 0) {
            this.handleError("No text found.\nPlease reload and upload notes.");
            return;
        }

        // 4. Start AI Generation
        this.fetchQuestion();
    }

    fetchQuestion() {
        fetch('http://localhost:3000/api/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: this.notes })
        })
        .then(res => res.json())
        .then(data => {
            this.loadingText.destroy();
            this.setupRoom(data);
        })
        .catch(err => {
            console.error(err);
            this.handleError("Server connection failed.");
        });
    }

    handleError(msg) {
        if (this.loadingText) this.loadingText.destroy();
        this.add.text(this.scale.width/2, this.scale.height/2, msg, {
            color: '#ff5555', fontSize: '24px', align: 'center'
        }).setOrigin(0.5);
    }

    setupRoom(data) {
        const { width, height } = this.scale;

        // --- QUESTION DISPLAY ---
        this.add.text(width / 2, 100, data.question, {
            fontSize: '28px', color: '#ffffff', 
            wordWrap: { width: width - 150 }, align: 'center',
            fontFamily: '"Segoe UI", sans-serif'
        }).setOrigin(0.5);


        // --- HINT BUTTON (Top Right) ---
        const hintBtn = this.add.container(width - 120, 50);
        
        // Button Background
        const btnBg = this.add.rectangle(0, 0, 140, 50, 0x333333)
            .setStrokeStyle(2, 0xffd700); // Gold border
        
        // Button Text
        const btnText = this.add.text(0, 0, "💡 GET HINT", {
            fontSize: '18px', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5);

        hintBtn.add([btnBg, btnText]);
        hintBtn.setSize(140, 50);
        hintBtn.setInteractive({ useHandCursor: true });

        // Hint Text Container (Hidden initially)
        this.hintText = this.add.text(width / 2, height - 80, `HINT: ${data.hint}`, {
            fontSize: '20px', color: '#ffd700', backgroundColor: '#000000',
            padding: { x: 10, y: 5 }, fontStyle: 'italic'
        }).setOrigin(0.5).setAlpha(0); // Invisible start

        // Button Logic
        hintBtn.on('pointerover', () => btnBg.setFillStyle(0x444444));
        hintBtn.on('pointerout', () => btnBg.setFillStyle(0x333333));
        hintBtn.on('pointerdown', () => {
            // Reveal Hint
            this.tweens.add({
                targets: this.hintText,
                alpha: 1,
                duration: 500
            });
            // Disable button after use
            hintBtn.disableInteractive();
            btnBg.setStrokeStyle(2, 0x555555);
            btnText.setColor('#888888');
            btnText.setText("HINT USED");
        });


        // --- DOORS / ANSWERS ---
        const startX = width * 0.2;
        const gap = width * 0.3;
        
        data.answers.forEach((ans, i) => {
            const doorX = startX + (i*gap);
            const doorY = height * 0.6;

            // Door Graphics
            const door = this.add.rectangle(doorX, doorY, 140, 220, 0x2d2d3a)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0x8b5cf6); // Purple border
            
            // Text below door
            this.add.text(doorX, doorY + 140, ans, { 
                fontSize: '18px', color: '#cccccc', 
                wordWrap: {width: 180}, align: 'center' 
            }).setOrigin(0.5, 0);
            
            // Hover
            door.on('pointerover', () => door.setFillStyle(0x4a4a6a));
            door.on('pointerout', () => door.setFillStyle(0x2d2d3a));
            
            // Click
            door.on('pointerdown', () => {
                if (i === data.correctIndex) {
                    this.add.text(width/2, height/2, "CORRECT!", { 
                        fontSize: '64px', color: '#4ade80', stroke: '#000', strokeThickness: 6
                    }).setOrigin(0.5);
                    this.cameras.main.flash(500, 0, 255, 0);
                    
                    // Reload level after 2 seconds
                    this.time.delayedCall(2000, () => this.scene.restart());
                } else {
                    this.cameras.main.shake(200, 0.01);
                    this.hintText.setText("WRONG DOOR! Try again.");
                    this.hintText.setAlpha(1);
                    this.hintText.setColor('#ff5555');
                }
            });
        });
    }
}