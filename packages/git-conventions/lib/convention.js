import inquirer from "inquirer"
import { affects } from "./monorepo"

export const name = "angular"

export const types = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "chore"
]

/**
 * @private
 */
export function footers(sources) {
  const affected = sources ? affects(sources) : null
  return [affected, breaking]
}
/**
 * used to include BREAKING CHANGES in the footer
 *
 * @private
 */
function breaking() {
  return inquirer
    .prompt({
      type: "input",
      name: "BREAKING CHANGES",
      message: "Identify any BREAKING CHANGES: "
    })
    .then(answers => (answers["BREAKING CHANGES"] !== "" ? answers : {}))
}
