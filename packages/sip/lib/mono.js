//@flow
import * as Sip from "./index"
import inquirer from "inquirer"
import { resolve, dirname } from "path"
import fs from "fs"

// $FlowFixMe
const { stat, mkdir, writeFile } = fs.promises

/**
 *
 * You will be prompted for a few answers and then your package will be made available under your packages folder!
 *
 * Here's how to initialize this in your root monorepo gulpfile
 *
 * ```
 * exports.init = Mono.init({
 *     repository: meta.repository.url,
 *     directory: meta.workspaces[0],
 *     registry: "https://npm.pkg.github.com",
 *     scope: "talon"
 * })
 * ```
 *
 * @param {object} repo an object describing your monorepo
 * @param {string} repo.repository the URL for this repo
 * @param {string} repo.directory the directory with your packages
 * @param {string} repo.registry the registry link where you publish your packages
 * @param {string} repo.scope your npm scope
 * @returns {Function} the initalized gulp task
 */
export const init = repo => () => {
  console.log("🥚  Oh! A package!")
  return inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "🥚  What do you call it?"
      },
      {
        type: "input",
        name: "description",
        message: "🥚  What does it do?"
      },
      {
        type: "input",
        name: "author",
        message: "🥚  Who is the author?"
      },
      {
        type: "input",
        name: "keywords",
        message: "🥚  What are some keywords for it?"
      }
    ])
    .then(prompt =>
      Object.assign(prompt, {
        name: `@${repo.scope}/${prompt.name}`,
        version: "1.0.0",
        repository: {
          type: "git",
          url: repo.repository,
          directory: `${dirname(repo.directory)}/${prompt.name}`
        },
        keywords: prompt.keywords.split(",").map(keyword => keyword.trim()),
        main: "dist",
        files: ["lib", "dist"]
      })
    )
    .then(meta => {
      const dir = resolve(meta.repository.directory)
      return (
        stat(dir)
          .then(stat => {
            throw new Error(`Oh no. ${meta.name} already exists! (${dir})`)
          })
          .catch(e => {})
          .then(() => mkdir(dir))
          .then(() =>
            writeFile(
              `${dir}/package.json`,
              JSON.stringify(meta, null, 2),
              "utf8"
            )
          )
          .then(() => mkdir(`${dir}/lib`))
          .then(() =>
            writeFile(
              `${dir}/lib/index.js`,
              `/**\n * @name ${
                meta.name.split("/").slice(-1)[0]
              }\n */\nexport default () => {}`,
              "utf8"
            )
          )
          // TODO: this is a pretty ugly hack to keep the tasks.json inputs "package" options up-to-date when new packages are added
          //       there's gotta be a nicer way to do this. I think with an Extension or something maybe... idk but this works
          .then(() => {
            const tasks = resolve(process.cwd(), ".vscode/tasks.json")
            return stat(tasks)
              .then(() => {
                const json = require(tasks)
                Object.assign(json, {
                  inputs: json.inputs.map(i =>
                    i.id === "package"
                      ? Object.assign(i, {
                          options: i.options
                            .concat([meta.name.split("/").slice(-1)[0]])
                            .sort()
                        })
                      : i
                  )
                })
                return writeFile(tasks, JSON.stringify(json, null, 2), "utf8")
              })
              .catch(e => {})
          })
          .then(() => console.log(`🐣   ${meta.name} has been created!`))
      )
    })
}
