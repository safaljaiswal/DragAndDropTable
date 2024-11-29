let boxCounter = 100; // First Box number
let actionStack = []; // Stack to track undo action
let redoStack = []; // Stack to track redo action

const table = document.getElementById('mainTable');

// Function to generate intial table with 3 rows
function createInitialTable() {
  for (let i = 0; i < 3; i++) {
    addRow(false); // Add rows without recording in undo action stack
  }
}

// Function to Add rows
function addRow(pushAction = true) {
  const row = document.createElement('tr'); // Create a new table row
  for (let i = 0; i < 3; i++) {
    const cell = document.createElement('td'); // Create a new cell
    const box = document.createElement('div'); // Create a new box
    box.className = 'box'; // Assigns class name to element box
    box.style.backgroundColor = getRandomColor(); // Gives a random color to the box
    box.innerText = boxCounter; // Assign number to the box
    box.setAttribute('draggable', true); // Make the box draggable
    box.dataset.number = boxCounter +=100; // Increments the box number by 100
    cell.appendChild(box); // Add the box to the cell
    row.appendChild(cell); // Add the cell to the row
  }
  table.appendChild(row); // Append the row to the table
  if (pushAction) {
    actionStack.push({ type: 'addRow' }); // Adds the action to the actionStack to enable undo functionality
    redoStack.length = 0; // Clear redo stack after adding a new action
  }
}

// Function to generate a Random Color
function getRandomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

// Handle Drag and Drop functionality
table.addEventListener('dragstart', handleDragStart); // Add event listeners for Drag start funtionality
table.addEventListener('dragover', handleDragOver); // Add event listeners for Drag over funtionality
table.addEventListener('drop', handleDrop); // Add event listeners for Drop funtionality

let sourceCell;
// Function to handle Drag start functionality
function handleDragStart(e) {
  if (e.target.classList.contains('box')) {
    sourceCell = e.target.parentElement; // Save the source cell of the box
    e.dataTransfer.setData('text', e.target.dataset.number);
    e.target.style.opacity = '0.5'; // In-transit visual effect for the box
  }
}

function handleDragOver(e) {
  e.preventDefault(); // Allow dropping of the box
}

function handleDrop(e) {
  e.preventDefault();
  const destinationCell = e.target.closest('td'); // Target cell location
  if (destinationCell && destinationCell !== sourceCell) {
    const draggedBox = sourceCell.firstChild; // Box from the source cell
    const targetBox = destinationCell.firstChild; // Box from the target cell

    // Swapping of the boxes
    destinationCell.appendChild(draggedBox);
    sourceCell.appendChild(targetBox);

    draggedBox.style.opacity = '1'; // Restore opacity of the box

    // Record the action for undo or redo funtionality
    actionStack.push({
      type: 'dragDrop',
      source: sourceCell,
      destination: destinationCell,
    });
    redoStack.length = 0; // Clear the redo stack
  }
}

// Function for Undo Functionality
function undo() {
  if (actionStack.length === 0) return; // No actions to undo
  const lastAction = actionStack.pop();
  redoStack.push(lastAction); // Push to redo stack

  if (lastAction.type === 'addRow') {
    table.deleteRow(-1); // Remove the last row
  } else if (lastAction.type === 'dragDrop') {
    const { source, destination } = lastAction;
    source.appendChild(destination.firstChild); // Revert the swap
    destination.appendChild(source.firstChild);
  }
}

// Function for Redo Functionality
function redo() {
  if (redoStack.length === 0) return; // No actions to redo
  const lastRedo = redoStack.pop();
  actionStack.push(lastRedo); // Push back to action stack

  if (lastRedo.type === 'addRow') {
    addRow(false); // Again add the row
  } else if (lastRedo.type === 'dragDrop') {
    const { source, destination } = lastRedo;
    destination.appendChild(source.firstChild); // Redo the swap
    source.appendChild(destination.firstChild);
  }
}

// Attach event listeners for undo and redo buttons
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);

// Attach event listener for add row button
document.getElementById('addRow').addEventListener('click', () => addRow(true));

// Initialize the table
createInitialTable();
