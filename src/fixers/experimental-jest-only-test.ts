import {Fixer} from '../types'
import * as jscodeshift from 'jscodeshift'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'

type Data = Position.t

const fixer: Fixer<Data> = {
  suggestCodeAction(params) {
    const {j, ast} = params

    const node = Ast.findFirstNode(
      ast,
      j.CallExpression,
      n =>
        n.loc !== null &&
        Range.isInside(params.selection, n.loc) &&
        j.Identifier.check(n.callee) &&
        n.callee.name === 'it'
    )

    if (!node || !node.loc) {
      return null
    }

    return {
      title: `Mark test with "only"`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.CallExpression, n => Ast.isOnPosition(n, data))
    if (!node) {
      return null
    }

    const id = node.callee
    const newNode = j.memberExpression(id, j.identifier('only'))

    return Patch.replaceNode(j, id, newNode)
  },
}

export default fixer
