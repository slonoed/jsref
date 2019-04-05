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
    const source = this.documents.get(uri).getText()
    try {
      return j(source)
    } catch (e) {
      // TODO send debug level message
      this.logger.log(e.message)
      return null
    }
  }

  getCodeShift(uri: string): jscodeshift.JSCodeshift {
    // TODO handle differenct land ids
    const document = this.documents.get(uri)
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
