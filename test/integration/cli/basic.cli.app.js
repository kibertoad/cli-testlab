const program = require('commander');

program
  .version('1.0.0')
  .command('error <message>')
  .description('Throw given error')
  .action(message => {
    throw new Error(message);
  })
  .command('message <message>')
  .description('Print given message')
  .action(message => {
    console.log(message);
    process.exit(0);
  });

program.parse(process.argv);
