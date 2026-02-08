class Play extends Phaser.Scene {
    constructor() {
        super('playScene');
    }

    init(data) {
        this.notes = data.notes; // receive notes from Load scene
    }

    create() {
        if (!this.notes || this.notes.length === 0) {
            console.error('No notes provided');
            return;
        }

        // Background placeholder while fetching question
        this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "Generating your question...",
            { fontSize: '24px', color: '#ffffff' }
        ).setOrigin(0.5);

        // Fetch question from backend
        fetch('http://localhost:3000/api/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: this.notes })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Question received from backend:', data);
        
            if (data.error) {
                console.error('Backend returned an error:', data.error);
                // Use a fallback question
                this.questionData = {
                    question: "What is 2 + 2?",
                    answers: ["3", "4", "5"],
                    correctIndex: 1,
                    hint: "It's the number after 3"
                };
            } else {
                this.questionData = data;
            }
        
            this.setupRoom();
        })
        .catch(err => {
            console.error('Failed to generate question:', err);
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 50,
                "Failed to load question. Refresh and try again.",
                { fontSize: '18px', color: '#ff0000' }
            ).setOrigin(0.5);
        });
    }

    setupRoom() {
        const { width, height } = this.cameras.main;

        // Clear previous text
        this.children.removeAll();

        // Background
        this.add.sprite(width / 2, height / 2, 'background')
            .setDisplaySize(width, height);

        // Question Text
        this.questionText = this.add.text(
            width / 2,
            height / 6,
            this.questionData.question,
            { fontSize: '48px', color: '#0000000', wordWrap: { width: 600 }, align: 'center' }
        ).setOrigin(0.5);

        // Door positions
        const doorY = (height / 2) + 50;
        const positions = [width / 6, width / 2, (width / 6) * 5];

        // Doors and answers
        this.doors = [];
        this.answerTexts = [];
        for (let i = 0; i < 3; i++) {
            const isCorrect = i === this.questionData.correctIndex;
            const doorKey = isCorrect ? 'correctDoor' : 'wrongDoor';

            const door = this.add.sprite(positions[i], doorY, doorKey)
                .setInteractive()
                .setScale(0.5);
            this.doors.push(door);

            const answerText = this.add.text(
                positions[i],
                doorY - 80,
                this.questionData.answers[i],
                { fontSize: '24px', color: '#000000', wordWrap: { width: 150 }, align: 'center' }
            ).setOrigin(0.5);
            this.answerTexts.push(answerText);
        }

        // Hint Text
        this.hintText = this.add.text(
            width / 2,
            height - 50,
            "",
            { fontSize: '20px', color: '#ffeb3b', wordWrap: { width: 600 }, align: 'center' }
        ).setOrigin(0.5);

        // Assign door click handlers
        this.assignDoorAnswers();
    }

    assignDoorAnswers() {
        this.doors.forEach((door, i) => {
            door.on('pointerdown', () => this.handleDoorChoice(i));
        });
    }

    handleDoorChoice(choiceIndex) {
        if (choiceIndex === this.questionData.correctIndex) {
            this.hintText.setText("✅ Correct! Proceed to the next room.");
            // Optional: move to next scene after a delay
            // this.time.delayedCall(1500, () => this.scene.start('nextScene'));
        } else {
            this.hintText.setText("💡 Hint: " + this.questionData.hint);
        }
    }
}
