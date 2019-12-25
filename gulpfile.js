// TODO: You're supposed to be able to call this file gulpfile.babel.js and get the same result
//       which appears to currently not work with Lerna.
require("@babel/register")({
    rootMode: "upward"
})

const Sip = require("./packages/sip/lib")
const { resolve } = require("path")

exports.init = Sip.init({
    repository: require("./package.json").repository.url,
    directory: "packages",
    registry: "https://npm.pkg.github.com",
    scope: "talon"
})

const PACKAGE = process.env.LERNA_PACKAGE_NAME ? `${process.env.LERNA_ROOT_PATH}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}` : false
if (PACKAGE) {
    exports.docs = Sip.docs(PACKAGE)
    exports.format = Sip.format(PACKAGE)
    exports.test = Sip.test(PACKAGE)
    exports.compile = Sip.compile(PACKAGE)
    exports.build = Sip.build(PACKAGE)
    exports.develop = Sip.develop(PACKAGE)
}
