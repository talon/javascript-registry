const Sip = require("./packages/sip")
const PACKAGE = `${process.env.LERNA_ROOT_PATH}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}`

exports.docs = Sip.docs(PACKAGE)
exports.format = Sip.format(PACKAGE)
exports.test = Sip.test(PACKAGE)
exports.compile = Sip.compile(PACKAGE)
exports.build = Sip.build(PACKAGE)
exports.develop = Sip.develop(PACKAGE)
