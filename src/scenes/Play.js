class Play extends Phaser.Scene {
    constructor() {
        super('playScene');
    }

    init(data) {
        this.notes = data.notes;
    }

    create() {
        if (!this.notes || this.notes.length === 0) {
            console.error('No notes provided');
            return;
        }

        // Fetch question from backend
        fetch('http://localhost:3000/api/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: this.notes })
        })
        .then(res => res.json())
        .then(data => {
            console.log('Question received from backend:', data);
            this.questionData = data;
            this.setupRoom();
        })
        .catch(err => console.error('Failed to generate question:', err));
    }

    setupRoom() {
        // Background
        this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Doors
        this.doors = [];
        const positions = [
            this.cameras.main.width / 6,
            this.cameras.main.width / 2,
            (this.cameras.main.width / 6) * 5
        ];

        for (let i = 0; i < 3; i++) {
            const doorKey = i === this.questionData.correctIndex ? 'correctDoor' : 'wrongDoor';
            const door = this.add.sprite(positions[i], (this.cameras.main.height / 4) * 2, doorKey)
                .setInteractive();
            this.doors.push(door);
        }

        // Question Text
        this.questionText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 6,
            this.questionData.question,
            { fontSize: '24px', color: '#ffffff', wordWrap: { width: 600 }, align: 'center' }
        ).setOrigin(0.5);

        // Display Answers as text above doors
        this.answerTexts = [];
        for (let i = 0; i < this.questionData.answers.length; i++) {
            const text = this.add.text(
                positions[i],
                (this.cameras.main.height / 4) * 2 - 80,
                this.questionData.answers[i],
                { fontSize: '18px', color: '#fffb', wordWrap: { width: 150 }, align: 'center' }
            ).setOrigin(0.5);
            this.answerTexts.push(text);
        }

        this.hintText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            "",
            { fontSize: '20px', color: '#ffeb3b', wordWrap: { width: 600 }, align: 'center' }
        ).setOrigin(0.5);

        this.assignDoorAnswers();
    }

    assignDoorAnswers() {
        this.doors.forEach((door, i) => {
            door.on('pointerdown', () => this.handleDoorChoice(i));
        });
    }

    handleDoorChoice(choiceIndex) {
        if (choiceIndex === this.questionData.correctIndex) {
            this.hintText.setText("✅ Correct!");
        } else {
            this.hintText.setText("💡 Hint: " + this.questionData.hint);
        }
    }
}
