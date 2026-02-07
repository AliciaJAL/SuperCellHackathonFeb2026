class Menu extends Phaser.Scene {
    constructor() {
      super('menuScene');
    }
  
    startGame() {
      const textArea = document.getElementById('notes-input');
      const fileInput = document.getElementById('file-input');
  
      // Priority: pasted text > file
      if (textArea.value.trim()) {
        this.sendNotes(textArea.value);
      } else if (fileInput.files.length > 0) {
        this.readFile(fileInput.files[0]);
      } else {
        alert('Please paste text or upload a file.');
      }
    }
  
    readFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
        this.sendNotes(reader.result);
        };
        reader.readAsText(file);
    }
  
    sendNotes(notes) {
        document.getElementById('loading-text').style.display = 'block';
      
        fetch('http://localhost:3000/api/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes })
        })
          .then(res => res.json())
          .then(data => {
            document.getElementById('menu-ui').style.display = 'none';
            document.getElementById('loading-text').style.display = 'none';
      
            this.scene.start('playScene', { questionData: data });
          })
          .catch(err => {
            console.error(err);
            alert('Failed to generate question.');
          });
        }

        assignDoorAnswers() {
            const shuffled = Phaser.Utils.Array.Shuffle(
            this.answers.map((text, index) => ({ text, index }))
        );
          
            shuffled.forEach((answer, i) => {
            const door = this.doors[i];
            door.answerIndex = answer.index;
            door.setInteractive();
          
            door.on('pointerdown', () => {
            this.handleDoorChoice(answer.index);
        });
          
            // Text under door
            const label = this.add.text(
            door.x,
            door.y + 120,
            answer.text,
            { fontSize: '16px', color: '#ffffff', align: 'center', wordWrap: { width: 200 } }
            ).setOrigin(0.5);
          
            this.answerTexts.push(label);
        });
    }

    showHint(hint) {
        if (this.hintText) this.hintText.destroy();
          
        this.hintText = this.add.text(
        window.innerWidth / 2,
        window.innerHeight - 100,
        `Hint: ${hint}`,
        { fontSize: '18px', color: '#ffcc00', wordWrap: { width: 600 } }
        ).setOrigin(0.5);
    }
          
          
 }
      

  