/**
 * To-Do List Application
 * A multi-list task management application with drag-and-drop functionality
 */

// =========================================
//         CONFIGURATION
// =========================================

const CONFIG = {
  AUTOSAVE_INTERVAL_MS: 30000,
  DATE_UPDATE_INTERVAL_MS: 60000,
  DEFAULT_LIST_TITLE: 'To-Do List',
  PLACEHOLDER_NAME: '{insert your name}',
  LOCAL_STORAGE_KEYS: {
    USER_NAME: 'userName',
    HEADER_TITLE: 'headerTitle',
    LISTS: 'todoLists',
    DATA: 'data'
  },
  COLORS: {
    PLACEHOLDER_TEXT: '#888',
    DEFAULT_TEXT: 'inherit'
  }
};

// =========================================
//         GLOBAL STATE VARIABLES
// =========================================

let draggedList = null;
let isDraggingHandle = false;
let dragSrcEl = null;
let currentListToDelete = null;

// =========================================
//         INITIALISATION
// =========================================

/**
 * Initialise the application when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  initialiseUserInterface();
  initialiseEventListeners();
  loadSavedData();
  setupIntervals();
});

/**
 * Initialise the user interface components
 */
function initialiseUserInterface() {
  updateContainerCloseButtons();
  displayCurrentDate();
}

/**
 * Set up global event listeners
 */
function initialiseEventListeners() {
  // User name handling
  const userNameElement = document.getElementById('user-name');
  initialiseUserName(userNameElement);

  // Header title handling
  const headerTitleElement = document.getElementById('header-title');
  initialiseHeaderTitle(headerTitleElement);

  // Mouse event handling
  document.addEventListener('mouseup', () => {
    isDraggingHandle = false;
  });

  // Input event handling
  const inputBox = document.getElementById('input-box');
  if (inputBox) {
    inputBox.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        addTask();
      }
    });
  }

  // List container click handling
  const listContainer = document.getElementById('list-container');
  if (listContainer) {
    listContainer.addEventListener('click', (e) => handleListClick(e, listContainer));
  }

  // Drag and drop handling
  initialiseDragAndDrop();

  // Modal handling
  initialiseModals();
}

/**
 * Initialise user name element with saved data and event listeners
 * @param {HTMLElement} userNameElement - The user name DOM element
 */
function initialiseUserName(userNameElement) {
  const savedName = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.USER_NAME);
  
  if (savedName && savedName !== CONFIG.PLACEHOLDER_NAME) {
    userNameElement.innerText = savedName;
    userNameElement.style.color = CONFIG.COLOUR.DEFAULT_TEXT;
    userNameElement.style.fontStyle = 'normal';
  } else {
    userNameElement.innerText = CONFIG.PLACEHOLDER_NAME;
    userNameElement.style.color = CONFIG.COLOUR.PLACEHOLDER_TEXT;
    userNameElement.style.fontStyle = 'italic';
  }

  userNameElement.addEventListener('focus', function() {
    if (userNameElement.innerText === CONFIG.PLACEHOLDER_NAME) {
      userNameElement.innerText = '';
      userNameElement.style.color = CONFIG.COLOUR.DEFAULT_TEXT;
      userNameElement.style.fontStyle = 'normal';
      userNameElement.style.fontWeight = 'normal';
    }
  });

  userNameElement.addEventListener('blur', function() {
    saveName(userNameElement);
  });

  userNameElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      userNameElement.blur();
    }
  });

  attachNameClickHandler(userNameElement);
}

/**
 * Initialise header title element with saved data and event listeners
 * @param {HTMLElement} headerTitleElement - The header title DOM element
 */
function initialiseHeaderTitle(headerTitleElement) {
  const savedTitle = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.HEADER_TITLE);
  
  if (savedTitle) {
    headerTitleElement.innerText = savedTitle;
  }

  headerTitleElement.addEventListener('blur', function() {
    const title = this.innerText.trim();
    if (title !== '') {
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.HEADER_TITLE, title);
    } else {
      this.innerText = CONFIG.DEFAULT_LIST_TITLE;
      localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.HEADER_TITLE, CONFIG.DEFAULT_LIST_TITLE);
    }
  });

  headerTitleElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.blur();
    }
  });
}

/**
 * Initialise drag and drop functionality
 */
function initialiseDragAndDrop() {
  const initialTodoApp = document.querySelector('.todo-app');
  if (!initialTodoApp) return;
  
  const dragHandle = createDragHandle();
  dragHandle.addEventListener('mousedown', () => {
    isDraggingHandle = true;
  });
  
  initialTodoApp.insertBefore(dragHandle, initialTodoApp.firstChild);
  initialTodoApp.setAttribute('draggable', 'true');
  initialTodoApp.addEventListener('dragstart', handleDragStart);
  initialTodoApp.addEventListener('dragend', handleDragEnd);
  
  const container = document.querySelector('.container');
  document.addEventListener('dragover', handleDragOver);
  if (container) {
    container.addEventListener('drop', handleDrop);
  }
}

/**
 * Initialise modal dialogs
 */
function initialiseModals() {
  // Confirmation modal
  document.getElementById('confirm-btn').addEventListener('click', function() {
    if (currentListToDelete) {
      currentListToDelete.remove();
      updateContainerCloseButtons();
      saveAllLists();
    }
    hideConfirmationModal();
  });

  document.getElementById('cancel-btn').addEventListener('click', hideConfirmationModal);

  window.addEventListener('click', function(event) {
    const modal = document.getElementById('confirmation-modal');
    if (event.target === modal) {
      hideConfirmationModal();
    }
  });

  // Feedback modal
  initialiseFeedbackModal();
}

/**
 * Initialise the feedback modal
 */
function initialiseFeedbackModal() {
  // Initialise EmailJS
  (function() {
    emailjs.init("LvZWl0qGgsXQprqKp");
  })();

  const feedbackModal = document.getElementById('feedbackModal');
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackSpan = document.getElementsByClassName('close')[0];

  feedbackBtn.onclick = function() {
    feedbackModal.style.display = 'block';
    setTimeout(() => {
      feedbackModal.classList.add('show');
    }, 10);
  };

  feedbackSpan.onclick = function() {
    feedbackModal.classList.remove('show');
    setTimeout(() => {
      feedbackModal.style.display = 'none';
    }, 300);
  };

  window.addEventListener('click', function(event) {
    if (event.target == feedbackModal) {
      feedbackModal.classList.remove('show');
      setTimeout(() => {
        feedbackModal.style.display = 'none';
      }, 300);
    }
  });

  document.getElementById('feedbackForm').addEventListener('submit', handleFeedbackSubmit);
}

/**
 * Handle feedback form submission
 * @param {Event} event - Form submission event
 */
function handleFeedbackSubmit(event) {
  event.preventDefault();

  const feedbackText = document.getElementById('feedbackText').value.trim();

  if (feedbackText === '') {
    alert('Please enter some feedback.');
    return;
  }

  const templateParams = {
    feedback: feedbackText
  };

  emailjs.send('service_fh0bnws', 'template_3t4v4im', templateParams)
    .then(function(response) {
      console.log('SUCCESS!', response.status, response.text);
      alert('Feedback sent successfully!');
      document.getElementById('feedbackModal').style.display = 'none';
      document.getElementById('feedbackText').value = '';
    }, function(error) {
      console.log('FAILED...', error);
      alert('Failed to send feedback. Please try again later.');
    });
}

/**
 * Load saved data from local storage
 */
function loadSavedData() {
  showTaskData();
  loadAllLists();
  updateSidebarList();
  updateAllDueDates();
}

/**
 * Set up intervals for automatic updates
 */
function setupIntervals() {
  setInterval(updateAllDueDates, CONFIG.DATE_UPDATE_INTERVAL_MS);
  // Add this new interval to update the current date
  setInterval(displayCurrentDate, CONFIG.DATE_UPDATE_INTERVAL_MS);
}

// =========================================
//         SIDEBAR & NAME STORAGE
// =========================================

/**
 * Toggle the sidebar visibility
 */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  
  if (!sidebar || !mainContent) return;
  
  sidebar.classList.toggle('collapsed');
  mainContent.classList.toggle('sidebar-collapsed');
}

/**
 * Save the user name
 * @param {HTMLElement} input - The input element containing the name
 */
function saveName(input) {
  const name = input.value ? input.value.trim() : '';
  const newSpan = document.createElement('span');
  newSpan.id = 'user-name';

  if (name === '') {
    newSpan.innerText = CONFIG.PLACEHOLDER_NAME;
    newSpan.style.color = CONFIG.COLOUR.PLACEHOLDER_TEXT;
    newSpan.style.fontStyle = 'italic';
  } else {
    newSpan.innerText = name;
    newSpan.style.color = CONFIG.COLOUR.DEFAULT_TEXT;
    newSpan.style.fontStyle = 'normal';
  }

  input.parentNode.replaceChild(newSpan, input);
  localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.USER_NAME, name);

  attachNameClickHandler(newSpan);
}

/**
 * Attach click handler to the name element
 * @param {HTMLElement} span - The name span element
 */
function attachNameClickHandler(span) {
  span.addEventListener('click', function() {
    const currentName = span.innerText;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName === CONFIG.PLACEHOLDER_NAME ? '' : currentName;
    input.classList.add('name-input');

    span.parentNode.replaceChild(input, span);
    input.focus();

    input.addEventListener('blur', function() {
      saveName(input);
    });

    input.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        event.preventDefault(); 
        input.blur(); 
      }
    });
  });
}

/**
 * Display the current date in the UI
 */
function displayCurrentDate() {
  const dateElement = document.getElementById('current-date');
  if (!dateElement) return;
  
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  dateElement.textContent = dateString;
}

/**
 * Update the sidebar list of to-do lists
 */
function updateSidebarList() {
  const listOfListsDiv = document.getElementById('list-of-lists');
  if (!listOfListsDiv) return;
  
  listOfListsDiv.innerHTML = '';
  let lists = [];
  
  try {
    const savedLists = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.LISTS);
    if (savedLists) {
      lists = JSON.parse(savedLists);
    }
  } catch (error) {
    console.error('Failed to parse saved lists:', error);
  }

  if (lists.length === 0) {
    const defaultTitle = document.querySelector('.todo-app h2')?.innerText || CONFIG.DEFAULT_LIST_TITLE;
    lists.push({ title: defaultTitle });
  }
  
  lists.forEach((list) => {
    const listItem = document.createElement('div');
    listItem.textContent = list.title;
    listItem.classList.add('sidebar-list-item');
    listOfListsDiv.appendChild(listItem);
  });
}

// =========================================
//        TASK MANAGEMENT
// =========================================

/**
 * Add a new task to the list
 */
function addTask() {
  const inputBox = document.getElementById('input-box');
  const listContainer = document.getElementById('list-container');
  
  if (!inputBox || !listContainer) return;
  
  if (inputBox.value === '') {
    alert('Please enter a task');
    return;
  }
  
  const li = document.createElement('li');
  li.innerHTML = inputBox.value;
  listContainer.appendChild(li);

  const span = document.createElement('span');
  span.innerHTML = '\u00d7';
  li.appendChild(span);

  li.setAttribute('draggable', 'true');
  addDragAndDropHandlers(li);
  
  inputBox.value = '';      
  saveData();
  saveAllLists();           
}

/**
 * Handle list item clicks
 * @param {Event} e - Click event
 * @param {HTMLElement} ulElement - The list container element
 */
function handleListClick(e, ulElement) {
  const li = e.target.closest('li');
  if (!li) return;

  const rect = li.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  // Handle click on checkbox area (first 35px)
  if (clickX < 35) {
    li.classList.toggle('checked');
    saveAllLists();
    saveData();
    return;
  }

  // Handle click on delete button
  if (e.target.tagName === 'SPAN') {
    e.target.parentElement.remove();
    saveData();
    saveAllLists();
    return;
  }

  // Handle click on task text (to edit)
  if (clickX >= 35 && e.target.tagName === 'LI') {
    editTask(li);
  }
}

/**
 * Edit a task
 * @param {HTMLElement} li - The list item element
 */
function editTask(li) {
  if (li.classList.contains('editing')) return;

  li.setAttribute('draggable', 'false');

  let storedDueDate = li.dataset.dueDate || null;
  let dueDateDisplay = li.querySelector('.due-date-display');
  if (dueDateDisplay) {
    dueDateDisplay.remove();
  }

  const currentText = li.firstChild ? li.firstChild.textContent.trim() : '';
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentText;
  input.classList.add('edit-input');
  li.classList.add('editing');

  const span = li.querySelector('span') || document.createElement('span');
  li.innerHTML = '';
  li.appendChild(input);
  li.appendChild(span);
  input.focus();

  // Add due date controls if there's a stored date
  if (storedDueDate) {
    addDueDateControls(li, storedDueDate);
  } else {
    addAddDueDateButton(li);
  }

  // Setup event listeners for saving edits
  input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      saveEdit();
    }
  });

  input.addEventListener('blur', function(e) {
    if (
      e.relatedTarget &&
      (e.relatedTarget.classList.contains('add-due-date-btn') ||
       e.relatedTarget.classList.contains('due-date-picker'))
    ) {
      return;
    }
    saveEdit();
  });

  function saveEdit() {
    const newText = input.value.trim() || currentText;
    li.innerHTML = newText;
    li.appendChild(span);
    li.classList.remove('editing');

    const controls = li.querySelectorAll('.add-due-date-btn, .due-date-controls, .due-date-picker');
    controls.forEach(ctrl => ctrl.remove());

    if (li.dataset.dueDate) {
      displayDueDate(li, li.dataset.dueDate);
    }
    li.style.color = 'inherit';

    li.setAttribute('draggable', 'true');
    addDragAndDropHandlers(li);
    saveData();
    saveAllLists();
  }
}

/**
 * Add due date controls to a task item
 * @param {HTMLElement} li - The list item element
 * @param {string} storedDueDate - The stored due date
 */
function addDueDateControls(li, storedDueDate) {
  let controlsContainer = document.createElement('div');
  controlsContainer.classList.add('due-date-controls');
  
  let changeDueDateBtn = document.createElement('button');
  changeDueDateBtn.textContent = 'Change Due Date';
  changeDueDateBtn.classList.add('add-due-date-btn');
  changeDueDateBtn.addEventListener('mousedown', e => e.preventDefault());
  changeDueDateBtn.addEventListener('click', () => {
    if (!li.querySelector('.due-date-picker')) {
      showDatePicker(li);
    }
  });
  controlsContainer.appendChild(changeDueDateBtn);
  
  let deleteDueDateBtn = document.createElement('button');
  deleteDueDateBtn.textContent = 'Delete Due Date';
  deleteDueDateBtn.classList.add('add-due-date-btn');
  deleteDueDateBtn.addEventListener('mousedown', e => e.preventDefault());
  deleteDueDateBtn.addEventListener('click', () => {
    let ddDisplay = li.querySelector('.due-date-display');
    if (ddDisplay) ddDisplay.remove();
    delete li.dataset.dueDate;
    controlsContainer.remove();
    addAddDueDateButton(li);
  });
  controlsContainer.appendChild(deleteDueDateBtn);
  
  li.appendChild(controlsContainer);
}

/**
 * Add "Add Due Date" button to a task
 * @param {HTMLElement} li - The list item element
 */
function addAddDueDateButton(li) {
  let addDueDateBtn = document.createElement('button');
  addDueDateBtn.textContent = 'Add Due Date';
  addDueDateBtn.classList.add('add-due-date-btn');
  addDueDateBtn.addEventListener('mousedown', e => e.preventDefault());
  addDueDateBtn.addEventListener('click', () => {
    if (!li.querySelector('.due-date-picker')) {
      showDatePicker(li);
    }
  });
  li.appendChild(addDueDateBtn);
}

// =========================================
//        DUE DATE FUNCTIONALITY
// =========================================

/**
 * Format a date object to a readable string
 * @param {Date} dateObj - The date object to format
 * @returns {string} The formatted date string
 */
function formatDate(dateObj) {
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

/**
 * Get the ordinal suffix for a day number
 * @param {number} day - The day of the month
 * @returns {string} The ordinal suffix
 */
function getOrdinal(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/**
 * Show the date picker for a task
 * @param {HTMLElement} taskElement - The task element
 */
function showDatePicker(taskElement) {
  if (taskElement.querySelector('.due-date-picker')) return;
  
  const dateInput = document.createElement('input');
  dateInput.classList.add('due-date-picker');
  taskElement.appendChild(dateInput);

  const fp = flatpickr(dateInput, {
    onChange: function(selectedDates, dateStr) {
      displayDueDate(taskElement, dateStr);
      const btns = taskElement.querySelectorAll('.add-due-date-btn, .change-due-date-btn, .delete-due-date-btn');
      btns.forEach(btn => btn.style.display = 'none');
      dateInput.remove();
    }
  });
  fp.open();
}

/**
 * Display a due date on a task
 * @param {HTMLElement} taskElement - The task element
 * @param {string} date - The date string
 */
function displayDueDate(taskElement, date) {
  let dueDateDisplay = taskElement.querySelector('.due-date-display');
  if (!dueDateDisplay) {
    dueDateDisplay = document.createElement('div');
    dueDateDisplay.classList.add('due-date-display');
    taskElement.appendChild(dueDateDisplay);
  }
  
  const dueDateObj = new Date(date);
  const formattedDate = formatDate(dueDateObj);
  
  dueDateDisplay.innerHTML = `<strong>Due Date:</strong> ${formattedDate}`;

  dueDateObj.setHours(0, 0, 0, 0);
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  if (dueDateObj < currentDate) {
    dueDateDisplay.classList.add('overdue');
  } else {
    dueDateDisplay.classList.remove('overdue');
  }

  taskElement.dataset.dueDate = date;
}

/**
 * Update all due dates to check for overdue tasks
 */
function updateAllDueDates() {
  const tasks = document.querySelectorAll('.todo-app ul li');
  
  tasks.forEach(task => {
    const dueDate = task.dataset.dueDate;
    if (!dueDate) return;
    
    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const dueDateDisplay = task.querySelector('.due-date-display');
    
    if (dueDateDisplay) {
      if (dueDateObj < currentDate) {
        dueDateDisplay.classList.add('overdue');
      } else {
        dueDateDisplay.classList.remove('overdue');
      }
    }
  });
}

// =========================================
//        DRAG & DROP FUNCTIONALITY
// =========================================

/**
 * Handle drag start event for lists
 * @param {DragEvent} e - The drag event
 */
function handleDragStart(e) {
  if (!isDraggingHandle) {
    e.preventDefault();
    return;
  }
  
  draggedList = this;
  this.classList.add('dragging');
  document.body.style.cursor = 'grabbing';
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');

  // Create a transparent drag image
  const transparentImg = new Image();
  transparentImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  e.dataTransfer.setDragImage(transparentImg, 0, 0);

  // Add or show the drop indicator
  const container = document.querySelector('.container');
  if (!container) return;
  
  let dropIndicator = container.querySelector('.drop-indicator');
  if (!dropIndicator) {
    dropIndicator = document.createElement('div');
    dropIndicator.classList.add('drop-indicator');
    container.appendChild(dropIndicator);
  }
  dropIndicator.style.display = 'block';
}

/**
 * Handle drag over event
 * @param {DragEvent} e - The drag event
 */
function handleDragOver(e) {
  const container = document.querySelector('.container');
  if (!container) return;
  
  const containerRect = container.getBoundingClientRect();
  const isOverContainer = container.contains(e.target);
  
  if (isOverContainer) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  // Handle auto-scrolling
  const scrollMargin = 50;
  const scrollSpeed = 20;

  if (e.clientX < containerRect.left + scrollMargin) {
    container.scrollLeft -= scrollSpeed;
  } else if (e.clientX > containerRect.right - scrollMargin) {
    container.scrollLeft += scrollSpeed;
  }

  // Update drop indicator
  const dropTarget = determineDropTarget(e.clientX);
  showDropIndicator(dropTarget);
}

/**
 * Handle drop event
 * @param {DragEvent} e - The drag event
 */
function handleDrop(e) {
  e.preventDefault();
  
  const container = document.querySelector('.container');
  if (!container || !draggedList) return;
  
  const dropTarget = determineDropTarget(e.clientX);

  if (dropTarget) {
    if (dropTarget.position === 'start' || dropTarget.position === 'before') {
      container.insertBefore(draggedList, dropTarget.target || container.firstChild);
    } else if (dropTarget.position === 'between') {
      container.insertBefore(draggedList, dropTarget.next);
    } else if (dropTarget.position === 'after') {
      container.appendChild(draggedList);
    }
    updateSidebarList();
    saveAllLists();
  }

  const dropIndicator = container.querySelector('.drop-indicator');
  if (dropIndicator) dropIndicator.style.display = 'none';
}

/**
 * Handle drag end event
 */
function handleDragEnd() {
  this.classList.remove('dragging');
  document.body.style.cursor = ''; 
  this.style.cursor = ''; 
  
  const dropIndicator = document.querySelector('.drop-indicator');
  if (dropIndicator) dropIndicator.style.display = 'none';
  
  draggedList = null;
  isDraggingHandle = false;
}

/**
 * Handle task drag start event
 * @param {DragEvent} e - The drag event
 */
function handleTaskDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
  this.classList.add('dragging');
  e.stopPropagation();
}

/**
 * Handle task drag over event
 * @param {DragEvent} e - The drag event
 * @returns {boolean} False to indicate event handled
 */
function handleTaskDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

/**
 * Handle task drop event
 * @param {DragEvent} e - The drag event
 * @returns {boolean} False to indicate event handled
 */
function handleTaskDrop(e) {
  e.stopPropagation();
  if (dragSrcEl !== this) {
    this.parentNode.insertBefore(dragSrcEl, this);
    saveAllLists();
  }
  return false;
}

/**
 * Handle task drag end event
 */
function handleTaskDragEnd() {
  this.classList.remove('dragging');
  saveAllLists();
}

/**
 * Add drag and drop handlers to a list item
 * @param {HTMLElement} li - The list item element
 */
function addDragAndDropHandlers(li) {
  li.setAttribute('draggable', 'true');
  li.addEventListener('dragstart', handleTaskDragStart, false);
  li.addEventListener('dragover', handleTaskDragOver, false);
  li.addEventListener('drop', handleTaskDrop, false);
  li.addEventListener('dragend', handleTaskDragEnd, false);
}

/**
 * Determine the drop target position based on mouse x coordinate
 * @param {number} x - The mouse x coordinate
 * @returns {Object|null} The drop target information or null
 */
function determineDropTarget(x) {
  const container = document.querySelector('.container');
  if (!container) return null;
  
  const lists = Array.from(container.querySelectorAll('.todo-app')).filter(list => list !== draggedList);
  const containerRect = container.getBoundingClientRect();
  const EDGE_THRESHOLD = 20;

  if (lists.length === 0) {
    return { position: 'start', target: null };
  }

  if (x < containerRect.left + EDGE_THRESHOLD) {
    return { position: 'before', target: lists[0] };
  }

  if (x > containerRect.right - EDGE_THRESHOLD) {
    return { position: 'after', target: lists[lists.length - 1] };
  }

  for (let i = 0; i < lists.length - 1; i++) {
    const currentList = lists[i];
    const nextList = lists[i + 1];
    const currentRect = currentList.getBoundingClientRect();
    const nextRect = nextList.getBoundingClientRect();
    const gapStart = currentRect.right;
    const gapEnd = nextRect.left;

    if (x > gapStart && x < gapEnd) {
      return { position: 'between', target: currentList, next: nextList };
    }
  }

  return null; 
}

/**
 * Show the drop indicator at the appropriate position
 * @param {Object|null} dropTarget - The drop target information
 */
function showDropIndicator(dropTarget) {
  const container = document.querySelector('.container');
  if (!container) return;
  
  const dropIndicator = container.querySelector('.drop-indicator') || document.createElement('div');
  
  if (!dropIndicator.classList.contains('drop-indicator')) {
    dropIndicator.classList.add('drop-indicator');
    container.appendChild(dropIndicator);
  }

  // Set height based on tallest list
  const todoApps = container.querySelectorAll('.todo-app');
  let maxHeight = 0;
  todoApps.forEach(app => {
    const height = app.offsetHeight;
    if (height > maxHeight) maxHeight = height;
  });
  dropIndicator.style.height = `${maxHeight}px`;

  if (!dropTarget) {
    dropIndicator.style.display = 'none';
    return;
  }

  const containerRect = container.getBoundingClientRect();

  // Position the indicator based on drop target
  if (dropTarget.position === 'start' || dropTarget.position === 'before') {
    dropIndicator.style.left = '10px';
    dropIndicator.style.display = 'block';
  } else if (dropTarget.position === 'between') {
    const currentRect = dropTarget.target.getBoundingClientRect();
    const nextRect = dropTarget.next.getBoundingClientRect();
    const gapCenter = currentRect.right + (nextRect.left - currentRect.right) / 2;
    dropIndicator.style.left = `${gapCenter - containerRect.left}px`;
    dropIndicator.style.display = 'block';
  } else if (dropTarget.position === 'after') {
    dropIndicator.style.left = `calc(100% - 12px)`;
    dropIndicator.style.display = 'block';
  }
}

/**
 * Create a drag handle element
 * @returns {HTMLElement} The drag handle element
 */
function createDragHandle() {
  const dragHandle = document.createElement('div');
  dragHandle.classList.add('drag-handle');
  
  const row1 = document.createElement('div');
  row1.classList.add('dot-row');
  
  const row2 = document.createElement('div');
  row2.classList.add('dot-row');

  // Add dots to rows
  for (let i = 0; i < 3; i++) {
    const dot1 = document.createElement('span');
    dot1.classList.add('dot');
    row1.appendChild(dot1);
    
    const dot2 = document.createElement('span');
    dot2.classList.add('dot');
    row2.appendChild(dot2);
  }
  
  dragHandle.appendChild(row1);
  dragHandle.appendChild(row2);
  
  return dragHandle;
}

// =========================================
//        LIST MANAGEMENT
// =========================================

/**
 * Create a new to-do list
 */
function createList() {
  const newTodoApp = document.createElement('div');
  newTodoApp.classList.add('todo-app');

  // Add drag handle
  const dragHandle = createDragHandle(); 
  dragHandle.addEventListener('mousedown', () => {
    isDraggingHandle = true;
  });
  newTodoApp.insertBefore(dragHandle, newTodoApp.firstChild);

  // Create header row
  const headerRow = createListHeaderRow();
  newTodoApp.appendChild(headerRow);

  // Create input row
  const rowDiv = createListInputRow(newTodoApp);
  newTodoApp.appendChild(rowDiv);

  // Create task list
  const newUl = document.createElement('ul');
  newTodoApp.appendChild(newUl);

  // Set up drag and drop
  newTodoApp.setAttribute('draggable', 'true');
  newTodoApp.addEventListener('dragstart', handleDragStart);
  newTodoApp.addEventListener('dragend', handleDragEnd); 

  // Add to container
  const container = document.querySelector('.container');
  if (container) {
    container.appendChild(newTodoApp);
  }

  updateContainerCloseButtons();
  saveAllLists();
}

/**
 * Create a header row for a list
 * @returns {HTMLElement} The header row element
 */
function createListHeaderRow() {
  const headerRow = document.createElement('div');
  headerRow.classList.add('header-row');

  const newTitle = document.createElement('h2');
  newTitle.contentEditable = 'true';
  newTitle.innerText = 'New List';
  newTitle.classList.add('header-title');

  newTitle.addEventListener('blur', function() {
    saveAllLists();
  });

  newTitle.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      newTitle.blur();
    }
  });

  const closeBtnWrapper = document.createElement('div');
  closeBtnWrapper.classList.add('close-container-wrapper');

  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '\u00D7';
  closeBtn.classList.add('close-container');
  closeBtn.addEventListener('click', function() {
    removeList(this);
  });

  const tooltip = document.createElement('span');
  tooltip.classList.add('tooltiptext');
  tooltip.textContent = 'Delete List';

  closeBtnWrapper.appendChild(closeBtn);
  closeBtnWrapper.appendChild(tooltip);
  headerRow.appendChild(newTitle);
  headerRow.appendChild(closeBtnWrapper);
  
  return headerRow;
}

/**
 * Create an input row for a list
 * @param {HTMLElement} parentList - The parent list element
 * @returns {HTMLElement} The input row element
 */
function createListInputRow(parentList) {
  const rowDiv = document.createElement('div');
  rowDiv.classList.add('row');

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.placeholder = 'Add a new task';

  const addButton = document.createElement('button');
  addButton.innerText = 'Add Task';

  rowDiv.appendChild(newInput);
  rowDiv.appendChild(addButton);

  // Get the list element
  const newUl = parentList.querySelector('ul') || 
                document.createElement('ul');
  
  if (!parentList.contains(newUl)) {
    parentList.appendChild(newUl);
  }

  // Set up event listeners
  addButton.addEventListener('click', () => {
    addTaskToList(newInput, newUl);
    saveAllLists();
  });

  newInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTaskToList(newInput, newUl);
      saveAllLists();
    }
  });

  newUl.addEventListener('click', (e) => {
    handleListClick(e, newUl);
    saveAllLists();
  });

  return rowDiv;
}

/**
 * Add a task to a specific list
 * @param {HTMLInputElement} inputElement - The input element
 * @param {HTMLElement} ulElement - The list element
 */
function addTaskToList(inputElement, ulElement) {
  if (!inputElement || !ulElement) return;
  
  if (inputElement.value === '') {
    alert('Please enter a task');
    return;
  }
  
  const li = document.createElement('li');
  li.innerHTML = inputElement.value;
  ulElement.appendChild(li);

  const span = document.createElement('span');
  span.innerHTML = '\u00d7';
  li.appendChild(span);

  li.setAttribute('draggable', 'true');
  addDragAndDropHandlers(li);
  
  inputElement.value = '';
  saveAllLists();
}

/**
 * Remove a list
 * @param {HTMLElement} closeButton - The close button element
 */
function removeList(closeButton) {
  const todoApp = closeButton.closest('.todo-app');
  if (todoApp) {
    currentListToDelete = todoApp;
    showConfirmationModal();
  }
}

/**
 * Show the confirmation modal
 */
function showConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  if (!modal) return;
  
  modal.style.display = 'block';
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

/**
 * Hide the confirmation modal
 */
function hideConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  if (!modal) return;
  
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
  currentListToDelete = null;
}

/**
 * Update close buttons for all containers
 */
function updateContainerCloseButtons() {
  const apps = document.querySelectorAll('.todo-app');
  
  if (apps.length === 1) {
    const onlyApp = apps[0];
    onlyApp.classList.add('single-list');
    const closeWrapper = onlyApp.querySelector('.close-container-wrapper');
    if (closeWrapper) {
      closeWrapper.style.display = 'none';
    }
  } else {
    apps.forEach(app => {
      app.classList.remove('single-list');
      const closeWrapper = app.querySelector('.close-container-wrapper');
      if (closeWrapper) {
        closeWrapper.style.display = '';
      }
    });
  }
}

// =========================================
//    LOCALSTORAGE DATA MANAGEMENT
// =========================================

/**
 * Save task data for the main list
 */
function saveData() {
  const listContainer = document.getElementById('list-container');
  if (listContainer) {
    localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.DATA, listContainer.innerHTML);
  }
}

/**
 * Load and display task data for the main list
 */
function showTaskData() {
  const listContainer = document.getElementById('list-container');
  if (!listContainer) return;
  
  const savedData = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.DATA);
  if (savedData) {
    listContainer.innerHTML = savedData;
    const listItems = listContainer.querySelectorAll('li');
    listItems.forEach(li => {
      addDragAndDropHandlers(li);
    });
  }
}

/**
 * Save all lists data
 */
function saveAllLists() {
  const container = document.querySelector('.container');
  if (!container) return;
  
  const todoApps = container.querySelectorAll('.todo-app');
  const lists = [];

  todoApps.forEach((app) => {
    const title = app.querySelector('h2')?.innerText || CONFIG.DEFAULT_LIST_TITLE;
    const tasks = app.querySelector('ul')?.innerHTML || '';
    lists.push({
      title: title,
      tasks: tasks
    });
  });

  localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.LISTS, JSON.stringify(lists));
  updateSidebarList();
}

/**
 * Load all saved lists
 */
function loadAllLists() {
  try {
    const savedLists = localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.LISTS);
    if (!savedLists) return;
    
    const lists = JSON.parse(savedLists);
    if (lists.length === 0) return;
    
    // Update the first (existing) list
    const firstList = document.querySelector('.todo-app');
    if (firstList && lists[0]) {
      const firstTitle = firstList.querySelector('h2');
      if (firstTitle) {
        firstTitle.innerText = lists[0].title;
      }
      
      const firstUl = firstList.querySelector('ul');
      if (firstUl && lists[0].tasks) {
        firstUl.innerHTML = lists[0].tasks;
        const listItems = firstUl.querySelectorAll('li');
        listItems.forEach(li => {
          addDragAndDropHandlers(li);
        });
      }
    }

    // Create additional lists
    for (let i = 1; i < lists.length; i++) {
      createListFromSaved(lists[i].title, lists[i].tasks);
    }
  } catch (error) {
    console.error('Failed to load lists:', error);
  }
}

/**
 * Create a list from saved data
 * @param {string} title - The list title
 * @param {string} tasks - The list tasks HTML
 */
function createListFromSaved(title, tasks) {
  const newTodoApp = document.createElement('div');
  newTodoApp.classList.add('todo-app');

  // Add drag handle
  const dragHandle = createDragHandle();
  dragHandle.addEventListener('mousedown', () => {
    isDraggingHandle = true;
  });
  newTodoApp.insertBefore(dragHandle, newTodoApp.firstChild);

  // Create header row
  const headerRow = document.createElement('div');
  headerRow.classList.add('header-row');

  const newTitle = document.createElement('h2');
  newTitle.contentEditable = 'true';
  newTitle.innerText = title;
  newTitle.classList.add('header-title');

  newTitle.addEventListener('blur', function() {
    saveAllLists(); 
  });

  newTitle.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.blur(); 
    }
  });

  const closeBtnWrapper = document.createElement('div');
  closeBtnWrapper.classList.add('close-container-wrapper');

  const closeBtn = document.createElement('span');
  closeBtn.innerHTML = '\u00D7'; 
  closeBtn.classList.add('close-container');
  closeBtn.addEventListener('click', function() {
    removeList(this); 
  });

  const tooltip = document.createElement('span');
  tooltip.classList.add('tooltiptext');
  tooltip.textContent = 'Delete List';

  closeBtnWrapper.appendChild(closeBtn);
  closeBtnWrapper.appendChild(tooltip);

  headerRow.appendChild(newTitle);
  headerRow.appendChild(closeBtnWrapper);
  newTodoApp.appendChild(headerRow);

  // Create input row
  const rowDiv = document.createElement('div');
  rowDiv.classList.add('row');

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.placeholder = 'Add a new task';

  const addButton = document.createElement('button');
  addButton.innerText = 'Add Task';

  rowDiv.appendChild(newInput);
  rowDiv.appendChild(addButton);

  // Create list with saved tasks
  const newUl = document.createElement('ul');
  newUl.innerHTML = tasks; 

  newTodoApp.appendChild(rowDiv);
  newTodoApp.appendChild(newUl);

  // Setup drag and drop
  newTodoApp.setAttribute('draggable', 'true');
  newTodoApp.addEventListener('dragstart', handleDragStart);
  newTodoApp.addEventListener('dragend', handleDragEnd);

  // Add to container
  const container = document.querySelector('.container');
  if (container) {
    container.appendChild(newTodoApp);
  }

  // Setup event listeners
  addButton.addEventListener('click', () => {
    addTaskToList(newInput, newUl);
    saveAllLists();
  });

  newInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTaskToList(newInput, newUl);
      saveAllLists();
    }
  });

  newUl.addEventListener('click', (e) => {
    handleListClick(e, newUl);
    saveAllLists();
  });

  // Setup drag and drop for list items
  const listItems = newUl.querySelectorAll('li');
  listItems.forEach(li => {
    addDragAndDropHandlers(li);
  });

  updateContainerCloseButtons();
}
