let boxCounter = 100; // First box number 
const table = document.getElementById('mainTable'); // To fetch element main table

// Command Pattern - Command Queue
const commandStack = []; 
const redoStack = [];
let isInitialLoad = true; // Flag variable to indicate initial table creation completed or not

// Base Command Class
class Command {
  execute() {} // Method for execute
  undo() {} // Method for undo
  redo() {} // Method for redo
}

// Command to Add a Row
class AddRowCommand extends Command {
  constructor() {
    super();
    this.addedRow = null; // To track the row added
  }

  execute() {
    const row = document.createElement('tr'); // Creates a new table row
    for (let i = 0; i < 3; i++) {
      const cell = document.createElement('td'); // Creates a new cell
      const box = document.createElement('div'); // Creates a new box
      box.className = 'box'; // Assign class name to box
      box.style.backgroundColor = getRandomColor(); // Assign a random color to the box
      box.innerText = boxCounter; // Assign a unique number to the box
      box.setAttribute('draggable', true); // Make the box a draggable box
      box.dataset.number = boxCounter += 100; // Increment the counter by 100
      cell.appendChild(box); // Add the box to the cell
      row.appendChild(cell); // Add the cell to the row
    }
    table.appendChild(row); // Add the row to the table
    this.addedRow = row; // Track the row for undo action
  }

  undo() {
    if (this.addedRow) {
      table.removeChild(this.addedRow); // Remove the row newly added
    }
  }
  redo() {
    table.appendChild(this.addedRow); // Add the row again
  }
}
// Command class to Swap Boxes
class SwapBoxesCommand extends Command {
  constructor(sourceCell, destinationCell) {
    super();
    this.sourceCell = sourceCell;
    this.destinationCell = destinationCell;
  }

  execute() {
    this._swapBoxes(this.sourceCell, this.destinationCell); // Swap the boxes
  }

  undo() {
    this._swapBoxes(this.destinationCell, this.sourceCell); // Swap back to initial locations
  }
  redo() {
    this._swapBoxes(this.sourceCell, this.destinationCell); // Redo the the swap
  }
    
  _swapBoxes(cellA, cellB) {
    const boxA = cellA.firstChild;
    const boxB = cellB.firstChild;
    if (boxA && boxB) {
      cellA.appendChild(boxB);
      cellB.appendChild(boxA);
    }
  }
}

// Function for generating random colors
function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// Function to execute a command
function executeCommand(command) {
  command.execute();
  if (!isInitialLoad) {
    commandStack.push(command); // Store the command for undo action
    redoStack.length = 0; // Clear redo stack
  }
}

// Function for Undo Functionality
function undo() {
  if (commandStack.length === 0) return; // No actions to undo as page is freshly loaded
  const lastCommand = commandStack.pop();
  lastCommand.undo();
  redoStack.push(lastCommand); // Add to redo stack
}

// Function for Redo Functionality
function redo() {
  if (redoStack.length === 0) return; // No actions to redo as page is freshly loaded
  const lastRedo = redoStack.pop();
  lastRedo.execute();
  commandStack.push(lastRedo); // Add back to command stack
}

// Event Handlers
document.getElementById('addRow').addEventListener('click', () => {
  isInitialLoad = false; // Now a user initiated move
  executeCommand(new AddRowCommand()); // Add a new row to the table
});

document.getElementById('undo').addEventListener('click', undo); // On click will trigger the undo functionality
document.getElementById('redo').addEventListener('click', redo); // On click will trigger the redo functionality

// Funtion for Drag and Drop feature
let sourceCell;
table.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('box')) {
    sourceCell = e.target.parentElement; // Save the source cell location
    e.dataTransfer.setData('text', e.target.dataset.number); // Swap the number inside the box as well
    e.target.style.opacity = '0.5'; // Add dragging effect
  }
});

table.addEventListener('dragover', (e) => e.preventDefault()); // When the drag happens, prevents the default behaviour of the element

table.addEventListener('drop', (e) => {
  e.preventDefault();
  const destinationCell = e.target.closest('td'); // Identify the drop target location
  if (destinationCell && destinationCell !== sourceCell) {
    const swapCommand = new SwapBoxesCommand(sourceCell, destinationCell);
    isInitialLoad = false; // Now a user initiated step
    executeCommand(swapCommand); // Execute swap as a command
  }
  const draggedBox = sourceCell.firstChild;
  if (draggedBox) {
    draggedBox.style.opacity = '1'; // To Restore the opacity
  }
});

// Initialize the table with rows
(function createInitialTable() {
  for (let i = 0; i < 3; i++) {
    executeCommand(new AddRowCommand());
  }
  isInitialLoad = false; // Mark as false when the page is loaded for the first time
})();