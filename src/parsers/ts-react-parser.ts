import * as babelParser from '@babel/parser'
import { Parser } from 'jscodeshift'

const customParser: Parser = {
  parse(source) {
    return babelParser.parse(source, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    })
  },
}

export default customParser
