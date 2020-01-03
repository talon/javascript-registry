// TODO: You're supposed to be able to call this file gulpfile.babel.js and get the same result
//       which appears to currently not work with Lerna.
require("@babel/register")({
    rootMode: "upward"
})

const Sip = require("./packages/sip/lib")
// @ts-ignore
const meta = require("./package.json")

Object.assign(exports, Sip.setup(`${__dirname}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}`))
