#!/usr/bin/env node

import vorpal from "vorpal"
import shell from "shelljs"
import commit, { breaking, footer } from "./commit"

const conventions = vorpal()
const adapter = [
  {
    type: "list",
    name: "type",
    message: "What type of change is this? ",
    default: "wip",
    choices: ["feat", "fix", "dev", "test", "wip"]
  },
  {
    type: "input",
    name: "description",
    message: "Briefly describe this change: "
  },
  {
    type: "input",
    name: "scope",
    message: "Provide the scope of this change (optional): "
  },
  {
    type: "input",
    name: "body",
    message: "Additional details (optional): "
  }
  // TODO: footer data
  // affects: [directory]
]

conventions.command(
  "commit",
  "Wraps `git commit` to assist in formatting a conventional commit"
  ).action(function(args, cb) {
    return this.prompt(adapter).then(({type, scope, description, body}) => {
      this.log("Example:\n")
      this.log(
        commit({
          type,
          scope,
          description,
          body,
          // TODO: footer
        })
      )
    })
  })

conventions.show().parse(process.argv)