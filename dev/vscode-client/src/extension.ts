/*
Extension for debug. Sends logs to LSP Inspector
*/
import * as path from 'path'
import {commands, ExtensionContext, OutputChannel} from 'vscode'
import * as WebSocket from 'ws'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient'

const languages = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']

let client: LanguageClient

export function activate(context: ExtensionContext) {
  let socket = new WebSocket(`ws://localhost:7000`)
  let serverModule = path.join(__dirname, '../../../bin/jsref.js')
  let debugOptions = {execArgv: ['--nolazy', '--inspect=6009']}

  let serverOptions: ServerOptions = {
    run: {module: serverModule, transport: TransportKind.stdio, args: ['--stdio', '--debug']},
    debug: {
      module: serverModule,
      args: ['--stdio', '--debug'],
      transport: TransportKind.stdio,
      options: debugOptions,
    },
  }

  let clientOptions: LanguageClientOptions = {
    documentSelector: languages.map(language => ({scheme: 'file', language})),
    synchronize: {},
  }

  client = new LanguageClient(
    'languageServerExample',
    'Language Server Example',
    serverOptions,
    clientOptions
  )

  // Handle manual server restart
  commands.registerCommand('languageServerExample.restart', async () => {
    await client.stop()
    console.log('Server restarted')
    client.start()
  })

  client.start()
}

export function deactivate(): Thenable<void> {
  if (!client) {
    return undefined
  }
  return client.stop()
}
