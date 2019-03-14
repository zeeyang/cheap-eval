export default function createEval(expression: any[]) {
    return new Function("p", `return ${compileExpression(expression)}`)
}

export function debugEval(expression: any[], data: any): string[] {
    const expressions = collectExpressions(expression)
    return expressions.map((exp: any[]) => {
        const key = JSON.stringify(exp)
        const value = createEval(exp)(data)
        return `${key}: ${value}`
    })
}

function collectExpressions(expression: any[]): any[][] {
    let expressions: any[][] = []
    for (let token of expression) {
        if (Array.isArray(token)) {
            const children = collectExpressions(token)
            expressions = [...children, ...expressions]
        }
    }
    return [...expressions, expression]
}

function compileExpression(assert: any[]): string {
    if (!assert) return "false";
    const op = assert[0];
    if (assert.length <= 1) return op === "any" ? "true" : "false";
    const opstr =
        op === "==" ? compileComparisonOp(assert.slice(1), "===", false) :
        op === "!=" ? compileComparisonOp(assert.slice(1), "!==", false) :
        op === "<" ||
        op === ">" ||
        op === "<=" ||
        op === ">=" ? compileComparisonOp(assert.slice(1), op, true) :
        op === "any" ? compileLogicalOp(assert.slice(1), "||") :
        op === "all" ? compileLogicalOp(assert.slice(1), "&&") :
        op === "none" ? compileNegation(compileLogicalOp(assert.slice(1), "||")) :
        op === "in" ? compileInOp(assert[1], assert.slice(2)) :
        op === "!in" ? compileNegation(compileInOp(assert[1], assert.slice(2))) :
        op === "has" ? compileHasOp(assert[1]) :
        op === "!has" ? compileNegation(compileHasOp(assert[1])) :
        op === "get" ? compilePropertySafeGetter(assert[1]) :
        JSON.stringify(assert)
    return `(${opstr})`
}

function compileToken(token: any) {
    if (Array.isArray(token)) {
        return compileExpression(token)
    } else if (typeof token === "string" || typeof token === "object") {
        return JSON.stringify(token)
    } else {
        return token
    }
}

function compilePropertyGetter(property: string) {
    const paths = property.split(".").map(path => `[${JSON.stringify(path)}]`)
    return `p${paths.join("")}`
}

function compilePropertySafeGetter(property: string) {
    const checkPath = compileHasOp(property)
    const getter = compilePropertyGetter(property)
    return `(${checkPath} ? ${getter} : undefined)`
}

function compileComparisonOp(expressions: any[], op: string, typed: boolean) {
    if (expressions.length < 2) return false
    const tokens = expressions.map(compileToken)
    const compare = tokens.slice(1).map((t, i) => `(${tokens[i]} ${op} ${t})`).join(" && ")
    const checkType = typed ? `${tokens.slice(1).map((t, i) => `(typeof ${tokens[i]} === typeof ${t})`).join(" && ")} &&` : ""
    return `${checkType} ${compare}`
}

function compileLogicalOp(expressions: any[], op: string) {
    return expressions.map(compileToken).map(exp => `!!(${exp})`).join(` ${op} `)
}

function compileInOp(property: string, values: any[]) {
    const left = compileToken(property)
    const right = JSON.stringify(values.map(v => compileToken(v)))
    return `${right}.indexOf(${left}) !== -1`
}

function compileHasOp(property: string) {
    let decent = "p"
    const paths = property.split(".").map(path => {
        const op = `${JSON.stringify(path)} in ${decent}`
        decent = `${decent}[${JSON.stringify(path)}]`
        return op
    })
    return paths.join(" && ")
}

function compileNegation(expression: any) {
    return `!(${expression})`
}

function compare(a: number, b: number) {
    return a < b ? -1 : a > b ? 1 : 0
}
