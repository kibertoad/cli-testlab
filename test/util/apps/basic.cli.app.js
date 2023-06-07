const program = require('commander')

program.version('1.0.0')

program
  .command('error <message>')
  .description('Throw given error')
  .action((message) => {
    console.log('Will throw an error shortly.')
    throw new Error(message)
  })

program
  .command('message <message>')
  .description('Print given message')
  .action((message) => {
    console.log(message)
  })

program.parse(process.argv)
