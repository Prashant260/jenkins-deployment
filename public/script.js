const healthButton = document.querySelector("#checkHealth");
const healthStatus = document.querySelector("#healthStatus");
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");

async function loadTasks() {
  const response = await fetch("/api/tasks");
  const data = await response.json();

  taskList.innerHTML = "";
  data.tasks.forEach((task) => {
    const item = document.createElement("li");
    const status = document.createElement("span");

    item.textContent = task.title;
    status.textContent = task.completed ? "Completed" : "In progress";
    item.appendChild(status);
    taskList.appendChild(item);
  });
}

healthButton.addEventListener("click", async () => {
  healthStatus.textContent = "Checking...";

  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    healthStatus.textContent = `${data.message}`;
  } catch (error) {
    healthStatus.textContent = "Backend is not reachable";
  }
});

taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = taskInput.value.trim();
  if (!title) {
    return;
  }

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  taskInput.value = "";
  loadTasks();
});

loadTasks();
