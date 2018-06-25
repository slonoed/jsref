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
    this.type = 'require_to_import'
    this.ds = opts.documentStorage
    this.ast = opts.astHelper
    this.logger = getLogger(this.type)
  }

  suggestCommands(location: ILocation): ICommand[] {
    const code = this.ds.get(location.uri)
    const nodes = this.ast.findNodes(code, location)
    const node = nodes.find(n => n.type === 'CallExpression' && n.callee.name === 'require')

    if (node) {
      return [
        {
          title: 'Convert to import',
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
    const node = nodes.find(n => n.type === 'CallExpression' && n.callee.name === 'require')

    if (node) {
      const index = nodes.indexOf(node)
      const parent = nodes[index + 1]
      if (!t.isVariableDeclarator(parent)) {
        return null
      }
      const declaration = nodes[index + 2]
      if (!t.isVariableDeclaration(declaration)) {
        return null
      }

      const name = parent.id

      // babel-template throws an Error when trying to parse module with templated value
      const template = `import NAME from '${node.arguments[0].value}'`
      const args: {[string]: Node} = {NAME: name}

      const newCode = this.ast.replaceNode(declaration, code, template, args)

      return createReplacementEdit(location.uri, declaration, newCode)
    }
  }
}
