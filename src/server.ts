import {
  createConnection,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
  TextDocuments,
  TextDocumentSyncKind,
  CodeActionParams,
  CodeAction,
  Connection,
  ExecuteCommandParams,
  ApplyWorkspaceEditParams,
} from 'vscode-languageserver/node'
import fs from 'fs/promises'

import { TextDocument } from 'vscode-languageserver-textdocument'
import CombinedLogger from './combined-logger'
import ActionManager from './action-manager'
import { Loader, Logger } from './types'
import FixerStore from './fixer-store'
import InternalLoader from './loaders/internal-loader'
import FolderLoader from './loaders/folder-loader'
import { expandTilde } from './utils'
import AstService from './ast-service'
import PackagesLoader from './loaders/packages-loader'

type Options = {
  folders: string[]
}

export default class Server {
  connection: Connection
  logger: Logger
  actionManager: ActionManager

  static async start() {
    let server: Server
    const connection = createConnection(ProposedFeatures.all)
    connection.onInitialize(async (params) => {
      server = await Server.create(connection, params)
      return server.getInitializationData(params)
    })
    connection.onExit(() => {
      if (server) {
        server.dispose()
      }
    })
    connection.listen()
  }

  private static async create(connection: Connection, params: InitializeParams) {
    const options = await createOptions(params)
    const documents = new TextDocuments(TextDocument)
    documents.listen(connection)
    const logger = new CombinedLogger(console, connection.console)

    const loaders: Loader[] = options.folders.map((f) => new FolderLoader(logger, f))
    loaders.push(new InternalLoader(logger))
    loaders.push(new PackagesLoader(logger))

    const store = new FixerStore(logger, loaders)
    // TODO use factory
    await store.init()
    const astService = new AstService(logger, documents)
    const actionManager = new ActionManager(store, logger, astService)

    const server = new Server(logger, connection, actionManager)
    return server
  }

  private constructor(logger: Logger, connection: Connection, actionManager: ActionManager) {
    this.logger = logger
    this.connection = connection
    this.actionManager = actionManager
    this.connection.onCodeAction((p) => this.handleCodeAction(p))
    this.connection.onExecuteCommand((p) => this.handleExecuteCommand(p))
  }

  dispose() {
    this.connection.dispose()
  }

  getInitializationData(params: InitializeParams): InitializeResult {
    this.logger.info('on get options')
    this.logger.info(params as any)

    return {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        codeActionProvider: true,
        executeCommandProvider: {
          commands: ['test'],
        },
      },
    }
  }

  handleCodeAction(p: CodeActionParams): CodeAction[] {
    this.logger.info(p as any)
    return this.actionManager.suggestCodeActions(p)
  }

  async handleExecuteCommand(params: ExecuteCommandParams) {
    let edit: ApplyWorkspaceEditParams | null = null
    try {
      edit = await this.actionManager.createEdit(params)
    } catch (e) {
      this.connection?.window.showErrorMessage(`Error preparing edit: ${e}`)
      return
    }

    if (!edit) {
      this.connection?.window.showInformationMessage('No changes to apply')
      return
    }

    this.logger.info('applying edit: ' + JSON.stringify(edit))
    const result = await this.connection?.workspace.applyEdit(edit)
    if (result) {
      if (!result.applied) {
        this.logger.error(`Client did not apply result because ${result.failureReason}`)
      }
    } else {
      this.logger.error('Empty result when applying edit')
    }
  }
}

/**
 * Convert client options (from config) to internal valid data.
 * If client options are incorrect then skip
 *
 */
async function createOptions(params: InitializeParams): Promise<Options> {
  const input = params.initializationOptions

  const folders: string[] = []
  if (Array.isArray(input?.folders)) {
    for (const folder of input.folders) {
      try {
        // TODO also handle relative to root path
        const absPath = expandTilde(folder)
        const stat = await fs.stat(absPath)
        if (stat.isDirectory()) {
          folders.push(absPath)
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  return {
    folders,
  }
}
