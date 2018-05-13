// @flow

import type {Node} from 'babylon-types'
import type {ICommand, ILocation, IPosition} from 'vscode-languageserver-types'
import type {Logger} from 'log4js'
import type {Fixer, FixerOptions} from '../types'
import type DocumentStorage from '../document-storage'
import type AstHelper from '../ast-helper'

import {getLogger} from 'log4js'

export default class ExplicitReturnToImplicit implements Fixer {
  type: string
  ds: DocumentStorage
  ast: AstHelper
  logger: Logger

  constructor(opts: FixerOptions) {
    this.type = 'explicit_return_to_implicit'
    this.ds = opts.documentStorage
    this.ast = opts.astHelper
    this.logger = getLogger(this.type)
  }

  suggestCommands(location: ILocation): ICommand[] {
    const code = this.ds.get(location.uri)
    const nodes = this.ast.findNodes(code, location)
    const node = nodes.find(n => n.type === 'ArrowFunctionExpression')
    if (
      node &&
      node.body.type === 'BlockStatement' &&
      node.body.body.length === 1 &&
      node.body.body[0].type === 'ReturnStatement'
    ) {
      return [
        {
          title: 'Use implicit return',
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
      const {
        loc: {start, end},
      } = node

      let template
      let args
      template = `() => EXP`
      args = {
        EXP: node.body.body[0].argument,
      }

      const newCode = this.ast.replaceNode(node, code, template, args)

      return {
        changes: {
          [location.uri]: [
            {
              range: {
                start: this.ast.locToPos(start),
                end: this.ast.locToPos(end),
              },
              newText: newCode,
            },
          ],
        },
      }
    }
  }
}
