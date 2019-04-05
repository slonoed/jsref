/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict'

import {
  Connection,
  CodeActionParams,
  ExecuteCommandParams,
  Command,
  TextDocuments,
  createConnection,
  ProposedFeatures,
} from 'vscode-languageserver'
import FixerService from './fixer-service'
import {Logger, createConnectionLogger, createFileLogger} from './logger'
import * as Inspector from './inspector'
import * as minimist from 'minimist'

const argv: minimist.ParsedArgs = minimist(process.argv.slice(2))

function createLspConnection(): Connection {
  if (argv.stdio && argv.lspi) {
    const {input, output} = Inspector.connect(process.stdin, process.stdout)
    return createConnection(input, output)
  } else {
    return createConnection(ProposedFeatures.all)
  }
}

function createLogger(connection: Connection): Logger {
  if (argv.log) {
    return createFileLogger(argv.log)
  } else {
    return createConnectionLogger(connection)
  }
}

export function create() {
  const connection = createLspConnection()
  const logger = createLogger(connection)

  const documents = new TextDocuments()
  documents.listen(connection)
  const fixerService = new FixerService(documents, logger)

  connection.onInitialize(onInitialize)
  connection.listen()

  // Handlers

  async function onInitialize() {
    await fixerService.start()

    // handle trace
    connection.onCodeAction(onCodeAction)
    connection.onExecuteCommand(onExecuteCommand)

    return {
      capabilities: {
        textDocumentSync: documents.syncKind,
        codeActionProvider: true,
        executeCommandProvider: {
          commands: fixerService.getAvailableCommands(),
        },
      },
    }
  }

  function onCodeAction(params: CodeActionParams): Command[] {
    try {
      return fixerService.suggestCodeActions(params)
    } catch (e) {
      logger.error('onCodeAction error: ' + e.message + ' :: ' + e.stack)
      return []
    }
  }

  async function onExecuteCommand(params: ExecuteCommandParams) {
    try {
      const edit = fixerService.createEdit(params)
      await connection.workspace.applyEdit(edit)
    } catch (e) {
      logger.error('Error creating edit. ' + e.message + '\n' + e.stack)
    }
  }
}
