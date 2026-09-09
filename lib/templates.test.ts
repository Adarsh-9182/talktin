import assert from "node:assert/strict";
import { test } from "node:test";
import { TEMPLATES, findTemplate } from "./templates.ts";
import { findVoice } from "./voices.ts";

/*
 * Every template's voice was a Gemini id long after the engine became Kokoro,
 * so the Templates page rendered blank names and opening one handed the
 * composer an id that made generation throw. Nothing caught it, because
 * nothing checked that the two lists agreed. This does.
 */
test("every template names a voice that exists", () => {
  for (const template of TEMPLATES) {
    assert.ok(findVoice(template.voice), `template ${template.id} names a voice that is not in the catalogue: ${template.voice}`);
  }
});

test("every template is reachable by its own id, and ids are unique", () => {
  const ids = new Set<string>();
  for (const template of TEMPLATES) {
    assert.equal(ids.has(template.id), false, `duplicate template id ${template.id}`);
    ids.add(template.id);
    assert.equal(findTemplate(template.id)?.id, template.id);
  }
  assert.equal(findTemplate("not-a-template"), undefined);
});

test("speed is inside the range the engine accepts", () => {
  for (const template of TEMPLATES) {
    assert.ok(template.speed >= 0.5 && template.speed <= 2, `template ${template.id} has speed ${template.speed}`);
    assert.ok(template.text.trim().length > 0, `template ${template.id} has no text`);
  }
});
