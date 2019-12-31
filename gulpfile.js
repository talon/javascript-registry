// TODO: You're supposed to be able to call this file gulpfile.babel.js and get the same result
//       which appears to currently not work with Lerna.
require("@babel/register")({
    rootMode: "upward"
})

const Mono = require("./packages/sip/lib/mono.js")
const { resolve } = require("path")
const meta = require("./package.json")

exports.init = Mono.init({
    repository: meta.repository.url,
    directory: meta.workspaces[0],
    registry: "https://npm.pkg.github.com",
    scope: "talon"
})

Object.assign(exports, Mono.tasks(process.env.LERNA_PACKAGE_NAME ? `${__dirname}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}` : false))
