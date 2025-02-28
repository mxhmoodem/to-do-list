document.addEventListener('DOMContentLoaded', (event) => {
  const savedName = localStorage.getItem('userName');
  const userNameElement = document.getElementById('user-name');
  const savedTitle = localStorage.getItem('headerTitle');
  const headerTitleElement = document.getElementById('header-title');

  if (savedName && savedName !== '{insert your name}') {
    userNameElement.innerText = savedName;
    userNameElement.style.color = 'inherit';
    userNameElement.style.fontStyle = 'normal';
    userNameElement.style.fontWeight = 'normal';
  } else {
    userNameElement.innerText = '{insert your name}';
    userNameElement.style.color = 'gray';
    userNameElement.style.fontStyle = 'italic';
    userNameElement.style.fontWeight = 'normal';
  }

  userNameElement.addEventListener('focus', function() {
    if (userNameElement.innerText === '{insert your name}') {
      userNameElement.innerText = '';
      userNameElement.style.color = 'inherit';
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

  if (savedTitle) {
    headerTitleElement.innerText = savedTitle;
  }

  headerTitleElement.addEventListener('blur', function() {
    const title = this.innerText.trim();
    if (title !== '') {
      localStorage.setItem('headerTitle', title);
    } else {
      this.innerText = 'To-Do List';
      localStorage.setItem('headerTitle', 'To-Do List');
    }
  });

  headerTitleElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.blur();
    }
  });

  updateContainerCloseButtons();
  displayCurrentDate();
  showTaskData(); 
  loadAllLists();
  updateSidebarList();
});

// =========================================
//         SIDEBAR & NAME STORAGE
// =========================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.querySelector('.main-content');
  sidebar.classList.toggle('collapsed');
  mainContent.classList.toggle('sidebar-collapsed');
}

function saveName(element) {
  const name = element.innerText.trim();
  if (name === '' || name === '{insert your name}') {
    element.innerText = '{insert your name}';
    element.style.color = 'gray';
    element.style.fontStyle = 'italic';
  } else {
    element.style.color = 'inherit';
    element.style.fontStyle = 'normal';
  }
  localStorage.setItem('userName', element.innerText);
}

function displayCurrentDate() {
  const dateElement = document.getElementById('current-date');
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  dateElement.textContent = dateString;
}

function updateSidebarList() {
  const listOfListsDiv = document.getElementById('list-of-lists');
  listOfListsDiv.innerHTML = '';
  let lists = [];
  
  const savedLists = localStorage.getItem('todoLists');
  if (savedLists) {
    lists = JSON.parse(savedLists);
  }

  if (lists.length === 0) {
    const defaultTitle = document.querySelector('.todo-app h2').innerText;
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
//        ORIGINAL (SINGLE) TO-DO LIST
// =========================================
const inputBox = document.getElementById('input-box');
const listContainer = document.getElementById('list-container');

inputBox.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  if (inputBox.value === '') {
    alert("Please enter a task");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);

    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    li.setAttribute('draggable', 'true');
    addDragAndDropHandlers(li);
  }
  inputBox.value = '';      
  saveData();             
}

listContainer.addEventListener("click", function(e) {
  const li = e.target.closest('li');
  if (!li) return;

  const rect = li.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  if (clickX < 35) {
    li.classList.toggle("checked");
    saveAllLists();
    saveData();
    return;
  }

  if (e.target.tagName === "SPAN") {
    e.target.parentElement.remove();
    saveData();
    saveAllLists();
    return;
  }

  if (clickX >= 35 && e.target.tagName === "LI") {
    editTask(e.target);
  }
});

function editTask(li) {
  if (li.classList.contains("editing")) return;

  let storedDueDate = li.dataset.dueDate || null;
  let dueDateDisplay = li.querySelector('.due-date-display');
  if (dueDateDisplay) {
    dueDateDisplay.remove();
  }

  const currentText = li.firstChild ? li.firstChild.textContent.trim() : '';
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.classList.add("edit-input");
  li.classList.add("editing");

  const span = li.querySelector("span") || document.createElement("span");
  li.innerHTML = '';
  li.appendChild(input);
  li.appendChild(span);
  input.focus();

  if (storedDueDate) {
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
  } else {
    addAddDueDateButton(li);
  }

  input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      saveEdit();
    }
  });

  input.addEventListener("blur", function(e) {
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
    li.classList.remove("editing");

    const controls = li.querySelectorAll('.add-due-date-btn, .due-date-controls, .due-date-picker');
    controls.forEach(ctrl => ctrl.remove());

    if (li.dataset.dueDate) {
      displayDueDate(li, li.dataset.dueDate);
    }
    li.style.color = "inherit";

    li.setAttribute('draggable', 'true');
    addDragAndDropHandlers(li);
    saveData();
    saveAllLists();
  }
}

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
//               DRAG & DROP
// =========================================
let dragSrcEl = null;

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  this.classList.add('dragging');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  if (dragSrcEl !== this) {
    const list = this.parentNode;
    const nodes = Array.from(list.children);
    const dragIndex = nodes.indexOf(dragSrcEl);
    const dropIndex = nodes.indexOf(this);

    if (dragIndex < dropIndex) {
      list.insertBefore(dragSrcEl, this.nextSibling);
    } else {
      list.insertBefore(dragSrcEl, this);
    }
    if (list.id === 'list-container') {
      saveData();
    }
    saveAllLists();
  }
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
}

function addDragAndDropHandlers(li) {
  li.setAttribute('draggable', 'true');
  li.addEventListener('dragstart', handleDragStart, false);
  li.addEventListener('dragover', handleDragOver, false);
  li.addEventListener('drop', handleDrop, false);
  li.addEventListener('dragend', handleDragEnd, false);
}

// =========================================
//    LOCALSTORAGE FOR SINGLE-LIST DATA
// =========================================
function saveData(){
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTaskData() {
  listContainer.innerHTML = localStorage.getItem("data") || '';
  const listItems = listContainer.querySelectorAll('li');
  listItems.forEach(li => {
    addDragAndDropHandlers(li);
  });
}

// =========================================
//        CREATE A NEW (ADDITIONAL) LIST
// =========================================
function createList() {
  const newTodoApp = document.createElement('div');
  newTodoApp.classList.add('todo-app');

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
  closeBtn.innerHTML = "\u00D7";
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

  const rowDiv = document.createElement('div');
  rowDiv.classList.add('row');

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.placeholder = 'Add a new task';

  const addButton = document.createElement('button');
  addButton.innerText = 'Add Task';

  rowDiv.appendChild(newInput);
  rowDiv.appendChild(addButton);

  const newUl = document.createElement('ul');

  newTodoApp.appendChild(rowDiv);
  newTodoApp.appendChild(newUl);

  const container = document.querySelector('.container');
  container.appendChild(newTodoApp);

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

  updateContainerCloseButtons();
  saveAllLists();
}

function addTaskToList(inputElement, ulElement) {
  if (inputElement.value === '') {
    alert("Please enter a task");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputElement.value;
    ulElement.appendChild(li);

    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    li.setAttribute('draggable', 'true');
    addDragAndDropHandlers(li);
  }
  inputElement.value = '';
  saveAllLists();
}

function handleListClick(e, ulElement) {
  const li = e.target.closest('li');
  if (!li) return;

  const rect = li.getBoundingClientRect();
  const clickX = e.clientX - rect.left;

  if (clickX < 35) {
    li.classList.toggle("checked");
    saveAllLists();
    return;
  }

  if (e.target.tagName === "SPAN") {
    e.target.parentElement.remove();
    saveAllLists();
    return;
  }

  if (clickX >= 35 && e.target.tagName === "LI") {
    editTask(li);
  }
}

function updateContainerCloseButtons() {
  const apps = document.querySelectorAll('.todo-app');
  if (apps.length === 1) {
    const onlyApp = apps[0];
    const closeWrapper = onlyApp.querySelector('.close-container-wrapper');
    if (closeWrapper) {
      closeWrapper.style.display = 'none';
    }
  } else {
    apps.forEach(app => {
      const closeWrapper = app.querySelector('.close-container-wrapper');
      if (closeWrapper) {
        closeWrapper.style.display = 'inline-block';
      }
    });
  }
}

let currentListToDelete = null;

function removeList(closeButton) {
  const todoApp = closeButton.closest('.todo-app');
  if (todoApp) {
    currentListToDelete = todoApp;
    showConfirmationModal();
  }
}

function saveAllLists() {
  const container = document.querySelector('.container');
  const todoApps = container.querySelectorAll('.todo-app');
  const lists = [];

  todoApps.forEach((app, index) => {
    const title = app.querySelector('h2').innerText;
    const tasks = app.querySelector('ul').innerHTML;
    lists.push({
      title: title,
      tasks: tasks
    });
  });

  localStorage.setItem('todoLists', JSON.stringify(lists));
  updateSidebarList();
}

function loadAllLists() {
  const savedLists = localStorage.getItem('todoLists');
  if (savedLists) {
    const lists = JSON.parse(savedLists);
    
    if (lists.length > 0) {
      const firstList = document.querySelector('.todo-app');
      if (firstList) {
        firstList.querySelector('h2').innerText = lists[0].title;
        const firstUl = firstList.querySelector('ul');
        firstUl.innerHTML = lists[0].tasks;
        const listItems = firstUl.querySelectorAll('li');
        listItems.forEach(li => {
          addDragAndDropHandlers(li);
        });
      }
    }

    for (let i = 1; i < lists.length; i++) {
      createListFromSaved(lists[i].title, lists[i].tasks);
    }
  }
}

function createListFromSaved(title, tasks) {
  const newTodoApp = document.createElement('div');
  newTodoApp.classList.add('todo-app');

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
  closeBtn.innerHTML = "\u00D7";
  closeBtn.classList.add('close-container');
  closeBtn.addEventListener('click', function() {
    removeList(this);
    saveAllLists(); 
  });
  
  
  const tooltip = document.createElement('span');
  tooltip.classList.add('tooltiptext');
  tooltip.textContent = 'Delete List';
  
  closeBtnWrapper.appendChild(closeBtn);
  closeBtnWrapper.appendChild(tooltip);

  headerRow.appendChild(newTitle);
  headerRow.appendChild(closeBtnWrapper);

  newTodoApp.appendChild(headerRow);

  const rowDiv = document.createElement('div');
  rowDiv.classList.add('row');

  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.placeholder = 'Add a new task';

  const addButton = document.createElement('button');
  addButton.innerText = 'Add Task';

  rowDiv.appendChild(newInput);
  rowDiv.appendChild(addButton);

  const newUl = document.createElement('ul');
  newUl.innerHTML = tasks;

  newTodoApp.appendChild(rowDiv);
  newTodoApp.appendChild(newUl);

  const container = document.querySelector('.container');
  container.appendChild(newTodoApp);

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

  const listItems = newUl.querySelectorAll('li');
  listItems.forEach(li => {
    addDragAndDropHandlers(li);
  });

  updateContainerCloseButtons();
}

function showConfirmationModal() {
  const modal = document.getElementById("confirmation-modal");
  modal.style.display = "block";
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);
}

function hideConfirmationModal() {
  const modal = document.getElementById("confirmation-modal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
  currentListToDelete = null;
}

document.getElementById("confirm-btn").addEventListener("click", function() {
  if (currentListToDelete) {
    currentListToDelete.remove();
    updateContainerCloseButtons();
    saveAllLists();
  }
  hideConfirmationModal();
});

document.getElementById("cancel-btn").addEventListener("click", hideConfirmationModal);

window.addEventListener("click", function(event) {
  const modal = document.getElementById("confirmation-modal");
  if (event.target === modal) {
    hideConfirmationModal();
  }
});


// =========================================
//        FEEDBACK FORM & EMAILJS
// =========================================

(function() {
  emailjs.init("LvZWl0qGgsXQprqKp");
})();

var feedbackmodal = document.getElementById("feedbackModal");
var feedbackbtn = document.getElementById("feedbackBtn");
var feedbackspan = document.getElementsByClassName("close")[0];

feedbackbtn.onclick = function() {
  console.log("Feedback button clicked");
  feedbackmodal.style.display = "block";
  setTimeout(() => {
    feedbackmodal.classList.add("show");
  }, 10);
};

feedbackspan.onclick = function() {
  feedbackmodal.classList.remove("show");
  setTimeout(() => {
    feedbackmodal.style.display = "none";
  }, 300);
};

window.addEventListener("click", function(event) {
  if (event.target == feedbackmodal) {
    feedbackmodal.classList.remove("show");
    setTimeout(() => {
      feedbackmodal.style.display = "none";
    }, 300);
  }
});

document.getElementById("feedbackForm").addEventListener("submit", function(event) {
  event.preventDefault();

  var feedbackText = document.getElementById("feedbackText").value.trim();

  if (feedbackText === "") {
    alert("Please enter some feedback.");
    return;
  }

  var templateParams = {
    feedback: feedbackText
  };

  emailjs.send("service_fh0bnws", "template_3t4v4im", templateParams)
    .then(function(response) {
      console.log("SUCCESS!", response.status, response.text);
      alert("Feedback sent successfully!");
      feedbackmodal.style.display = "none";
      document.getElementById("feedbackText").value = "";
    }, function(error) {
      console.log("FAILED...", error);
      alert("Failed to send feedback. Please try again later.");
    });
});

if (!taskElement.querySelector('.add-due-date-btn')) {
  const addDueDateBtn = document.createElement('button');
  addDueDateBtn.textContent = 'Add Due Date';
  addDueDateBtn.classList.add('add-due-date-btn');
  addDueDateBtn.addEventListener('click', () => {
    showDatePicker(taskElement);
  });
  taskElement.appendChild(addDueDateBtn);
}

// =========================================
//        DUE DATE FUNCTIONALITY
// =========================================

function formatDate(dateObj) {
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

function getOrdinal(day) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

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

  dueDateObj.setHours(0,0,0,0);
  let currentDate = new Date();
  currentDate.setHours(0,0,0,0);
  if (dueDateObj < currentDate) {
    dueDateDisplay.style.color = 'red';
  } else {
    dueDateDisplay.style.color = '';
  }

  taskElement.dataset.dueDate = date;
}
