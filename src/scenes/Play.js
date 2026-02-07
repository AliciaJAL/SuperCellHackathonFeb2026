class Play extends Phaser.Scene {
    constructor() {
      super('playScene');
    }
    
    init(data) {
      this.questionData = data.questionData;
    }
    
    create() {
      // --- Background ---
      this.background = this.add.sprite(
        window.innerWidth / 2,
        window.innerHeight / 2,
        'background'
      ).setDisplaySize(window.innerWidth, window.innerHeight);
  
      // --- Doors ---
      this.doors = [];
      this.doors.push(this.add.sprite(window.innerWidth / 6, (window.innerHeight / 4) * 2, 'wrongDoor'));
      this.doors.push(this.add.sprite(window.innerWidth / 2, (window.innerHeight / 4) * 2, 'correctDoor'));
      this.doors.push(this.add.sprite((window.innerWidth / 6) * 5, (window.innerHeight / 4) * 2, 'wrongDoor'));
  
      // --- Question Text ---
      this.questionText = this.add.text(
        window.innerWidth / 2,
        window.innerHeight / 6,
        this.questionData.question,
        { fontSize: '24px', color: '#ffffff', wordWrap: { width: 600 } }
      ).setOrigin(0.5);
  
      this.answers = this.questionData.answers;
      this.correctIndex = this.questionData.correctIndex;
      this.hint = this.questionData.hint;
  
      this.assignDoorAnswers();
    }
  
    assignDoorAnswers() {
      const shuffled = Phaser.Utils.Array.Shuffle(
        this.answers.map((text, index) => ({ text, index }))
      );
  
      shuffled.forEach((answer, i) => {
        this.doors[i].answerIndex = answer.index;
        this.doors[i].setInteractive();
        this.doors[i].on('pointerdown', () => this.handleDoorChoice(answer.index));
      });
    }
  
    handleDoorChoice(choiceIndex) {
      if (choiceIndex === this.correctIndex) {
        this.openDoor();
      } else {
        this.showHint(this.hint);
      }
    }
  
    openDoor() {
      console.log('Correct!');
      // Add animation, next question, or next room logic here
    }
  
    showHint(hint) {
      console.log('Hint:', hint);
      // You can also show hint text in the scene
    }
  }
  