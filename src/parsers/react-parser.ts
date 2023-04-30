import * as babelParser from '@babel/parser'
import { Parser } from 'jscodeshift'

const customParserReact: Parser = {
  parse(source) {
    return babelParser.parse(source, {
      sourceType: 'module',
      plugins: ['jsx'],
    })
  },
}

export default customParserReact
