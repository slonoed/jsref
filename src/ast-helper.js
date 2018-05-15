// @flow
import type {
  ICommand,
  ILocation,
  ITextDocumentIdentifier,
  IPosition,
  IRange,
} from 'vscode-languageserver-types'
import type {Node, File, Location} from 'babylon-types'
import type {Logger} from 'log4js'

import {parse} from 'babylon'
import babelTemplate from 'babel-template'
import babelGenerate from 'babel-generator'
import prettier from 'prettier'

import * as babelTypes from 'babel-types'

const plugins = [
  'asyncGenerators',
  'classProperties',
  'decorators',
  'doExpressions',
  'exportExtensions',
  'flow',
  'functionSent',
  'functionBind',
  'jsx',
  'objectRestSpread',
  'dynamicImport',
  'numericSeparator',
  'optionalChaining',
  'optionalCatchBinding',
]

export default class AstHelper {
  logger: Logger
  constructor(logger: Logger) {
    this.logger = logger
  }

  replaceNode(node: Node, fileContent: string, template: string, args: {[string]: string}): string {
    const tpl = babelTemplate(template)
    const ast = tpl(args)
    const replacement = babelGenerate(
      ast,
      {retainLines: true, compact: false},
      fileContent.slice(node.start, node.end)
    )

    let formatted = prettier.format(replacement.code, {
      semi: false,
      singleQuote: true,
    })

    if (ast.type === 'ExpressionStatement' && formatted.charAt(0) === ';') {
      formatted = formatted.slice(1)
    }

    return formatted.trim()
  }

  parseCode(code: string): Node {
    const ast = parse(code, {sourceType: 'module', plugins})
    return ast
  }

  findNodes(code: string, location: ILocation): Node[] {
    const ast = this.parseCode(code)
    let nodes = []
    let ancestors = []

    const walk = (node: Node) => {
      if (!node) return

      if (!this.isUnderCursor(node, location)) {
        return
      }

      ancestors.push(node)

      const subNodesKeys = babelTypes.VISITOR_KEYS[node.type] || []

      for (const key of subNodesKeys) {
        const subNodes = wrapInArray(node[key])

        for (const n of subNodes) {
          walk(n)
        }
      }
    }

    walk(ast)

    return ancestors.reverse()
  }

  isUnderCursor(node: Node, location: ILocation): boolean {
    const {start, end} = node.loc
    const position = location.range.start
    const line = position.line + 1

    if (start.line > line) {
      return false
    }

    if (start.line === line && start.column > position.character) {
      return false
    }

    if (end.line < line) {
      return false
    }

    if (end.line === line && end.column < position.character) {
      return false
    }

    return true
  }
}

function wrapInArray<T>(el: T | T[]): T[] {
  if (Array.isArray(el)) {
    return el
  }
  return [el]
}
