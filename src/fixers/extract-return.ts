import {Fixer} from '../types'
import * as jscodeshift from 'jscodeshift'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'
import {emptyStatement} from '@babel/types'

type Data = Position.t

const fixer: Fixer<Data> = {
  suggestCodeAction(params) {
    const {j, ast} = params

    const node = Ast.findLastNode(
      ast,
      j.ReturnStatement,
      n => n.loc !== null && Range.isInside(params.selection, n.loc)
    )
    if (!node || !node.loc || !node.argument) {
      return null
    }

    return {
      title: `Extract return argument`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.ReturnStatement, n => Ast.isOnPosition(n, data))
    if (!node) {
      return null
    }

    const loc = node.loc
    if (!loc) {
      return null
    }

    const arg = node.argument
    if (!arg) {
      return null
    }

    const varName = 'result'

    const id = j.identifier(varName)

    const declarator = j.variableDeclarator(id, arg)
    const declaration = j.variableDeclaration('const', [declarator])

    const newNode = j.returnStatement(id)

    // Check if return has spaces on left side
    let leftPad = loc.start.column || 0
    let spaceBetweenNewNodes = '\n\n' // one empty line
    while (leftPad > 0) {
      spaceBetweenNewNodes += ' '
      leftPad--
    }

    return [Patch.replaceNode(j, node, [declaration, spaceBetweenNewNodes, newNode])]
  },
}

export default fixer
