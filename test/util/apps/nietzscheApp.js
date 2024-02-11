#!/usr/bin/env node

const program = require('commander/typings')

program.parse(process.argv)

program
  .version('1.0.0')
  .command('quote')
  .option('-z, --Zarathustra', 'Quote from " Thus Spoke Zarathustra"')
  .option('-f, --file [path]', 'Output to file')
  .action(function (cmd) {
    const Zarathustra = cmd.Zarathustra
    if (Zarathustra) {
      output(
        `When Zarathustra was thirty years old, he left his home and the lake of his home, and went into the mountains.`,
      )
    }
  })

function output(text) {
  console.log(text)
}

program.parse(process.argv)
