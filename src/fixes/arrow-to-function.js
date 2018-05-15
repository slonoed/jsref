// @flow

import type {Node} from 'babylon-types'
import type {ICommand, ILocation, IPosition} from 'vscode-languageserver-types'
import type {Logger} from 'log4js'
import type {Fixer, FixerOptions} from '../types'
import type DocumentStorage from '../document-storage'
import type AstHelper from '../ast-helper'

import {getLogger} from 'log4js'

import {createReplacementEdit} from './utils'

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
      let template
      let args
      if (node.body.type === 'BlockStatement') {
        template = `
        function f(PARAMS) {
          BODY
        }
        `
        args = {
          BODY: node.body.body,
          PARAMS: node.params,
        }
      } else {
        template = `function f(PARAMS) { return BODY }`
        args = {
          BODY: node.body,
          PARAMS: node.params,
        }
      }

      const newCode = this.ast.replaceNode(node, code, template, args)

      return createReplacementEdit(location.uri, node, newCode)
    }
  }
}
