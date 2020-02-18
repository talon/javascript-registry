#!/usr/bin/env node

import yargs from "yargs"
import commit from "./commit"

yargs
  .command(
    "commit",
    "Wraps `git commit` to assist in formatting a conventional commit",
    async function() {
      try {
        console.log(await commit({ sources: "packages" }))
      } catch (e) {
        // TODO: Error UX, colors and stuff
        console.error(e.message)
      }
    }
  )
  .command("version", "Tag HEAD with a semantic version", async function() {
    // TODO: Error UX, colors and stuff
    console.log("got em")
  }).argv
