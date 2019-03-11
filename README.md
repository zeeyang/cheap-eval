# cheap-eval

Fast, dependency free object evaluation engine for JavaScript. Useful for performance-sensitive code running in browser or Node.

## Quick Start
An cheap-eval expression is an array in the form of: `[operator, ...operands]`. The most basic operators are `has` and `get`:

```js
const createEval = require("cheap-eval")
const person = { age: 20 }

const hasAge = createEval(["has", "age"])
hasAge(person) // Return true

const getAge = createEval(["get", "age"])
getAge(person) // Return 20
```

Expressions can be nested to form complex rules.

```js
const person = { age: 20 }

const isWorkingAge = createEval([">=", 18, ["get", "age"], 65])
isWorkingAge(person) // Return true

const isDrinkingAge = createEval([">", ["get", "age"], 20])
isDrinkingAge(person) // Return false

```

## Usage
Bind with filter, sort
