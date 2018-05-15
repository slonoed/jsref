// @flow

import type {Node} from 'babylon-types'
import type {ICommand, ILocation, IPosition} from 'vscode-languageserver-types'
import type {Logger} from 'log4js'
import type {Fixer, FixerOptions} from '../types'
import type DocumentStorage from '../document-storage'
import type AstHelper from '../ast-helper'

import {getLogger} from 'log4js'

import {createReplacementEdit} from './utils'

function isReactImport(node: Node): boolean {
  return (
    node.type === 'ImportDeclaration' &&
    node.source &&
    node.source.type === 'StringLiteral' &&
    node.source.value === 'react'
  )
}

function hasJsxReturn(node: Node): boolean {
  const returnStatement = node.body.body.find(i => i.type === 'ReturnStatement')
  if (!returnStatement) {
    return false
  }

  if (returnStatement.argument && returnStatement.argument.type === 'JSXElement') {
    return true
  }

  return false
}

export default class ReactFunctionToClass implements Fixer {
  type: string
  ds: DocumentStorage
  ast: AstHelper
  logger: Logger

  constructor(opts: FixerOptions) {
    this.type = 'react-function-to-class'
    this.ds = opts.documentStorage
    this.ast = opts.astHelper
    this.logger = getLogger(this.type)
  }

  suggestCommands(location: ILocation): ICommand[] {
    const code = this.ds.get(location.uri)
    const ast = this.ast.parseCode(code)

    const isReactModule = ast.program.body.some(isReactImport)
    if (!isReactModule) {
      return []
    }

    const nodes = this.ast.findNodes(code, location)
    const node = nodes.find(n => n.type === 'FunctionDeclaration')
    if (node && hasJsxReturn(node)) {
      return [
        {
          title: `Convert "${node.id.name}" to React class`,
          command: this.type,
          arguments: [location],
        },
      ]
    }

    return []
  }

  createEdit(args: any[]) {
    // TODO check args
    const location: ILocation = args[0]
    const code = this.ds.get(location.uri)
    const nodes = this.ast.findNodes(code, location)
    const node = nodes.find(n => n.type === 'FunctionDeclaration')

    if (node) {
      const arrowTemplate = `class ${node.id.name} extends React.Component {
  render() {
    const PARAM = this.props
    BODY
  }
}`
      const newCode = this.ast
        .replaceNode(node, code, arrowTemplate, {
          BODY: node.body.body,
          PARAM: node.params[0],
        })
        .replace(/\n+/g, '\n')

      return createReplacementEdit(location.uri, node, newCode)
    }
  }
}
