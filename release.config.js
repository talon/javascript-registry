module.export = () => ({
    "release": {
        "extends": ["semantic-release-monorepo"]
    },
    "plugins": [
        ["@semantic-release/npm", {
            "pkgRoot": `${__dirname}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}`
        }],
        ["@semantic-release/git", {
            "assets": `${__dirname}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}/**`
        }]
    ]
})