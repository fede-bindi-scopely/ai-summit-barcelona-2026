import { test } from "node:test";
import assert from "node:assert/strict";
import * as store from "./store.js";
import { updateTitle } from "./handlers.js";

function mockRes() {
  return {
    statusCode: null,
    body: null,
    writeHead(status) {
      this.statusCode = status;
    },
    end(payload) {
      this.body = payload;
    },
  };
}

test("updates the title of an existing task", () => {
  const task = store.add("before");
  const res = mockRes();
  updateTitle({}, res, String(task.id), JSON.stringify({ title: "after" }));
  assert.equal(res.statusCode, 200);
  assert.equal(JSON.parse(res.body).title, "after");
});

test("returns 404 when the task does not exist", () => {
  const res = mockRes();
  updateTitle({}, res, "999999", JSON.stringify({ title: "x" }));
  assert.equal(res.statusCode, 404);
});

test("returns 400 when the title is missing", () => {
  const task = store.add("keep me");
  const res = mockRes();
  updateTitle({}, res, String(task.id), JSON.stringify({}));
  assert.equal(res.statusCode, 400);
  assert.equal(task.title, "keep me");
});

test("returns 400 when the title exceeds the max length", () => {
  const task = store.add("keep me too");
  const res = mockRes();
  updateTitle({}, res, String(task.id), JSON.stringify({ title: "x".repeat(141) }));
  assert.equal(res.statusCode, 400);
  assert.equal(task.title, "keep me too");
});

test("returns 400 on an invalid JSON body", () => {
  const res = mockRes();
  updateTitle({}, res, "1", "not json");
  assert.equal(res.statusCode, 400);
});
