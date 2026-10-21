const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const { test } = require("node:test")

const model = vm.createContext({})
vm.runInContext(fs.readFileSync(path.join(__dirname, "../Model.js"), "utf8"), model)

const cases = [
  ["ddd MMM d h:mm:ss AP", false, "ddd MMM d h:mm AP"],
  ["ddd MMM d h:mm:ss AP", true, "ddd MMM d h:mm:ss AP"],
  ["HH:mm:ss", false, "HH:mm"],
  ["HH:mm:s", false, "HH:mm"],
  ["HH.mm.ss", false, "HH.mm"],
  ["HH mm ss", false, "HH mm"],
  ["HH:mm", false, "HH:mm"],
  ["HH:mm", true, "HH:mm:ss"],
  ["h:mm AP", true, "h:mm:ss AP"],
  ["h:m AP", true, "h:m:ss AP"],
  ["HH:mm:s", true, "HH:mm:s"],
  ["yyyy-MM-dd", true, "yyyy-MM-dd"],
  ["yyyy-MM-dd", false, "yyyy-MM-dd"],
  ["HH\n—\nmm", false, "HH\n—\nmm"],
  ["HH:mm:ss 'seconds'", false, "HH:mm 'seconds'"],
  ["HH:mm 'ss'", true, "HH:mm:ss 'ss'"],
  ["'mm' HH:mm", true, "'mm' HH:mm:ss"],
  ["'ss' HH:mm:ss", false, "'ss' HH:mm"],
  ["HH:mm ':ss'", false, "HH:mm ':ss'"],
  ["HH:mm 'it''s ss'", true, "HH:mm:ss 'it''s ss'"],
  ["HH:mm:ss 'it''s ss'", false, "HH:mm 'it''s ss'"],
  ["", true, ""],
  ["", false, ""],
]

for (const [format, enabled, expected] of cases) {
  test(`withSeconds(${JSON.stringify(format)}, ${enabled})`, () => {
    assert.equal(model.withSeconds(format, enabled), expected)
  })
}

test("enabling, disabling and re-enabling does not duplicate seconds", () => {
  const configured = "ddd MMM d h:mm:ss AP"
  const hidden = model.withSeconds(configured, false)
  const shown = model.withSeconds(hidden, true)
  assert.equal(shown, configured)
  assert.equal(model.withSeconds(shown, true), configured)
  assert.equal(model.withSeconds(hidden, false), hidden)
})
