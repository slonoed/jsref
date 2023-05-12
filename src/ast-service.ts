import { TextDocuments } from 'vscode-languageserver/node'
import { JSCodeshift, withParser } from 'jscodeshift'
import { Collection } from 'jscodeshift/src/Collection'
import { TextDocument } from 'vscode-languageserver-textdocument'

import { Logger } from './types'
import tsReactParser from './parsers/ts-react-parser'
import reactParser from './parsers/react-parser'

const csTs = withParser('ts')
const csBabylon = withParser('babylon')
const csTsReact = withParser(tsReactParser)
const csReact = withParser(reactParser)

const codeShifts: { [langId: string]: JSCodeshift } = {
  typescript: csTs,
  typescriptreact: csTsReact,
  javascript: csReact,
  javascriptreact: csReact,
}

/**
 * Parse code to AST and work as cache.
 * Uses TextDocuments to invalidate cache
 */
export default class AstService {
  logger: Logger
  asts: Map<string, any>
  documents: TextDocuments<TextDocument>

  constructor(logger: Logger, documents: TextDocuments<TextDocument>) {
    this.logger = logger
    this.documents = documents
    this.asts = new Map()

    documents.onDidChangeContent((event) => {
      this.asts.delete(event.document.uri)
    })
  }

  getAstTree(uri: string): Collection<any> | null {
    if (this.asts.has(uri)) {
      return this.asts.get(uri)
    }

    const j = this.getCodeShift(uri)
    if (!j) {
      return null
    }
    const document = this.documents.get(uri)
    if (!document) {
      return null
    }
    const source = document.getText()
    try {
      const ast = j(source)
      this.asts.set(uri, ast)
      return ast
    } catch (e) {
      // Source is broken. Always when user typing
      this.logger.warn(`source is broken for ${uri}`)
      return null
    }
  }

  getCodeShift(uri: string): JSCodeshift | null {
    const document = this.documents.get(uri)

    if (!document) {
      this.logger.error(`No document found for uri: "${uri}"`)
      return null
    }
    const langId = document.languageId

    if (!codeShifts[langId]) {
      this.logger.error(`${langId} is not supported`)
      return null
    }

    return codeShifts[langId]
  }
}
