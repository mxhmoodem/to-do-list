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

    displayCurrentDate();
});

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

const inputBox = document.getElementById('input-box');
const listContainer = document.getElementById('list-container');

inputBox.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addTask();
    }
});

function addTask() {
    if(inputBox.value === '') {
        alert("Please enter a task");
    } 
    else {
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
        saveData();
        return;
    }

    if (e.target.tagName === "SPAN") {
        e.target.parentElement.remove();
        saveData();
        return;
    }

    if (clickX >= 35 && e.target.tagName === "LI") {
        editTask(e.target);
    }
});

function editTask(li) {
    if (li.classList.contains("editing")) return;

    const span = li.querySelector("span");
    const currentText = li.firstChild.textContent.trim();
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.classList.add("edit-input");
    li.classList.add("editing");

    li.innerHTML = '';
    li.appendChild(input);
    li.appendChild(span);
    input.focus();

    function saveEdit() {
        const newText = input.value.trim() || currentText;
        li.innerHTML = newText;
        li.appendChild(span);
        li.classList.remove("editing");

        li.setAttribute('draggable', 'true');
        addDragAndDropHandlers(li);

        saveData();
    }

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            saveEdit();
        }
    });

    input.addEventListener("blur", saveEdit);
}

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
        saveData();
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


function saveData(){
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTaskData() {
    listContainer.innerHTML = localStorage.getItem("data") || '';
    const listItems = listContainer.querySelectorAll('li');
    listItems.forEach(li => {
        li.setAttribute('draggable', 'true');
        addDragAndDropHandlers(li);
    });
}
showTaskData();
