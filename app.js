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
        saveData();
    }

    input.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            saveEdit();
        }
    });

    input.addEventListener("blur", saveEdit);
}

function saveData(){
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTaskData(){
    listContainer.innerHTML = localStorage.getItem("data");
}
showTaskData();
