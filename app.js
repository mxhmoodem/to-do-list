let draggedList = null;
let isFreelayout = false;
let isDragging = false;
let startX = 0;
let startY = 0;
let originalX = 0;
let originalY = 0;
let currentAppPositions = {};
let isDraggingHandle = false;
let canvasWidth = 0;
let canvasHeight = 0;
let canvasPadding = 13;

document.addEventListener("DOMContentLoaded", (event) => {
  const savedName = localStorage.getItem("userName");
  const userNameElement = document.getElementById("user-name");
  const savedTitle = localStorage.getItem("headerTitle");
  const headerTitleElement = document.getElementById("header-title");

  if (savedName && savedName !== "{insert your name}") {
    userNameElement.innerText = savedName;
    userNameElement.style.color = "inherit";
    userNameElement.style.fontStyle = "normal";
  } else {
    userNameElement.innerText = "{insert your name}";
    userNameElement.style.color = "#888";
    userNameElement.style.fontStyle = "italic";
  }

  userNameElement.addEventListener("focus", function () {
    if (userNameElement.innerText === "{insert your name}") {
      userNameElement.innerText = "";
      userNameElement.style.color = "inherit";
      userNameElement.style.fontStyle = "normal";
      userNameElement.style.fontWeight = "normal";
    }
  });

  userNameElement.addEventListener("blur", function () {
    saveName(userNameElement);
  });

  userNameElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      userNameElement.blur();
    }
  });

  if (savedTitle) {
    headerTitleElement.innerText = savedTitle;
  }

  headerTitleElement.addEventListener("blur", function () {
    const title = this.innerText.trim();
    if (title !== "") {
      localStorage.setItem("headerTitle", title);
    } else {
      this.innerText = "To-Do List";
      localStorage.setItem("headerTitle", "To-Do List");
    }
  });

  headerTitleElement.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.blur();
    }
  });

  document.addEventListener("mouseup", () => {
    isDraggingHandle = false;
  });

  updateContainerCloseButtons();
  displayCurrentDate();
  showTaskData();
  loadAllLists();
  updateSidebarList();
  updateAllDueDates();
  attachNameClickHandler(userNameElement);

  const initialTodoApp = document.querySelector(".todo-app");
  const initialHeaderRow = initialTodoApp.querySelector(".header-row");
  const initialTitle = initialHeaderRow.querySelector("h2");
  const dragHandle = createDragHandle();
  dragHandle.addEventListener("mousedown", () => {
    isDraggingHandle = true;
  });
  initialTodoApp.insertBefore(dragHandle, initialTodoApp.firstChild);
  initialTodoApp.setAttribute("draggable", "true");
  initialTodoApp.addEventListener("dragstart", handleDragStart);
  initialTodoApp.addEventListener("dragend", handleDragEnd);
  const container = document.querySelector(".container");
  document.addEventListener("dragover", handleDragOver);
  container.addEventListener("drop", handleDrop);
  setInterval(updateAllDueDates, 60000);
  setInterval(displayCurrentDate, 60000);

  const savedView = localStorage.getItem("isCanvasView") === "true";
  isCanvasView = savedView;
  isFreelayout = savedView;
  const listBtn = document.querySelector('.view-btn[data-view="list"]');
  const canvasBtn = document.querySelector('.view-btn[data-view="canvas"]');
  listBtn.classList.toggle("active", !savedView);
  canvasBtn.classList.toggle("active", savedView);
  if (isCanvasView) {
    document.querySelector(".container").classList.remove("row-layout");
    document.querySelector(".container").classList.add("free-layout");
    document.querySelector(".main-content").classList.add("free-layout-active");
    loadFreeLayoutPositions();
  } else {
    document.querySelector(".container").classList.remove("free-layout");
    document.querySelector(".container").classList.add("row-layout");
    document
      .querySelector(".main-content")
      .classList.remove("free-layout-active");
    resetToRowLayout();
  }
});

// ==========================================
//         SIDEBAR & NAME STORAGE
// ==========================================
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector(".main-content");
  sidebar.classList.toggle("collapsed");
  mainContent.classList.toggle("sidebar-collapsed");
}

function saveName(input) {
  const name = input.value.trim();
  const newSpan = document.createElement("span");
  newSpan.id = "user-name";

  if (name === "") {
    newSpan.innerText = "{insert your name}";
    newSpan.style.color = "#888";
    newSpan.style.fontStyle = "italic";
  } else {
    newSpan.innerText = name;
    newSpan.style.color = "inherit";
    newSpan.style.fontStyle = "normal";
  }

  input.parentNode.replaceChild(newSpan, input);
  localStorage.setItem("userName", name);

  attachNameClickHandler(newSpan);
}

function attachNameClickHandler(span) {
  span.addEventListener("click", function () {
    const currentName = span.innerText;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentName === "{insert your name}" ? "" : currentName;
    input.classList.add("name-input");

    span.parentNode.replaceChild(input, span);
    input.focus();

    input.addEventListener("blur", function () {
      saveName(input);
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        input.blur();
      }
    });
  });
}

function displayCurrentDate() {
  const dateElement = document.getElementById("current-date");
  const today = new Date();
  const dateString = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  dateElement.textContent = dateString;
}

function updateSidebarList() {
  const listOfListsDiv = document.getElementById("list-of-lists");
  listOfListsDiv.innerHTML = "";
  let lists = [];

  const savedLists = localStorage.getItem("todoLists");
  if (savedLists) {
    lists = JSON.parse(savedLists);
  }

  if (lists.length === 0) {
    const defaultTitle = document.querySelector(".todo-app h2").innerText;
    lists.push({ title: defaultTitle });
  }

  lists.forEach((list) => {
    const listItem = document.createElement("div");
    listItem.textContent = list.title;
    listItem.classList.add("sidebar-list-item");
    listOfListsDiv.appendChild(listItem);
  });
}

// =========================================
//        ORIGINAL (SINGLE) TO-DO LIST
// =========================================
const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

inputBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  if (inputBox.value === "") {
    alert("Please enter a task");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputBox.value;
    listContainer.appendChild(li);

    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    li.setAttribute("draggable", "true");
    addDragAndDropHandlers(li);
  }
  inputBox.value = "";
  saveData();
}

listContainer.addEventListener("click", function (e) {
  const li = e.target.closest("li");
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

  li.setAttribute("draggable", "false");

  let storedDueDate = li.dataset.dueDate || null;
  let dueDateDisplay = li.querySelector(".due-date-display");
  if (dueDateDisplay) {
    dueDateDisplay.remove();
  }

  const currentText = li.firstChild ? li.firstChild.textContent.trim() : "";
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.classList.add("edit-input");
  li.classList.add("editing");

  const span = li.querySelector("span") || document.createElement("span");
  li.innerHTML = "";
  li.appendChild(input);
  li.appendChild(span);
  input.focus();

  if (storedDueDate) {
    let controlsContainer = document.createElement("div");
    controlsContainer.classList.add("due-date-controls");

    let changeDueDateBtn = document.createElement("button");
    changeDueDateBtn.textContent = "Change Due Date";
    changeDueDateBtn.classList.add("add-due-date-btn");
    changeDueDateBtn.addEventListener("mousedown", (e) => e.preventDefault());
    changeDueDateBtn.addEventListener("click", () => {
      if (!li.querySelector(".due-date-picker")) {
        showDatePicker(li);
      }
    });
    controlsContainer.appendChild(changeDueDateBtn);

    let deleteDueDateBtn = document.createElement("button");
    deleteDueDateBtn.textContent = "Delete Due Date";
    deleteDueDateBtn.classList.add("add-due-date-btn");
    deleteDueDateBtn.addEventListener("mousedown", (e) => e.preventDefault());
    deleteDueDateBtn.addEventListener("click", () => {
      let ddDisplay = li.querySelector(".due-date-display");
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

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      saveEdit();
    }
  });

  input.addEventListener("blur", function (e) {
    if (
      e.relatedTarget &&
      (e.relatedTarget.classList.contains("add-due-date-btn") ||
        e.relatedTarget.classList.contains("due-date-picker"))
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

    const controls = li.querySelectorAll(
      ".add-due-date-btn, .due-date-controls, .due-date-picker"
    );
    controls.forEach((ctrl) => ctrl.remove());

    if (li.dataset.dueDate) {
      displayDueDate(li, li.dataset.dueDate);
    }
    li.style.color = "inherit";

    li.setAttribute("draggable", "true");
    addDragAndDropHandlers(li);
    saveData();
    saveAllLists();
  }
}

function addAddDueDateButton(li) {
  let addDueDateBtn = document.createElement("button");
  addDueDateBtn.textContent = "Add Due Date";
  addDueDateBtn.classList.add("add-due-date-btn");
  addDueDateBtn.addEventListener("mousedown", (e) => e.preventDefault());
  addDueDateBtn.addEventListener("click", () => {
    if (!li.querySelector(".due-date-picker")) {
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
  if (isFreelayout) {
    e.preventDefault();
    return;
  }

  if (!isDraggingHandle) {
    e.preventDefault();
    return;
  }

  draggedList = this;
  this.classList.add("dragging");
  document.body.style.cursor = "grabbing";
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", "");

  const transparentImg = new Image();
  transparentImg.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  e.dataTransfer.setDragImage(transparentImg, 0, 0);

  const container = document.querySelector(".container");
  if (!container.classList.contains("free-layout")) {
    let dropIndicator = container.querySelector(".drop-indicator");
    if (!dropIndicator) {
      dropIndicator = document.createElement("div");
      dropIndicator.classList.add("drop-indicator");
      container.appendChild(dropIndicator);
    }
    dropIndicator.style.display = "block";
  }
}

function handleDragOver(e) {
  const container = document.querySelector(".container");
  const containerRect = container.getBoundingClientRect();

  const isOverContainer = container.contains(e.target);
  if (isOverContainer) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  const scrollMargin = 50;
  const scrollSpeed = 20;

  const relativeX = e.clientX - containerRect.left;

  if (relativeX < scrollMargin && container.scrollLeft > 0) {
    container.scrollLeft -= scrollSpeed;
  } else if (
    relativeX > containerRect.width - scrollMargin &&
    container.scrollLeft < container.scrollWidth - container.clientWidth
  ) {
    container.scrollLeft += scrollSpeed;
  }

  const dropTarget = determineDropTarget(e.clientX, container.scrollLeft);
  showDropIndicator(dropTarget);
}

function handleDrop(e) {
  e.preventDefault();
  const container = document.querySelector(".container");
  const dropTarget = determineDropTarget(e.clientX);

  if (dropTarget) {
    if (dropTarget.position === "start" || dropTarget.position === "before") {
      container.insertBefore(
        draggedList,
        dropTarget.target || container.firstChild
      );
    } else if (dropTarget.position === "between") {
      container.insertBefore(draggedList, dropTarget.next);
    } else if (dropTarget.position === "after") {
      container.appendChild(draggedList);
    }
    updateSidebarList();
    saveAllLists();
  }

  const dropIndicator = container.querySelector(".drop-indicator");
  if (dropIndicator) dropIndicator.style.display = "none";
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  document.body.style.cursor = "";
  this.style.cursor = "";

  const dropIndicator = document.querySelector(".drop-indicator");
  if (dropIndicator) dropIndicator.style.display = "none";

  draggedList = null;
  isDraggingHandle = false;

  if (document.querySelector(".container").classList.contains("canvas-view")) {
    updateCanvasScrollArea();
  }
}

function handleTaskDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/html", this.outerHTML);
  this.classList.add("dragging");
  e.stopPropagation();
}

function handleTaskDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleTaskDrop(e) {
  e.stopPropagation();
  if (dragSrcEl !== this) {
    this.parentNode.insertBefore(dragSrcEl, this);
    saveAllLists();
  }
  return false;
}

function handleTaskDragEnd(e) {
  this.classList.remove("dragging");
  saveAllLists();
}

function addDragAndDropHandlers(li) {
  li.setAttribute("draggable", "true");
  li.addEventListener("dragstart", handleTaskDragStart, false);
  li.addEventListener("dragover", handleTaskDragOver, false);
  li.addEventListener("drop", handleTaskDrop, false);
  li.addEventListener("dragend", handleTaskDragEnd, false);
}

// =========================================
//    LOCALSTORAGE FOR SINGLE-LIST DATA
// =========================================
function saveData() {
  localStorage.setItem("data", listContainer.innerHTML);
}

function showTaskData() {
  listContainer.innerHTML = localStorage.getItem("data") || "";
  const listItems = listContainer.querySelectorAll("li");
  listItems.forEach((li) => {
    addDragAndDropHandlers(li);
  });
}

// =========================================
//        CREATE A NEW (ADDITIONAL) LIST
// =========================================

function createList() {
  const newTodoApp = document.createElement("div");
  newTodoApp.classList.add("todo-app");

  const headerRow = document.createElement("div");
  headerRow.classList.add("header-row");

  const dragHandle = createDragHandle();
  dragHandle.addEventListener("mousedown", () => {
    isDraggingHandle = true;
  });
  newTodoApp.insertBefore(dragHandle, newTodoApp.firstChild);

  const newTitle = document.createElement("h2");
  newTitle.contentEditable = "true";
  newTitle.innerText = "New List";
  newTitle.classList.add("header-title");

  newTitle.addEventListener("blur", function () {
    saveAllLists();
  });

  newTitle.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      newTitle.blur();
    }
  });

  const closeBtnWrapper = document.createElement("div");
  closeBtnWrapper.classList.add("close-container-wrapper");

  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "\u00D7";
  closeBtn.classList.add("close-container");
  closeBtn.addEventListener("click", function () {
    removeList(this);
  });

  const tooltip = document.createElement("span");
  tooltip.classList.add("tooltiptext");
  tooltip.textContent = "Delete List";

  closeBtnWrapper.appendChild(closeBtn);
  closeBtnWrapper.appendChild(tooltip);

  headerRow.appendChild(newTitle);
  headerRow.appendChild(closeBtnWrapper);
  newTodoApp.appendChild(headerRow);

  const rowDiv = document.createElement("div");
  rowDiv.classList.add("row");

  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.placeholder = "Add a new task";

  const addButton = document.createElement("button");
  addButton.innerText = "Add Task";

  rowDiv.appendChild(newInput);
  rowDiv.appendChild(addButton);

  const newUl = document.createElement("ul");

  newTodoApp.appendChild(rowDiv);
  newTodoApp.appendChild(newUl);

  newTodoApp.setAttribute("draggable", "true");
  newTodoApp.addEventListener("dragstart", handleDragStart);
  newTodoApp.addEventListener("dragend", handleDragEnd);

  const container = document.querySelector(".container");
  container.appendChild(newTodoApp);

  addButton.addEventListener("click", () => {
    addTaskToList(newInput, newUl);
    saveAllLists();
  });

  newInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTaskToList(newInput, newUl);
      saveAllLists();
    }
  });

  newUl.addEventListener("click", (e) => {
    handleListClick(e, newUl);
    saveAllLists();
  });

  updateContainerCloseButtons();
  saveAllLists();

  if (isFreelayout) {
    const todoApps = document.querySelectorAll(".todo-app");
    const newApp = todoApps[todoApps.length - 1];

    const newIndex = todoApps.length - 1;
    const row = Math.floor(newIndex / 3);
    const col = newIndex % 3;
    newApp.style.left = col * 420 + 20 + "px";
    newApp.style.top = row * 400 + 20 + "px";

    updateDragEvents(newApp);

    saveListPosition(newApp);
  }

  if (window.innerWidth <= 768) {
    setTimeout(() => {
      const todoApps = container.querySelectorAll(".todo-app");
      scrollToList(todoApps.length - 1);
    }, 100);
  }
}

function createListInFreeLayout(todoApp) {
  const container = document.querySelector(".container");
  const canvasContent = container.querySelector(".canvas-content");

  const lists = container.querySelectorAll(".todo-app");
  const index = Array.from(lists).indexOf(todoApp);

  const row = Math.floor(index / 3);
  const col = index % 3;
  todoApp.style.left = col * 420 + canvasPadding + "px";
  todoApp.style.top = row * 400 + canvasPadding + "px";

  todoApp.removeEventListener("dragstart", handleDragStart);
  todoApp.removeEventListener("dragend", handleDragEnd);
  todoApp.addEventListener("mousedown", handleFreeLayoutMouseDown);
  todoApp.addEventListener("touchstart", handleFreeLayoutTouchStart, {
    passive: true,
  });

  const contentSize = getRequiredContentSize();
  canvasContent.style.width = contentSize.width + "px";
  canvasContent.style.height = contentSize.height + "px";
}

const originalCreateList = window.createList;
window.createList = function () {
  const result = originalCreateList();

  if (isFreelayout) {
    const container = document.querySelector(".container");
    const canvasContent = container.querySelector(".canvas-content");
    const newList = container.querySelector(".todo-app:last-child");

    if (canvasContent && newList) {
      canvasContent.appendChild(newList);
      createListInFreeLayout(newList);
    }
  }

  return result;
};

function addTaskToList(inputElement, ulElement) {
  if (inputElement.value === "") {
    alert("Please enter a task");
  } else {
    let li = document.createElement("li");
    li.innerHTML = inputElement.value;
    ulElement.appendChild(li);

    let span = document.createElement("span");
    span.innerHTML = "\u00d7";
    li.appendChild(span);

    li.setAttribute("draggable", "true");
    addDragAndDropHandlers(li);
  }
  inputElement.value = "";
  saveAllLists();
}

function handleListClick(e, ulElement) {
  const li = e.target.closest("li");
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
  const apps = document.querySelectorAll(".todo-app");

  if (apps.length === 1) {
    const onlyApp = apps[0];
    onlyApp.classList.add("single-list");
    const closeWrapper = onlyApp.querySelector(".close-container-wrapper");
    if (closeWrapper) {
      closeWrapper.style.display = "none";
    }
  } else {
    apps.forEach((app) => {
      app.classList.remove("single-list");
      const closeWrapper = app.querySelector(".close-container-wrapper");
      if (closeWrapper) {
        closeWrapper.style.display = "";
      }
    });
  }
}

let currentListToDelete = null;

function removeList(closeButton) {
  const todoApp = closeButton.closest(".todo-app");
  if (todoApp) {
    currentListToDelete = todoApp;
    showConfirmationModal();
  }
}

function saveAllLists() {
  const container = document.querySelector(".container");
  const todoApps = container.querySelectorAll(".todo-app");
  const lists = [];

  todoApps.forEach((app, index) => {
    const title = app.querySelector("h2").innerText;
    const tasks = app.querySelector("ul").innerHTML;
    lists.push({
      title: title,
      tasks: tasks,
    });
  });

  localStorage.setItem("todoLists", JSON.stringify(lists));
  updateSidebarList();
}

function loadAllLists() {
  const savedLists = localStorage.getItem("todoLists");
  if (savedLists) {
    const lists = JSON.parse(savedLists);

    if (lists.length > 0) {
      const firstList = document.querySelector(".todo-app");
      if (firstList) {
        firstList.querySelector("h2").innerText = lists[0].title;
        const firstUl = firstList.querySelector("ul");
        firstUl.innerHTML = lists[0].tasks;
        const listItems = firstUl.querySelectorAll("li");
        listItems.forEach((li) => {
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
  const newTodoApp = document.createElement("div");
  newTodoApp.classList.add("todo-app");

  const dragHandle = createDragHandle();
  dragHandle.addEventListener("mousedown", () => {
    isDraggingHandle = true;
  });
  newTodoApp.insertBefore(dragHandle, newTodoApp.firstChild);

  const headerRow = document.createElement("div");
  headerRow.classList.add("header-row");

  const newTitle = document.createElement("h2");
  newTitle.contentEditable = "true";
  newTitle.innerText = title;
  newTitle.classList.add("header-title");

  newTitle.addEventListener("blur", function () {
    saveAllLists();
  });

  newTitle.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.blur();
    }
  });

  const closeBtnWrapper = document.createElement("div");
  closeBtnWrapper.classList.add("close-container-wrapper");

  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "\u00D7";
  closeBtn.classList.add("close-container");
  closeBtn.addEventListener("click", function () {
    removeList(this);
    saveAllLists();
  });

  const tooltip = document.createElement("span");
  tooltip.classList.add("tooltiptext");
  tooltip.textContent = "Delete List";

  closeBtnWrapper.appendChild(closeBtn);
  closeBtnWrapper.appendChild(tooltip);

  headerRow.appendChild(newTitle);
  headerRow.appendChild(closeBtnWrapper);
  newTodoApp.appendChild(headerRow);

  const rowDiv = document.createElement("div");
  rowDiv.classList.add("row");

  const newInput = document.createElement("input");
  newInput.type = "text";
  newInput.placeholder = "Add a new task";

  const addButton = document.createElement("button");
  addButton.innerText = "Add Task";

  rowDiv.appendChild(newInput);
  rowDiv.appendChild(addButton);

  const newUl = document.createElement("ul");
  newUl.innerHTML = tasks;

  newTodoApp.appendChild(rowDiv);
  newTodoApp.appendChild(newUl);

  newTodoApp.setAttribute("draggable", "true");
  newTodoApp.addEventListener("dragstart", handleDragStart);
  newTodoApp.addEventListener("dragend", handleDragEnd);

  const container = document.querySelector(".container");
  container.appendChild(newTodoApp);

  addButton.addEventListener("click", () => {
    addTaskToList(newInput, newUl);
    saveAllLists();
  });

  newInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addTaskToList(newInput, newUl);
      saveAllLists();
    }
  });

  newUl.addEventListener("click", (e) => {
    handleListClick(e, newUl);
    saveAllLists();
  });

  const listItems = newUl.querySelectorAll("li");
  listItems.forEach((li) => {
    addDragAndDropHandlers(li);
  });

  updateContainerCloseButtons();

  if (isFreelayout) {
    updateDragEvents(newTodoApp);
  }
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

document.getElementById("confirm-btn").addEventListener("click", function () {
  if (currentListToDelete) {
    if (isFreelayout) {
      const listId = currentListToDelete
        .querySelector("h2")
        .innerText.replace(/\s+/g, "-")
        .toLowerCase();
      if (currentAppPositions[listId]) {
        delete currentAppPositions[listId];
        localStorage.setItem(
          "freeLayoutPositions",
          JSON.stringify(currentAppPositions)
        );
      }
    }

    currentListToDelete.remove();
    updateContainerCloseButtons();
    saveAllLists();
  }
  hideConfirmationModal();
});

document
  .getElementById("cancel-btn")
  .addEventListener("click", hideConfirmationModal);

window.addEventListener("click", function (event) {
  const modal = document.getElementById("confirmation-modal");
  if (event.target === modal) {
    hideConfirmationModal();
  }
});

// =========================================
//        FEEDBACK FORM & EMAILJS
// =========================================

(function () {
  emailjs.init("LvZWl0qGgsXQprqKp");
})();

var feedbackmodal = document.getElementById("feedbackModal");
var feedbackbtn = document.getElementById("feedbackBtn");
var feedbackspan = document.getElementsByClassName("close")[0];
var charCounter = document.getElementById("charCount");
var feedbackText = document.getElementById("feedbackText");
var successMessage = document.getElementById("successMessage");
var errorMessage = document.getElementById("errorMessage");

feedbackText.addEventListener("input", function () {
  const count = this.value.length;
  charCounter.textContent = count;

  if (count > 400) {
    charCounter.style.color = "#ff9900";
  } else if (count > 450) {
    charCounter.style.color = "#ff0000";
  } else {
    charCounter.style.color = "";
  }
});

feedbackbtn.onclick = function () {
  feedbackmodal.style.display = "block";
  setTimeout(() => {
    feedbackmodal.classList.add("show");
  }, 10);

  document.getElementById("feedbackForm").reset();
  charCounter.textContent = "0";
  charCounter.style.color = "";
  successMessage.style.display = "none";
  errorMessage.style.display = "none";
  feedbackText.focus();
};

feedbackspan.onclick = function () {
  closeFeedbackModal();
};

function closeFeedbackModal() {
  feedbackmodal.classList.remove("show");
  setTimeout(() => {
    feedbackmodal.style.display = "none";
  }, 300);
}

window.addEventListener("click", function (event) {
  if (event.target == feedbackmodal) {
    closeFeedbackModal();
  }
});

document
  .getElementById("feedbackForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    var feedbackText = document.getElementById("feedbackText").value.trim();
    var feedbackType = document.querySelector(
      'input[name="feedbackType"]:checked'
    ).value;
    var submitButton = this.querySelector('button[type="submit"]');

    successMessage.style.display = "none";
    errorMessage.style.display = "none";

    if (feedbackText === "") {
      errorMessage.textContent = "Please enter some feedback.";
      errorMessage.style.display = "block";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    submitButton.classList.add("sending");

    var templateParams = {
      feedback: feedbackText,
      feedbackType: feedbackType,
    };

    emailjs.send("service_fh0bnws", "template_3t4v4im", templateParams).then(
      function (response) {
        console.log("SUCCESS!", response.status, response.text);

        successMessage.style.display = "block";

        document.getElementById("feedbackText").value = "";
        charCounter.textContent = "0";

        submitButton.disabled = false;
        submitButton.textContent = "Submit Feedback";
        submitButton.classList.remove("sending");

        setTimeout(() => {
          closeFeedbackModal();
        }, 2000);
      },
      function (error) {
        console.log("FAILED...", error);

        errorMessage.textContent =
          "Failed to send feedback. Please try again later.";
        errorMessage.style.display = "block";

        submitButton.disabled = false;
        submitButton.textContent = "Submit Feedback";
        submitButton.classList.remove("sending");
      }
    );
  });

// =========================================
//        DUE DATE FUNCTIONALITY
// =========================================

function showDatePicker(taskElement) {
  if (taskElement.querySelector(".due-date-picker")) return;
  const dateInput = document.createElement("input");
  dateInput.classList.add("due-date-picker");
  taskElement.appendChild(dateInput);

  const fp = flatpickr(dateInput, {
    onChange: function (selectedDates, dateStr) {
      displayDueDate(taskElement, dateStr);
      const btns = taskElement.querySelectorAll(
        ".add-due-date-btn, .change-due-date-btn, .delete-due-date-btn"
      );
      btns.forEach((btn) => (btn.style.display = "none"));
      dateInput.remove();
    },
  });
  fp.open();
}

function formatDate(dateObj) {
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString("en-US", { month: "short" });
  const year = dateObj.getFullYear();
  return `${day}${getOrdinal(day)} ${month} ${year}`;
}

function getOrdinal(day) {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function displayDueDate(taskElement, date) {
  let dueDateDisplay = taskElement.querySelector(".due-date-display");
  if (!dueDateDisplay) {
    dueDateDisplay = document.createElement("div");
    dueDateDisplay.classList.add("due-date-display");
    taskElement.appendChild(dueDateDisplay);
  }

  const dueDateObj = new Date(date);
  const formattedDate = formatDate(dueDateObj);

  dueDateDisplay.innerHTML = `<strong>Due Date:</strong> ${formattedDate}`;

  dueDateObj.setHours(0, 0, 0, 0);
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  if (dueDateObj < currentDate) {
    dueDateDisplay.classList.add("overdue");
  } else {
    dueDateDisplay.classList.remove("overdue");
  }

  taskElement.dataset.dueDate = date;
}

function updateAllDueDates() {
  const tasks = document.querySelectorAll(".todo-app ul li");
  tasks.forEach((task) => {
    const dueDate = task.dataset.dueDate;
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      dueDateObj.setHours(0, 0, 0, 0);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const dueDateDisplay = task.querySelector(".due-date-display");
      if (dueDateDisplay) {
        if (dueDateObj < currentDate) {
          dueDateDisplay.classList.add("overdue");
        } else {
          dueDateDisplay.classList.remove("overdue");
        }
      }
    }
  });
}

// =========================================
//        DRAG AND DROP LISTS
// ========================================

function determineDropTarget(clientX, scrollLeft) {
  const container = document.querySelector(".container");
  const lists = Array.from(container.querySelectorAll(".todo-app")).filter(
    (list) => list !== draggedList
  );

  if (lists.length === 0) {
    return { position: "start", target: null };
  }

  const adjustedX = clientX + scrollLeft;
  const containerRect = container.getBoundingClientRect();
  const containerLeft = containerRect.left;

  if (clientX < containerLeft + 20) {
    return { position: "before", target: lists[0] };
  }

  const containerRight = containerRect.right;
  if (clientX > containerRight - 20) {
    return { position: "after", target: lists[lists.length - 1] };
  }

  for (let i = 0; i < lists.length - 1; i++) {
    const currentList = lists[i];
    const nextList = lists[i + 1];
    const currentRect = currentList.getBoundingClientRect();
    const nextRect = nextList.getBoundingClientRect();
    const gapStart = currentRect.right;
    const gapEnd = nextRect.left;

    if (clientX > gapStart && clientX < gapEnd) {
      return { position: "between", target: currentList, next: nextList };
    }
  }

  return null;
}

function showDropIndicator(dropTarget) {
  const container = document.querySelector(".container");
  const dropIndicator =
    container.querySelector(".drop-indicator") || document.createElement("div");

  if (!dropIndicator.classList.contains("drop-indicator")) {
    dropIndicator.classList.add("drop-indicator");
    container.appendChild(dropIndicator);
  }

  dropIndicator.style.height = `${container.clientHeight}px`;

  if (!dropTarget) {
    dropIndicator.style.display = "none";
    return;
  }

  const containerRect = container.getBoundingClientRect();

  if (dropTarget.position === "start" || dropTarget.position === "before") {
    dropIndicator.style.left = `${10 - container.scrollLeft}px`;
    dropIndicator.style.display = "block";
  } else if (dropTarget.position === "between") {
    const currentRect = dropTarget.target.getBoundingClientRect();
    const nextRect = dropTarget.next.getBoundingClientRect();
    const gapCenter = (currentRect.right + nextRect.left) / 2;
    dropIndicator.style.left = `${gapCenter - containerRect.left}px`;
    dropIndicator.style.display = "block";
  } else if (dropTarget.position === "after") {
    dropIndicator.style.left = `calc(100% - 12px)`;
    dropIndicator.style.display = "block";
  }
}
function createDragHandle() {
  const dragHandle = document.createElement("div");
  dragHandle.classList.add("drag-handle");
  const row1 = document.createElement("div");
  row1.classList.add("dot-row");
  const row2 = document.createElement("div");
  row2.classList.add("dot-row");

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    row1.appendChild(dot);
  }

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    row2.appendChild(dot);
  }

  dragHandle.appendChild(row1);
  dragHandle.appendChild(row2);
  return dragHandle;
}

// ==========================================
//         LAYOUT TOGGLE FUNCTIONALITY
// ==========================================

function switchToListView() {
  const container = document.querySelector(".container");
  const mainContent = document.querySelector(".main-content");
  isCanvasView = false;
  isFreelayout = false;
  container.classList.remove("free-layout");
  container.classList.add("row-layout");
  mainContent.classList.remove("free-layout-active");
  resetToRowLayout();
  localStorage.setItem("isCanvasView", "false");
  localStorage.setItem("layoutMode", "row");
}

function switchToCanvasView() {
  const container = document.querySelector(".container");
  const mainContent = document.querySelector(".main-content");
  isCanvasView = true;
  isFreelayout = true;
  container.classList.remove("row-layout");
  container.classList.add("free-layout");
  mainContent.classList.add("free-layout-active");
  loadFreeLayoutPositions();
  localStorage.setItem("isCanvasView", "true");
  localStorage.setItem("layoutMode", "free");
}

function updateCanvasScrollArea(padding = 60) {
  const container = document.querySelector(".container.free-layout");
  if (!container) return;

  let maxRight = 0,
    maxBottom = 0;

  container.querySelectorAll(".todo-app").forEach((app) => {
    const left = parseFloat(app.style.left) || 0;
    const top = parseFloat(app.style.top) || 0;
    maxRight = Math.max(maxRight, left + app.offsetWidth);
    maxBottom = Math.max(maxBottom, top + app.offsetHeight);
  });

  let spacer = container.querySelector(".canvas-spacer");
  if (!spacer) {
    spacer = document.createElement("div");
    spacer.className = "canvas-spacer";
    container.appendChild(spacer);
  }
  spacer.style.width = maxRight + padding + "px";
  spacer.style.height = maxBottom + padding + "px";
}

function loadFreeLayoutPositions() {
  const container = document.querySelector(".container");
  const todoApps = container.querySelectorAll(".todo-app");
  const savedPositions =
    JSON.parse(localStorage.getItem("freeLayoutPositions")) || {};

  todoApps.forEach((app, index) => {
    const appId = app
      .querySelector("h2")
      .innerText.replace(/\s+/g, "-")
      .toLowerCase();

    if (savedPositions[appId]) {
      app.style.left = savedPositions[appId].left;
      app.style.top = savedPositions[appId].top;
    } else {
      const row = Math.floor(index / 3);
      const col = index % 3;
      app.style.left = col * 420 + canvasPadding + "px";
      app.style.top = row * 400 + canvasPadding + "px";
    }

    app.removeEventListener("dragstart", handleDragStart);
    app.removeEventListener("dragend", handleDragEnd);
    app.addEventListener("mousedown", handleFreeLayoutMouseDown);
    app.addEventListener("touchstart", handleFreeLayoutTouchStart, {
      passive: true,
    });
  });
}

function resetToRowLayout() {
  const container = document.querySelector(".container");
  const todoApps = container.querySelectorAll(".todo-app");

  todoApps.forEach((app) => {
    app.style.position = "";
    app.style.left = "";
    app.style.top = "";
    app.style.zIndex = "";

    app.removeEventListener("mousedown", handleFreeLayoutMouseDown);
    app.removeEventListener("touchstart", handleFreeLayoutTouchStart);

    app.setAttribute("draggable", "true");
    app.addEventListener("dragstart", handleDragStart);
    app.addEventListener("dragend", handleDragEnd);
  });
}

function updateDragEvents(app) {
  app.removeEventListener("dragstart", handleDragStart);
  app.removeEventListener("dragend", handleDragEnd);

  app.addEventListener("mousedown", handleFreeLayoutMouseDown);
  app.addEventListener("touchstart", handleFreeLayoutTouchStart, {
    passive: true,
  });
}

function resetDragEvents(app) {
  app.removeEventListener("mousedown", handleFreeLayoutMouseDown);
  app.removeEventListener("touchstart", handleFreeLayoutTouchStart);

  app.setAttribute("draggable", "true");
  app.addEventListener("dragstart", handleDragStart);
  app.addEventListener("dragend", handleDragEnd);
}

function handleFreeLayoutMouseDown(e) {
  if (!e.target.closest(".drag-handle")) return;

  const todoApp = this;
  isDragging = true;
  draggedList = todoApp;

  todoApp.style.zIndex = "1000";

  startX = e.clientX;
  startY = e.clientY;

  const style = window.getComputedStyle(todoApp);
  originalX = parseInt(style.left) || 0;
  originalY = parseInt(style.top) || 0;

  const container = document.querySelector(".container.free-layout");
  if (container) container.classList.add("canvas-dragging");

  document.querySelectorAll(".free-layout .todo-app").forEach((app) => {
    if (app !== todoApp) app.classList.add("faded");
    else app.classList.remove("faded");
  });

  document.addEventListener("mousemove", handleFreeLayoutMouseMove);
  document.addEventListener("mouseup", handleFreeLayoutMouseUp);

  e.preventDefault();
}

function handleFreeLayoutTouchStart(e) {
  if (!e.target.closest(".drag-handle")) return;

  const todoApp = this;
  isDragging = true;
  draggedList = todoApp;

  todoApp.style.zIndex = "1000";

  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;

  const style = window.getComputedStyle(todoApp);
  originalX = parseInt(style.left) || 0;
  originalY = parseInt(style.top) || 0;

  const container = document.querySelector(".container.free-layout");
  if (container) container.classList.add("canvas-dragging");

  document.querySelectorAll(".free-layout .todo-app").forEach((app) => {
    if (app !== todoApp) app.classList.add("faded");
    else app.classList.remove("faded");
  });

  document.addEventListener("touchmove", handleFreeLayoutTouchMove, {
    passive: false,
  });
  document.addEventListener("touchend", handleFreeLayoutTouchEnd);
}

function handleFreeLayoutMouseMove(e) {
  if (!isDragging) return;

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  const container = document.querySelector(".container");
  const canvasContent = container.querySelector(".canvas-content");
  const containerRect = container.getBoundingClientRect();
  const listRect = draggedList.getBoundingClientRect();

  let newLeft = originalX + dx;
  let newTop = originalY + dy;

  newLeft = Math.max(canvasPadding, newLeft);
  newTop = Math.max(canvasPadding, newTop);

  draggedList.style.left = newLeft + "px";
  draggedList.style.top = newTop + "px";

  const contentSize = getRequiredContentSize();

  if (
    canvasContent &&
    (contentSize.width > canvasContent.offsetWidth ||
      contentSize.height > canvasContent.offsetHeight)
  ) {
    canvasContent.style.width = contentSize.width + "px";
    canvasContent.style.height = contentSize.height + "px";
  }

  autoScrollContainer(container, e.clientX, e.clientY);
}

function getRequiredContentSize() {
  const container = document.querySelector(".container");
  const todoApps = container.querySelectorAll(".todo-app");
  let maxRight = 0;
  let maxBottom = 0;

  todoApps.forEach((app) => {
    const rect = app.getBoundingClientRect();
    const right = parseInt(app.style.left || 0) + rect.width + canvasPadding;
    const bottom = parseInt(app.style.top || 0) + rect.height + canvasPadding;

    if (right > maxRight) maxRight = right;
    if (bottom > maxBottom) maxBottom = bottom;
  });

  return {
    width: Math.max(maxRight, container.clientWidth),
    height: Math.max(maxBottom, container.clientHeight),
  };
}

function handleFreeLayoutTouchMove(e) {
  if (!isDragging) return;

  const touch = e.touches[0];
  const dx = touch.clientX - startX;
  const dy = touch.clientY - startY;

  const container = document.querySelector(".container");
  const canvasContent = container.querySelector(".canvas-content");

  let newLeft = originalX + dx;
  let newTop = originalY + dy;

  newLeft = Math.max(canvasPadding, newLeft);
  newTop = Math.max(canvasPadding, newTop);

  draggedList.style.left = newLeft + "px";
  draggedList.style.top = newTop + "px";

  const contentSize = getRequiredContentSize();

  if (
    canvasContent &&
    (contentSize.width > canvasContent.offsetWidth ||
      contentSize.height > canvasContent.offsetHeight)
  ) {
    canvasContent.style.width = contentSize.width + "px";
    canvasContent.style.height = contentSize.height + "px";
  }

  autoScrollContainer(container, touch.clientX, touch.clientY);

  e.preventDefault();
}

function handleFreeLayoutMouseUp(e) {
  if (!isDragging) return;

  saveListPosition(draggedList);

  isDragging = false;
  draggedList.style.zIndex = "1";
  draggedList = null;

  const container = document.querySelector(".container.free-layout");
  if (container) container.classList.remove("canvas-dragging");

  document
    .querySelectorAll(".free-layout .todo-app")
    .forEach((app) => app.classList.remove("faded"));

  document.removeEventListener("mousemove", handleFreeLayoutMouseMove);
  document.removeEventListener("mouseup", handleFreeLayoutMouseUp);
}

function handleFreeLayoutTouchEnd(e) {
  if (!isDragging) return;

  saveListPosition(draggedList);

  isDragging = false;
  draggedList.style.zIndex = "100";

  const container = document.querySelector(".container.free-layout");
  if (container) container.classList.remove("canvas-dragging");

  document
    .querySelectorAll(".free-layout .todo-app")
    .forEach((app) => app.classList.remove("faded"));

  document.removeEventListener("touchmove", handleFreeLayoutTouchMove);
  document.removeEventListener("touchend", handleFreeLayoutTouchEnd);
}

function saveListPosition(list) {
  const appId = list
    .querySelector("h2")
    .innerText.replace(/\s+/g, "-")
    .toLowerCase();
  const positions =
    JSON.parse(localStorage.getItem("freeLayoutPositions")) || {};

  positions[appId] = {
    left: list.style.left,
    top: list.style.top,
  };

  localStorage.setItem("freeLayoutPositions", JSON.stringify(positions));
}

function updateCanvasSize(forceResize = false) {
  const container = document.querySelector(".container.free-layout");
  if (!container) return;

  const todoApps = container.querySelectorAll(".todo-app");
  let maxRight = 0;
  let maxBottom = 0;

  todoApps.forEach((app) => {
    const rect = app.getBoundingClientRect();
    const right = parseInt(app.style.left || 0) + rect.width;
    const bottom = parseInt(app.style.top || 0) + rect.height;

    if (right > maxRight) maxRight = right;
    if (bottom > maxBottom) maxBottom = bottom;
  });

  const newWidth = Math.max(maxRight + canvasPadding, container.clientWidth);
  const newHeight = Math.max(maxBottom + canvasPadding, container.clientHeight);

  if (newWidth > canvasWidth || newHeight > canvasHeight || forceResize) {
    canvasWidth = newWidth;
    canvasHeight = newHeight;
    container.style.minWidth = `${canvasWidth}px`;
    container.style.minHeight = `${canvasHeight}px`;
  }
}

function addScrollingWhenDraggingNearEdges() {
  if (!isFreelayout) return;

  const container = document.querySelector(".container.free-layout");
  const edgeThreshold = 50;
  const scrollSpeed = 15;
  let scrollInterval = null;

  function checkForScrolling(clientX, clientY) {
    const containerRect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;

    const distanceFromLeft = clientX - containerRect.left;
    const distanceFromRight = containerRect.right - clientX;
    const distanceFromTop = clientY - containerRect.top;
    const distanceFromBottom = containerRect.bottom - clientY;

    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }

    if (isDragging) {
      if (distanceFromRight < edgeThreshold) {
        scrollInterval = setInterval(() => {
          container.scrollLeft += scrollSpeed;
        }, 50);
      } else if (distanceFromLeft < edgeThreshold && scrollLeft > 0) {
        scrollInterval = setInterval(() => {
          container.scrollLeft -= scrollSpeed;
        }, 50);
      } else if (distanceFromBottom < edgeThreshold) {
        scrollInterval = setInterval(() => {
          container.scrollTop += scrollSpeed;
        }, 50);
      } else if (distanceFromTop < edgeThreshold && scrollTop > 0) {
        scrollInterval = setInterval(() => {
          container.scrollTop -= scrollSpeed;
        }, 50);
      }
    }
  }

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      checkForScrolling(e.clientX, e.clientY);
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      checkForScrolling(touch.clientX, touch.clientY);
    }
  });

  document.addEventListener("mouseup", () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  });

  document.addEventListener("touchend", () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
  });
}

function enterCanvasMode() {
  const container = document.querySelector(".container");
  const containerRect = container.getBoundingClientRect();

  container.classList.add("canvas-view");
  container.querySelectorAll(".todo-app").forEach((app) => {
    const r = app.getBoundingClientRect();
    app.style.left = r.left - containerRect.left + container.scrollLeft + "px";
    app.style.top = r.top - containerRect.top + container.scrollTop + "px";
  });

  updateCanvasScrollArea();
}
function leaveCanvasMode() {
  const container = document.querySelector(".container");
  container.classList.remove("canvas-view");
  container.querySelectorAll(".todo-app").forEach((app) => {
    app.style.left = app.style.top = app.style.position = "";
  });
  const spacer = container.querySelector(".canvas-spacer");
  if (spacer) spacer.remove();
}

function toggleView() {
  const container = document.querySelector(".container");
  if (container.classList.contains("canvas-view")) {
    leaveCanvasMode();
  } else {
    enterCanvasMode();
  }
}

document.querySelectorAll(".view-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    if (view === "list" && isCanvasView) {
      switchToListView();
      isCanvasView = false;
    } else if (view === "canvas" && !isCanvasView) {
      switchToCanvasView();
      isCanvasView = true;
    }
    document
      .querySelectorAll(".view-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

let isCanvasView = localStorage.getItem("isCanvasView") === "true" || false;

// =========================================
//        MOBILE SWIPE NAVIGATION
// =========================================

document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector(".container");
  const isMobile = window.innerWidth <= 768;
  let swipeIndicators,
    currentListIndex = 0;

  function initMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.querySelector(".main-content");

    if (window.innerWidth <= 768) {
      sidebar.classList.add("collapsed");
      mainContent.classList.add("sidebar-collapsed");
    }
  }

  initMobileSidebar();

  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768) {
      initMobileSidebar();
    }
  });

  function setupMobileView() {
    if (window.innerWidth <= 768 && !isFreelayout) {
      if (!document.querySelector(".swipe-indicator")) {
        const todoApps = container.querySelectorAll(".todo-app");

        swipeIndicators = document.createElement("div");
        swipeIndicators.className = "swipe-indicator";
        document.querySelector(".main-content").appendChild(swipeIndicators);

        todoApps.forEach((_, index) => {
          const dot = document.createElement("div");
          dot.className = "indicator-dot";
          if (index === 0) dot.classList.add("active");
          dot.addEventListener("click", () => scrollToList(index));
          swipeIndicators.appendChild(dot);
        });

        const leftArrow = document.createElement("div");
        leftArrow.className = "swipe-arrow swipe-arrow-left";
        leftArrow.addEventListener("click", () => navigateList("prev"));
        container.appendChild(leftArrow);

        const rightArrow = document.createElement("div");
        rightArrow.className = "swipe-arrow swipe-arrow-right";
        rightArrow.addEventListener("click", () => navigateList("next"));
        container.appendChild(rightArrow);

        setTimeout(() => {
          const firstList = container.querySelector(".todo-app");
          if (firstList) {
            container.scrollLeft = 0;
            updateIndicators(0);
          }
        }, 100);
      }
    } else {
      const indicators = document.querySelector(".swipe-indicator");
      if (indicators) indicators.remove();

      const arrows = document.querySelectorAll(".swipe-arrow");
      arrows.forEach((arrow) => arrow.remove());
    }
  }

  function updateIndicators(index) {
    if (!swipeIndicators) return;

    const dots = swipeIndicators.querySelectorAll(".indicator-dot");
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    currentListIndex = index;

    const leftArrow = document.querySelector(".swipe-arrow-left");
    const rightArrow = document.querySelector(".swipe-arrow-right");

    if (leftArrow && rightArrow) {
      leftArrow.style.display = index === 0 ? "none" : "flex";
      rightArrow.style.display = index === dots.length - 1 ? "none" : "flex";
    }
  }

  function scrollToList(index) {
    const todoApps = container.querySelectorAll(".todo-app");
    if (index >= 0 && index < todoApps.length) {
      const targetList = todoApps[index];
      container.scrollTo({
        left: targetList.offsetLeft - container.offsetLeft,
        behavior: "smooth",
      });
      updateIndicators(index);
    }
  }

  function navigateList(direction) {
    const newIndex =
      direction === "next"
        ? Math.min(
            currentListIndex + 1,
            container.querySelectorAll(".todo-app").length - 1
          )
        : Math.max(currentListIndex - 1, 0);

    scrollToList(newIndex);
  }

  container.addEventListener(
    "scroll",
    debounce(function () {
      if (window.innerWidth > 768 || isFreelayout) return;

      const todoApps = container.querySelectorAll(".todo-app");
      const containerLeft = container.scrollLeft;
      const containerWidth = container.offsetWidth;

      let maxVisibleIndex = 0;
      let maxVisibleAmount = 0;

      todoApps.forEach((app, index) => {
        const appLeft = app.offsetLeft - container.offsetLeft;
        const appWidth = app.offsetWidth;

        const visibleLeft = Math.max(containerLeft, appLeft);
        const visibleRight = Math.min(
          containerLeft + containerWidth,
          appLeft + appWidth
        );
        const visibleAmount = Math.max(0, visibleRight - visibleLeft);

        if (visibleAmount > maxVisibleAmount) {
          maxVisibleAmount = visibleAmount;
          maxVisibleIndex = index;
        }
      });

      updateIndicators(maxVisibleIndex);
    }, 100)
  );

  setupMobileView();

  window.addEventListener(
    "resize",
    debounce(function () {
      setupMobileView();
    }, 250)
  );

  const observer = new MutationObserver(
    debounce(function (mutations) {
      mutations.forEach(function (mutation) {
        if (
          mutation.type === "childList" &&
          window.innerWidth <= 768 &&
          !isFreelayout
        ) {
          setupMobileView();
        }
      });
    }, 250)
  );

  observer.observe(container, { childList: true });

  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    };
  }

  let touchStartX = 0;
  let touchEndX = 0;

  container.addEventListener(
    "touchstart",
    (e) => {
      if (isFreelayout) return;
      touchStartX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );

  container.addEventListener(
    "touchend",
    (e) => {
      if (isFreelayout) return;
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    },
    { passive: true }
  );

  function handleSwipeGesture() {
    const swipeThreshold = 50;
    if (touchStartX - touchEndX > swipeThreshold) {
      navigateList("next");
    } else if (touchEndX - touchStartX > swipeThreshold) {
      navigateList("prev");
    }
  }

  window.scrollToList = scrollToList;

  const savedLayout = localStorage.getItem("layoutMode");
  if (savedLayout === "free") {
    isFreelayout = true;
    toggleLayout();
  }
});
