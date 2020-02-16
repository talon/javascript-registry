#!/usr/bin/env node

import Vorpal from "vorpal"
import commit from "./commit"

const cli = new Vorpal()

cli
  .command(
    "commit",
    "Wraps `git commit` to assist in formatting a conventional commit"
  )
  .action(function(args) {
    // TODO: Error UX, colors and stuff
    return commit.call(this, { sources: "packages" }).catch(e => this.log(e))
  })

cli
  .delimiter("git-conventions")
  .show()
  .parse(process.argv)
