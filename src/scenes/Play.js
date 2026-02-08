class Play extends Phaser.Scene {
    constructor() {
        super('playScene');
    }

    init(data) {
        // 1. Priority: Data passed from Load Scene
        if (data && data.notes) {
            this.notes = data.notes;
        } 
        // 2. Fallback: Global variable
        else if (window.gameNotes) {
            this.notes = window.gameNotes;
        }
        
        // 3. Ensure it's a string (Safety Check)
        if (Array.isArray(this.notes)) {
            this.notes = this.notes.join("\n");
        }
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0);

        // Loading Text
        this.loadingText = this.add.text(width / 2, height / 2, 'Sending data to AI...', {
            fontSize: '24px', color: '#ffffff', align: 'center', fontFamily: 'sans-serif'
        }).setOrigin(0.5);

        // Validation
        if (!this.notes || typeof this.notes !== 'string' || this.notes.trim().length === 0) {
            console.error("Notes Error:", this.notes);
            this.handleError("No text found.\nPlease reload and paste text again.");
            return;
        }

        // Send to AI
        this.fetchQuestion();
    }

    fetchQuestion() {
        console.log("Sending to Server...");
        
        fetch('http://localhost:3000/api/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: this.notes })
        })
        .then(res => res.json())
        .then(data => {
            console.log("AI Data Received:", data);
            this.loadingText.destroy();
            this.setupRoom(data);
        })
        .catch(err => {
            console.error(err);
            this.handleError("Server connection failed.\nIs 'node server/index.js' running?");
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

        // Show Question
        this.add.text(width / 2, 100, data.question, {
            fontSize: '28px', color: '#ffffff', wordWrap: { width: width - 100 }, align: 'center'
        }).setOrigin(0.5);

        // Show Answers (Clickable)
        const startX = width * 0.2;
        const gap = width * 0.3;
        
        data.answers.forEach((ans, i) => {
            const btn = this.add.rectangle(startX + (i*gap), height/2 + 100, 150, 200, 0x2d2d3a)
                .setInteractive()
                .setStrokeStyle(2, 0x8b5cf6);
            
            this.add.text(btn.x, btn.y + 120, ans, { fontSize: '16px', wordWrap: {width: 140}, align: 'center' }).setOrigin(0.5);
            
            btn.on('pointerdown', () => {
                if (i === data.correctIndex) {
                    this.add.text(width/2, height-100, "CORRECT! Reloading...", { color: '#4ade80', fontSize: '32px' }).setOrigin(0.5);
                    this.time.delayedCall(2000, () => this.scene.restart());
                } else {
                    this.cameras.main.shake(200, 0.01);
                }
            });
        });
    }
}