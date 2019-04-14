/*
Extension for debug. Sends logs to LSP Inspector
*/
const path = require('path')
const {commands} = require('vscode')
const {LanguageClient, TransportKind} = require('vscode-languageclient')

const languages = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']

let client

module.exports.activate = function activate(context) {
  let serverModule = path.join(__dirname, '../../bin/jsref.js')
  let debugOptions = {execArgv: ['--nolazy', '--inspect=6009']}

  let serverOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.stdio,
      args: ['--stdio', '--debug', '--lspi'],
    },
    debug: {
      module: serverModule,
      args: ['--stdio', '--debug', '--lspi'],
      transport: TransportKind.stdio,
      options: debugOptions,
    },
  }

  let clientOptions = {
    documentSelector: languages.map(language => ({scheme: 'file', language})),
    synchronize: {},
  }

  client = new LanguageClient('jsrefdev', 'jsref dev extension', serverOptions, clientOptions)

  // Handle manual server restart
  commands.registerCommand('jsrefdev.restart', async () => {
    await client.stop()
    console.log('Server restarted')
    client.start()
  })

  client.start()
}

module.exports.deactivate = function deactivate() {
  if (!client) {
    return undefined
  }
  return client.stop()
}
