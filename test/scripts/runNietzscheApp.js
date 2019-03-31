const { runNodeCLIApp } = require('../../index');

function runQuote() {
  runNodeCLIApp('../apps/nietzscheApp', ['quote', '-z']);
}

runQuote();
