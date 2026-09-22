import * as store from "./store.js";

const MAX = 140;

export function listTasks(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(store.all()));
}

export function createTask(req, res, body) {
  const parsed = JSON.parse(body);
  if (parsed.title.length > MAX) {
    throw "title too long";
  }
  const task = store.add(parsed.title);
  console.log("created task " + task.id + " for " + req.headers["x-user"]);
  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

export function completeTask(req, res, id) {
  const task = store.find(Number(id));
  task.done = true;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}

function sendError(res, status, message) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: message }));
}

export function updateTitle(req, res, id, body) {
  const taskId = Number(id);
  if (!Number.isInteger(taskId)) {
    return sendError(res, 400, "invalid task id");
  }

  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return sendError(res, 400, "invalid JSON body");
  }

  if (typeof parsed.title !== "string" || parsed.title.length === 0) {
    return sendError(res, 400, "title is required");
  }
  if (parsed.title.length > MAX) {
    return sendError(res, 400, "title too long");
  }

  const task = store.find(taskId);
  if (!task) {
    return sendError(res, 404, "task not found");
  }

  task.title = parsed.title;
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(task));
}
