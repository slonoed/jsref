import * as path from 'path';
import { ExtensionContext, services, workspace, TransportKind, LanguageClient } from 'coc.nvim';

const languages = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'];

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('coc-jsref')
  const isEnable = config.get<boolean>('enable', true)
  if (!isEnable) {
    return
  }

  const serverModule = path.join(__dirname, './src/bin.js');
  const serverOptions = {
    module: serverModule,
    args: ['--stdio', '--log=/tmp/coclog']
  };
  const clientOptions = {
    documentSelector: languages.map((language) => ({ scheme: 'file', language })),
  };
  const client = new LanguageClient(
    'coc-jsref', // the id
    'coc-jsref', // the name of the language server
    serverOptions,
    clientOptions
  );
  context.subscriptions.push(services.registLanguageClient(client));
}
