#!/usr/bin/env node
// @flow weak

import yargs from 'yargs'

import connectionFromOptions from '../utils/connectionFromOptions'
import initializeLogging from '../initializeLogging'
import Server from '../server'

const cli = yargs
  .usage('JavaScript refactoring Language Service Command-Line Interface.\nUsage: $0 [args]')
  .help('h')
  .alias('h', 'help')
  .option('node-ipc', {
    describe:
      'Use node-ipc to communicate with the server. Useful for calling from a node.js client',
    type: 'string',
  })
  .option('stdio', {
    describe: 'Use stdio to communicate with the server',
    type: 'string',
  })
  .option('pipe', {
    describe: 'Use a pipe (with a name like --pipe=/tmp/named-pipe) to communicate with the server',
    type: 'string',
  })
  .option('socket', {
    describe: 'Use a socket (with a port number like --socket=5051) to communicate with the server',
    type: 'number',
  })

const argv = cli.argv
const methods = ['node-ipc', 'stdio', 'pipe', 'socket']

cliInvariant(
  methods.filter(m => argv[m] != null).length === 1,
  'jsref requires exactly one valid connection option (node-ipc, stdio, pipe, or socket).'
)
const method = methods.find(m => argv[m] != null) || 'unknown'

let port
if (method === 'socket') {
  cliInvariant(argv.socket, '--socket option requires port.')
  port = argv.socket
}

const connection = connectionFromOptions(method, port)
initializeLogging(connection)

const server = new Server(connection)

// Exit the process when stream closes from remote end.
process.stdin.on('close', () => {
  process.exit(0)
})

function cliInvariant(condition, ...msgs) {
  if (!condition) {
    /* eslint-disable no-console */
    console.error('ERROR:', ...msgs)
    console.error()
    /* eslint-enable */
    cli.showHelp()
    process.exit(1)
  }
}
