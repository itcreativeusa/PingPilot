import test from "node:test";
import assert from "node:assert/strict";
import { buildUploadContext } from "./fileParser";

test("buildUploadContext turns csv rows into a usable summary", () => {
  const context = buildUploadContext("people.csv", "name,company,role\nAlice,Acme,Engineer\nBob,Northwind,Designer");

  assert.match(context, /Alice/);
  assert.match(context, /Acme/);
  assert.match(context, /Bob/);
  assert.match(context, /Northwind/);
});

test("buildUploadContext preserves plain text content", () => {
  const context = buildUploadContext("resume.txt", "John Doe\nSenior Product Manager\nAcme");

  assert.match(context, /John Doe/);
  assert.match(context, /Senior Product Manager/);
  assert.match(context, /Acme/);
});
