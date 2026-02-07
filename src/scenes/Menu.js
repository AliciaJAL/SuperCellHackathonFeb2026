class Menu extends Phaser.Scene {
    constructor() {
      super('menuScene');
    }
  
    create() {
      // Show the HTML menu
      document.getElementById('menu-ui').style.display = 'block';
  
      const startBtn = document.getElementById('start-game');
      startBtn.onclick = () => this.startGame();
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
      fetch('http://localhost:3000/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
        .then(res => res.json())
        .then(data => {
          // Hide menu UI
          document.getElementById('menu-ui').style.display = 'none';
  
          // Pass data to next scene
          this.scene.start('playScene', {
            questionData: data
          });
        })
        .catch(err => {
          console.error(err);
          alert('Failed to generate question.');
        });
    }
  }
  