'use strict';

const test = require("tape").test
const createEval = require("../dist/cheap-eval").default
const object = require("./fixtures/object.json")
const array = require("./fixtures/array.json")

test("get", t => {
    // Simple getter
    let exp = createEval(["get", "name"])
    t.equal(exp(object), "root name")

    // Nested getter
    exp = createEval(["get", "item1.name"])
    t.equal(exp(object), "First item")

    // Get undefined
    exp = createEval(["get", "does-not-exist"])
    t.equal(exp(object), undefined)

    // Get array
    exp = createEval(["get", "locations.0.name"])
    t.equal(exp(object), "Location One")

    // Nested undefined
    exp = createEval(["get", "does-not-exist.xxx"])
    t.equal(exp(object), undefined)

    t.end()
})

test("has", t => {
    // Simple has
    let exp = createEval(["has", "name"])
    t.equal(exp(object), true)

    // Nested has
    exp = createEval(["has", "item1.name"])
    t.equal(exp(object), true)

    // Undefined has
    exp = createEval(["has", "does-not-exist"])
    t.equal(exp(object), false)

    // Nested undefined
    exp = createEval(["has", "item1.does-not-exist"])
    t.equal(exp(object), false)

    exp = createEval(["has", "does-not-exist.name"])
    t.equal(exp(object), false)

    t.end()
})

test("==", t => {
    const item1 = ["get", "item1.available"]
    const item2 = ["get", "item2.available"]
    const item3 = ["get", "item3.available"]
    const itemUndefined = ["get", "does-not-exist"]

    // Simple compare
    let exp = createEval(["==", item1, 9])
    t.equal(exp(object), true)

    // Reverse compare
    exp = createEval(["==", 20, item2])
    t.equal(exp(object), true)

    // Double nest
    exp = createEval(["==", item1, item2])
    t.equal(exp(object), false)
    exp = createEval(["==", item1, item3])
    t.equal(exp(object), true)

    // Multi items
    exp = createEval(["==", item1, item3, item2])
    t.equal(exp(object), false)

    // Undefined
    exp = createEval(["==", item1, itemUndefined])
    t.equal(exp(object), false)

    t.end()
})

test(">, >=", t => {
    const item1 = ["get", "item1.available"]
    const item2 = ["get", "item2.available"]
    const item1String = ["get", "item1.available_str"]
    const itemUndefined = ["get", "does-not-exist"]

    // Simple compare as number
    let exp = createEval([">=", item1, 9])
    t.equal(exp(object), true)

    exp = createEval([">", item1, 8])
    t.equal(exp(object), true)

    // Compare multiple
    exp = createEval([">", item2, 10, 8])
    t.equal(exp(object), true)

    // Compare undefined
    exp = createEval([">", itemUndefined, 8])
    t.equal(exp(object), false)

    // Compare edge
    exp = createEval([">", item1, 9])
    t.equal(exp(object), false)

    // Compare as string
    exp = createEval([">=", item1String, "8"])
    t.equal(exp(object), true)

    // Compare type fail
    exp = createEval([">=", item1, "9"])
    t.equal(exp(object), false)

    t.end()
})

test("<, <=", t => {
    const item1 = ["get", "item1.available"]
    const item2 = ["get", "item2.available"]
    const item1String = ["get", "item1.available_str"]
    const itemUndefined = ["get", "does-not-exist"]

    // Simple compare as number
    let exp = createEval(["<=", item1, 9])
    t.equal(exp(object), true)

    exp = createEval(["<", item1, 10])
    t.equal(exp(object), true)

    // Compare multiple
    exp = createEval(["<", 8, item1, 10, item2])
    t.equal(exp(object), true)

    // Compare undefined
    exp = createEval(["<", itemUndefined, 8])
    t.equal(exp(object), false)

    // Compare edge
    exp = createEval(["<", item1, 9])
    t.equal(exp(object), false)

    // Compare as string
    exp = createEval(["<=", "8", item1String])
    t.equal(exp(object), true)

    // Compare type fail
    exp = createEval(["<=", "8", item1])
    t.equal(exp(object), false)

    t.end()
})

test("any", t => {
    const isTrue = ["==", ["get", "item1.available"], 9]
    const isFalse = ["==", ["get", "item1.available"], 0]
    const isUndefined = ["get", "does-no-exist"]

    // With at least one true
    let exp = createEval(["any", isTrue])
    t.equal(exp(object), true)

    exp = createEval(["any", isTrue, false, false])
    t.equal(exp(object), true)

    // With one false
    exp = createEval(["any", isFalse])
    t.equal(exp(object), false)

    exp = createEval(["any", isFalse, true])
    t.equal(exp(object), true)

    exp = createEval(["any", isFalse, true, false])
    t.equal(exp(object), true)

    // With one undefined
    exp = createEval(["any", isUndefined])
    t.equal(exp(object), false)

    exp = createEval(["any", isUndefined, true])
    t.equal(exp(object), true)

    t.end()
})

test("all", t => {
    const isTrue = ["==", ["get", "item1.available"], 9]
    const isFalse = ["==", ["get", "item1.available"], 0]
    const isUndefined = ["get", "does-no-exist"]

    // With at least one true
    let exp = createEval(["all", isTrue])
    t.equal(exp(object), true)

    exp = createEval(["all", isTrue, true, true])
    t.equal(exp(object), true)

    // With one false
    exp = createEval(["all", isFalse])
    t.equal(exp(object), false)

    exp = createEval(["all", isFalse, true])
    t.equal(exp(object), false)

    exp = createEval(["all", isFalse, true, false])
    t.equal(exp(object), false)

    // With one undefined
    exp = createEval(["all", isUndefined])
    t.equal(exp(object), false)

    exp = createEval(["all", true, isUndefined])
    t.equal(exp(object), false)

    t.end()
})

test("none", t => {
    const isTrue = ["==", ["get", "item1.available"], 9]
    const isFalse = ["==", ["get", "item1.available"], 0]
    const isUndefined = ["get", "does-no-exist"]

    // With at least one false
    let exp = createEval(["none", isFalse])
    t.equal(exp(object), true)

    exp = createEval(["none", isFalse, false])
    t.equal(exp(object), true)

    // With one true
    exp = createEval(["none", isTrue])
    t.equal(exp(object), false)

    exp = createEval(["none", isTrue, false])
    t.equal(exp(object), false)

    exp = createEval(["none", isTrue, true, false])
    t.equal(exp(object), false)

    // With one undefined
    exp = createEval(["none", isUndefined])
    t.equal(exp(object), true)

    exp = createEval(["none", false, isUndefined])
    t.equal(exp(object), true)

    t.end()
})

test("array functions", t => {
    // Map
    let exp = createEval(["get", "name"])
    t.equal(JSON.stringify(array.map(exp)), JSON.stringify(array.map(a => a.name)))

    // Filter
    exp = createEval(["<", 10, ["get", "available"], 25])
    t.equal(JSON.stringify(array.filter(exp)), JSON.stringify([array[1]]))

    // Find
    exp = createEval(["==", ["get", "available"], 20])
    t.equal(array.find(exp), array[1])

    // Every
    exp = createEval([">=", ["get", "available"], 9])
    t.equal(array.every(exp), true)

    t.end()
})
