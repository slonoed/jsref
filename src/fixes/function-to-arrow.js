// @flow

import type {Node} from 'babylon-types'
import type {ICommand, ILocation, IPosition} from 'vscode-languageserver-types'
import type {Logger} from 'log4js'
import type {Fixer, FixerOptions} from '../types'
import type DocumentStorage from '../document-storage'
import type AstHelper from '../ast-helper'

import {getLogger} from 'log4js'

export default class FunctionToArrow implements Fixer {
  type: string
  ds: DocumentStorage
  ast: AstHelper
  logger: Logger

  constructor(opts: FixerOptions) {
    this.type = 'function_to_arrow'
    this.ds = opts.documentStorage
    this.ast = opts.astHelper
    this.logger = getLogger(this.type)
  }

  suggestCommands(location: ILocation): ICommand[] {
    const code = this.ds.get(location.uri)
    const nodes = this.ast.findNodes(code, location)
    const node = nodes.find(n => n.type === 'FunctionDeclaration')
    if (node) {
      return [
        {
          title: `Convert "${node.id.name}" to arrow function`,
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
      const {
        loc: {start, end},
      } = node

      const arrowTemplate = 'const NAME = () => BODY'
      const newCode = this.ast.replaceNode(node, code, arrowTemplate, {
        NAME: node.id,
        BODY: node.body,
      })

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
