// @flow

import type {
  InitializeParams,
  CodeActionParams,
  ExecuteCommandParams,
  DidOpenTextDocumentParams,
  DidChangeTextDocumentParams,
  DidCloseTextDocumentParams,
} from 'vscode-languageserver/lib/protocol'
import type {
  ICompletionItem,
  ITextEdit,
  ITextDocumentEdit,
  ILocation,
} from 'vscode-languageserver-types'
import type {Logger} from 'log4js'
import type {Fixer} from './types'

import path from 'path'
import {IConnection} from 'vscode-languageserver'
import {getLogger} from 'log4js'

import DocumentStorage from './document-storage'
import AstHelper from './ast-helper'
import fixersClasses from './fixes'

export default class Server {
  connection: IConnection
  logger: String
  documentStorage: DocumentStorage
  fixers: Fixer[]

  constructor(connection: IConnection) {
    this.logger = getLogger('server')
    this.connection = connection
    this.documentStorage = new DocumentStorage()

    const fixerOpts = {
      documentStorage: this.documentStorage,
      astHelper: new AstHelper(this.logger),
    }

    this.fixers = fixersClasses.map(Cls => new Cls(fixerOpts))

    this.logger.debug('Fixers active: ', this.fixers.map(f => f.type).join(', '))

    connection.onShutdown(() => {
      this.logger.debug('LSP server connection shutting down')
    })

    connection.onInitialize(() => this.onInit())

    connection.listen()
  }

  async onInit() {
    this.connection.onCodeAction(p => this.onCodeAction(p))
    this.connection.onExecuteCommand(p => this.onExecuteCommand(p))
    this.connection.onDidOpenTextDocument(p => this.onDidOpenTextDocument(p))
    this.connection.onDidChangeTextDocument(p => this.onDidChangeTextDocument(p))
    this.connection.onDidCloseTextDocument(p => this.onDidCloseTextDocument(p))

    this.logger.debug('LSP server initialized')
    const commands: string[] = this.fixers.map(f => f.type)

    return {
      capabilities: {
        codeActionProvider: true,
        executeCommandProvider: {
          commands,
        },
      },
    }
  }

  async onCodeAction(params: CodeActionParams) {
    try {
      const {range, textDocument} = params
      const {uri} = textDocument
      const location = {uri, range}

      const commands = []
      for (const fixer of this.fixers) {
        commands.push(...fixer.suggestCommands(location))
      }

      return commands
    } catch (e) {
      this.logger.error(e)
    }

    return []
  }

  async onExecuteCommand(params: ExecuteCommandParams) {
    try {
      const fixer = this.getFixerOrThrow(params.command)
      const edit = fixer.createEdit(params.arguments)
      const res = await this.connection.workspace.applyEdit(edit)

      this.logger.debug(res.applied ? 'edit applied' : 'edit not applied', edit)
    } catch (e) {
      this.logger.error(e)
    }
  }

  async onDidOpenTextDocument(params: DidOpenTextDocumentParams) {
    this.logger.trace('onDidOpenTextDocument', params)
    this.documentStorage.add(params.textDocument.uri, params.textDocument.text)
  }
  async onDidChangeTextDocument(params: DidChangeTextDocumentParams) {
    this.logger.trace('onDidChangeTextDocument', params)
    const newText = params.contentChanges[0].text
    this.documentStorage.add(params.textDocument.uri, newText)
  }
  async onDidCloseTextDocument(params: DidCloseTextDocumentParams) {
    this.logger.trace('onDidCloseTextDocument', params)
    this.documentStorage.remove(params.textDocument.uri)
  }

  getFixerOrThrow(type: string): Fixer {
    const fixer = this.fixers.find(f => f.type === type)

    if (!fixer) {
      throw new Error(`Fixer "${type}" not found`)
    }

    return fixer
  }
}
