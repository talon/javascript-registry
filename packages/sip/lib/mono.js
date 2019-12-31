//@flow
const Sip = require("./index")

/**
 * This initializes the Sip Suite with a package root. 
 * 
 * With Lerna you can use it like this
 * 
 * ```
 * Object.assign(exports, Mono.tasks(process.env.LERNA_PACKAGE_NAME ? `${__dirname}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}` : false))
 * ```
 * 
 * Now the Sip tasks will be available for your monorepo packages on the fly!
 */
export const tasks = (pkg) /*: string */ =>
    pkg
        ? {
            docs: Sip.docs(pkg),
            format: Sip.format(pkg),
            test: Sip.test(pkg),
            compile: Sip.compile(pkg),
            build: Sip.build(pkg),
            develop: Sip.develop(pkg)
        }
        : {}

/*:: 
type Package = {
  repository: string,
  directory: string,
  registry: string,
  scope: string
} 
*/

/**
 * You're gonna be growing out your monorepo, why not lean on Sip to at least create the files for each new package.
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
 */
export const init = (pkg /*: Package */) => () => {
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
                name: `@${pkg.scope}/${prompt.name}`,
                repository: {
                    type: "git",
                    url: pkg.repository,
                    directory: `${dirname(pkg.directory)}/${prompt.name}`
                },
                keywords: prompt.keywords.split(",").map(keyword => keyword.trim()),
                main: "dist",
                files: ["lib", "dist"]
            })
        )
        .then(meta => {
            const dir = resolve(meta.repository.directory)
            return stat(dir)
                .then(stat => {
                    throw new Error(`Oh no. ${meta.name} already exists! (${dir})`)
                })
                .catch(e => { })
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
                .then(() => console.log(`🐣   ${meta.name} has been created!`))
        })
}
