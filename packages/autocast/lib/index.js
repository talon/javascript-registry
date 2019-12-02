const { resolve } = require("path");
const { readdir, readFile } = require("fs");
const markov = require("markov");
const _ = require("highland");
const { sample } = require("lodash");

const settings = require("../settings.json");
const chain = markov(settings.order);

chain.seed(
  _(settings.use)
    .map(source => `${settings.sources}/${source}`)
    .map(resolve)
    .flatMap(source =>
      _([source])
        .flatMap(_.wrapCallback(readdir))
        .flatten()
        .map(file => `${source}/${file}`)
    )
    .map(_.wrapCallback(readFile))
    .parallel(settings.parallel)
    .map(buffer => buffer.toString("utf8"))
    .map(content => content.replace(/\n/g, "").replace(/\.\s/g, "\n"))
    .toNodeStream(),
  () =>
    [...Array(10)].forEach(() =>
      console.log(
        `${sample(settings.hosts)}:`,
        chain.respond(chain.pick()).join(" ") + "\n"
      )
    )
);
