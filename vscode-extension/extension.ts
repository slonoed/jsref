import * as path from 'path'
import {ExtensionContext} from 'vscode'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient'

const languages = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']

let client: LanguageClient

export function activate(context: ExtensionContext) {
  let serverModule = path.join(__dirname, './node_modules/@slonoed/jsref/src/bin.js')
  let debugOptions = {execArgv: ['--nolazy', '--inspect=6009']}

  let serverOptions: ServerOptions = {
    run: {module: serverModule, transport: TransportKind.stdio, args: ['--stdio']},
    debug: {
      module: serverModule,
      args: ['--stdio', '--debug'],
      transport: TransportKind.stdio,
      options: debugOptions,
    },
  }

  let clientOptions: LanguageClientOptions = {
    documentSelector: languages.map(language => ({scheme: 'file', language})),
  }

  client = new LanguageClient(
    'slonoed_jsref',
    'JavaScript refactoring language server',
    serverOptions,
    clientOptions
  )

  client.start()
}

export function deactivate(): Thenable<void> {
  if (!client) {
    return undefined
  }
  return client.stop()
}
