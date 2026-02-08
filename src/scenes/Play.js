class Play extends Phaser.Scene {
    constructor() {
        super('playScene');
        this.nextQuestionData = null; // Stores the invisible next question
        this.isFetching = false;      // Prevents double-fetching
        this.waitingForNext = false;  // Tracks if user is waiting on the AI
    }

    init(data) {
        // Handle notes data
        if (data && data.notes) {
            this.notes = data.notes;
        } else if (window.gameNotes) {
            this.notes = window.gameNotes;
        }
        
        if (Array.isArray(this.notes)) {
            this.notes = this.notes.join("\n");
        }
    }

    create() {
        const { width, height } = this.scale;

        // Reset states
        this.nextQuestionData = null;
        this.waitingForNext = false;
        this.isFetching = false;

        // 1. Background
        this.add.rectangle(0, 0, width, height, 0x111111).setOrigin(0).setDepth(0);

        // 2. Container for the room elements
        this.roomContainer = this.add.container(0, 0);

        // 3. Validation
        if (!this.notes || typeof this.notes !== 'string' || this.notes.trim().length === 0) {
            this.handleError("No text found.\nPlease reload and upload notes.");
            return;
        }

        // 4. Initial Loading Screen
        this.loadingText = this.add.text(width / 2, height / 2, 'Consulting the Oracle...', {
            fontSize: '24px', color: '#ffffff', align: 'center', fontFamily: '"Segoe UI", sans-serif'
        }).setOrigin(0.5).setDepth(10);

        // 5. Fetch the FIRST question immediately
        this.fetchQuestion(true); 
    }

    /**
     * @param {boolean} isInitialLoad - If true, displays immediately. If false, stores quietly.
     */
    fetchQuestion(isInitialLoad = false) {
        if (this.isFetching) return;
        this.isFetching = true;

        console.log(isInitialLoad ? "Fetching FIRST question..." : "Background fetching NEXT question...");

        fetch('http://localhost:3000/api/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: this.notes })
        })
        .then(res => res.json())
        .then(data => {
            this.isFetching = false;
            
            if (isInitialLoad) {
                // First load: Show it immediately
                if (this.loadingText) this.loadingText.destroy();
                this.setupRoom(data);
                // Trigger background fetch for Question 2
                this.fetchQuestion(false);
            } else {
                // Background load: JUST STORE IT. Do not show it.
                this.nextQuestionData = data;
                console.log("Next question secured in memory.");

                // If the user was already waiting at the "Door Unlocking..." screen,
                // let them in immediately.
                if (this.waitingForNext) {
                    this.transitionToNextLevel();
                }
            }
        })
        .catch(err => {
            console.error(err);
            this.isFetching = false;
            if (isInitialLoad) {
                this.handleError("Server connection failed.");
            } else {
                // If background fetch fails, we just try again when the user finishes the level
                console.warn("Background fetch failed. Will retry later.");
            }
        });
    }

    handleError(msg) {
        if (this.loadingText) this.loadingText.destroy();
        this.add.text(this.scale.width/2, this.scale.height/2, msg, {
            color: '#ff5555', fontSize: '24px', align: 'center'
        }).setOrigin(0.5).setDepth(100);
    }

    setupRoom(data) {
        // Clear previous room content
        this.roomContainer.removeAll(true); // 'true' destroys children
        this.waitingForNext = false; // Reset waiting flag

        const { width, height } = this.scale;

        // --- QUESTION ---
        const qText = this.add.text(width / 2, 100, data.question, {
            fontSize: '28px', color: '#ffffff', 
            wordWrap: { width: width - 150 }, align: 'center',
            fontFamily: '"Segoe UI", sans-serif',
            backgroundColor: '#00000088'
        }).setOrigin(0.5).setDepth(1);
        this.roomContainer.add(qText);

        // --- HINT SYSTEM ---
        this.hintText = this.add.text(width / 2, height - 100, `HINT: ${data.hint}`, {
            fontSize: '22px', color: '#ffd700', backgroundColor: '#222222',
            padding: { x: 20, y: 10 }, fontStyle: 'bold', align: 'center',
            wordWrap: { width: width - 200 }
        }).setOrigin(0.5).setAlpha(0).setDepth(100);
        this.roomContainer.add(this.hintText);

        const hintBtn = this.createHintButton(width, height);
        this.roomContainer.add(hintBtn);

        // --- DOORS ---
        const startX = width * 0.2;
        const gap = width * 0.3;
        
        data.answers.forEach((ans, i) => {
            const doorX = startX + (i*gap);
            const doorY = height * 0.6;

            const door = this.add.rectangle(doorX, doorY, 140, 220, 0x2d2d3a)
                .setInteractive({ useHandCursor: true })
                .setStrokeStyle(2, 0x8b5cf6);
            
            const doorText = this.add.text(doorX, doorY + 140, ans, { 
                fontSize: '18px', color: '#cccccc', wordWrap: {width: 180}, align: 'center' 
            }).setOrigin(0.5, 0);

            this.roomContainer.add([door, doorText]);
            
            door.on('pointerover', () => door.setFillStyle(0x4a4a6a));
            door.on('pointerout', () => door.setFillStyle(0x2d2d3a));
            
            door.on('pointerdown', () => {
                if (i === data.correctIndex) {
                    this.handleCorrectAnswer(door);
                } else {
                    this.cameras.main.shake(200, 0.01);
                    this.hintText.setText("WRONG DOOR! Try another.");
                    this.hintText.setAlpha(1);
                    this.hintText.setColor('#ff5555');
                }
            });
        });
    }

    createHintButton(width, height) {
        const container = this.add.container(width - 120, 50);
        const bg = this.add.rectangle(0, 0, 140, 50, 0x333333).setStrokeStyle(2, 0xffd700);
        const txt = this.add.text(0, 0, "💡 GET HINT", { fontSize: '18px', color: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
        container.add([bg, txt]);
        container.setSize(140, 50);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => bg.setFillStyle(0x444444));
        container.on('pointerout', () => bg.setFillStyle(0x333333));
        container.on('pointerdown', () => {
            this.tweens.add({ targets: this.hintText, alpha: 1, duration: 300 });
            container.disableInteractive();
            bg.setStrokeStyle(2, 0x555555);
            txt.setColor('#888888').setText("HINT USED");
        });
        return container;
    }

    handleCorrectAnswer(door) {
        const { width, height } = this.scale;

        // 1. Lock Interaction
        this.roomContainer.each(child => {
            if (child.input) child.disableInteractive();
        });

        // 2. Success Visuals
        this.cameras.main.flash(300, 0, 255, 0);
        const successText = this.add.text(width/2, height/2, "CORRECT!", { 
            fontSize: '64px', color: '#4ade80', stroke: '#000', strokeThickness: 6
        }).setOrigin(0.5).setDepth(200);

        // 3. Wait 1 second, then try to move on
        this.time.delayedCall(1000, () => {
            successText.destroy();
            this.tryNextLevel();
        });
    }

    tryNextLevel() {
        // Scenario A: AI is fast, data is already waiting
        if (this.nextQuestionData) {
            this.transitionToNextLevel();
        } 
        // Scenario B: AI is slow, we must wait
        else {
            this.waitingForNext = true;
            
            // Clean up the old room so it doesn't look stuck
            this.roomContainer.removeAll(true);
            
            // Show a "Door Unlocking" message instead of "Loading"
            this.loadingText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Unlocking next chamber...', {
                fontSize: '24px', color: '#aaaaaa', align: 'center', fontStyle: 'italic'
            }).setOrigin(0.5);

            // If the fetch failed previously or hasn't started, kick it again
            if (!this.isFetching) {
                this.fetchQuestion(false);
            }
        }
    }

    transitionToNextLevel() {
        if (this.loadingText) this.loadingText.destroy();
        
        // Retrieve data
        const nextData = this.nextQuestionData;
        this.nextQuestionData = null; // Clear storage
        
        // Build new room
        this.setupRoom(nextData);
        
        // Start pre-fetching the NEXT NEXT question
        this.fetchQuestion(false);
    }
}