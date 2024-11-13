const { program } = require('commander');

program
  .requiredOption('-H, --host <host>', 'server host', 'localhost')
  .requiredOption('-p, --port <port>', 'server port', '3000')
  .requiredOption('-c, --cache <path>', 'cache directory path', './.cache')
  .parse(process.argv);

const { host, port, cache } = program.opts();
console.log(`Host: ${host}, Port: ${port}, Cache: ${cache}`);
