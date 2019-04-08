//import { File } from 'ast-types';
import {TextDocuments} from 'vscode-languageserver'
import * as jscodeshift from 'jscodeshift'
import {Collection} from 'jscodeshift/src/Collection'
import {Logger} from './logger'
// TODO add the rest
// https://github.com/facebook/jscodeshift#parser
// type LanguageId = 'javascript'

export default class AstService {
  constructor(private documents: TextDocuments, private logger: Logger) {}

  getAstTree(uri: string): Collection<any> | null {
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
      return j(source)
    } catch (e) {
      // Source is broken. Always when user typing
      return null
    }
  }

  getCodeShift(uri: string): jscodeshift.JSCodeshift | null {
    const document = this.documents.get(uri)

    if (!document) {
      this.logger.error(`No document found for uri: ${uri}`)
      return null
    }
    const langId = document.languageId

    if (langId === 'javascript' && isFlowCode(document.getText())) {
      return jscodeshift.withParser('flow')
    }

    if (langId === 'typescript') {
      return jscodeshift.withParser('ts')
    }

    if (langId === 'javascript') {
      return jscodeshift.withParser('babylon')
    }

    const errorMsg = `${langId} is not supported`
    this.logger.error(errorMsg)

    return null
  }
}

function isFlowCode(text: string): boolean {
  return /\/\/[\t\ ]*@flow/.test(text)
}
