import shell from "shelljs"
import inquirer from "inquirer"

export const affects = sources => () => {
  const staged = shell
    .exec("git diff --cached --name-only", { silent: true })
    .stdout.split("\n")

  const all = shell.ls(sources)
  const affected = new Set(
    staged
      .filter(path => path.match(new RegExp(`${sources}\/*`)))
      .map(path => path.replace(new RegExp(`${sources}\/`), "").split("/")[0])
  )

  return inquirer
    .prompt({
      type: "checkbox",
      name: "affects",
      message: "Identify what sources this commit affects: ",
      choices: all.map(pkg => {
        return {
          name: pkg,
          value: pkg,
          checked: affected.has(pkg)
        }
      })
    })
    .then(({ affects }) => ({
      affects: affects.join(", ")
    }))
}
