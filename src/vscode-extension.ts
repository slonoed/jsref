import * as path from 'path'
import { ExtensionContext } from 'vscode'

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node'

const languages = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']

let client: LanguageClient

export async function activate(_: ExtensionContext) {
  let serverModule = path.join(__dirname, './run.js')
  let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] }

  let serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      args: ['--debug', '--inspect=6009'],
      transport: TransportKind.ipc,
      options: debugOptions,
    },
    debug: {
      module: serverModule,
      args: ['--debug', '--inspect=6009'],
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  }
  serverOptions.run = serverOptions.debug

  let clientOptions: LanguageClientOptions = {
    documentSelector: languages.map((language) => ({ scheme: 'file', language })),
  }

  client = new LanguageClient(
    'slonoed_jsref',
    'JavaScript refactoring language server',
    serverOptions,
    clientOptions,
    true
  )

  await client.start()
}

export function deactivate(): Thenable<void> {
  if (!client) {
    return Promise.resolve()
  }
  return client.stop()
}
