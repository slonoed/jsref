// @flow

import type {Node} from '../babylon-types'
import type {ICommand, ILocation, IPosition} from 'vscode-languageserver-types'
import type {Logger} from 'log4js'
import type {Fixer, FixerOptions} from '../types'
import type DocumentStorage from '../document-storage'
import type AstHelper from '../ast-helper'

import * as t from 'babel-types'
import {getLogger} from 'log4js'

import {createReplacementEdit} from './utils'

const DEFAULT_NAME = 'replace_me_name'

export default class ArrowToFunction implements Fixer {
  type: string
  ds: DocumentStorage
  ast: AstHelper
  logger: Logger

  constructor(opts: FixerOptions) {
    this.type = 'arrow_to_function'
    this.ds = opts.documentStorage
    this.ast = opts.astHelper
    this.logger = getLogger(this.type)
  }

  suggestCommands(location: ILocation): ICommand[] {
    const code = this.ds.get(location.uri)
    const nodes = this.ast.findNodes(code, location)
    const node = nodes.find(n => n.type === 'ArrowFunctionExpression')
    if (node) {
      return [
        {
          title: 'Convert arrow function to regular',
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
    const node = nodes.find(n => n.type === 'ArrowFunctionExpression')

    if (node) {
      const index = nodes.indexOf(node)
      const parent = nodes[index + 1]

      const isDeclaration = parent.type === 'VariableDeclarator' && parent.init === node
      const name = isDeclaration ? parent.id : t.identifier(DEFAULT_NAME)

      const args: {[string]: Node} = {PARAMS: node.params, NAME: name}

      let template = '(function NAME(PARAMS) {'

      if (node.body.type === 'BlockStatement') {
        template += ' BODY '
        args.BODY = node.body.body
      } else {
        template += 'return BODY'
        args.BODY = node.body
      }

      template += '})'

      const nodeToReplace = isDeclaration ? nodes[index + 2] : node
      const newCode = this.ast.replaceNode(nodeToReplace, code, template, args)

      return createReplacementEdit(location.uri, nodeToReplace, newCode)
    }
  }
}
