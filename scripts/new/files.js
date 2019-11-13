export default {
  "package.json": ({ name, description }) =>
    JSON.stringify(
      {
        name: `@talon/${name}`,
        version: "1.0.0",
        description,
        homepage: `https://github.com/talon/javascript-registry/packages/${name}#readme`,
        main: "dist/index.js",
        directories: {
          lib: "lib"
        },
        author: "Talon Poole",
        license: "MIT",
        scripts: {
          format: "prettier --write **/*.js",
          docs: "documentation readme lib/**/*.js -f md --section API",
          test: "jest",
          build: "rm -rf dist && babel lib --ignore '**/*.test.js' -d dist",
          watch: "nodemon --exec babel-node lib/index.js"
        },
        publishConfig: {
          registry: "https://npm.pkg.github.com"
        },
        repository: {
          type: "git",
          url: "ssh://git@github.com/talon/javascript-registry.git"
        },
        bugs: {
          url: "https://github.com/talon/javascript-registry/issues"
        },
        babel: {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  node: true
                }
              }
            ]
          ]
        }
      },
      null,
      2
    ),

  "README.md": ({
    name,
    description
  }) => `# [@talon/${name}](https://github.com/talon/javascript-registry/packages/${name})
> ${description}

# API
`,
  "lib/index.js": ({ name, description }) => ` /**
  * ${description}
  */
export default () => {}
`
};
