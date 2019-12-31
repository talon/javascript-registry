module.export = () => {
    plugins: [
        "@semantic-release/npm", {
            pkgRoot: `${__dirname}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}`
        }
    ]
}