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

    const node = Ast.findLastNode(
      ast,
      j.ConditionalExpression,
      n => n.loc !== null && Range.isInside(params.selection, n.loc)
    )

    if (!node || !node.loc) {
      return null
    }

    return {
      title: `Flip ternary`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.ConditionalExpression, n => Ast.isOnPosition(n, data))
    if (!node) {
      return null
    }

    const consequent = node.consequent
    const alternate = node.alternate
    const test = Ast.negateExpression(j, node.test)
    const newNode = j.conditionalExpression(test, alternate, consequent)

    return Patch.replaceNode(j, node, newNode)
  },
}

export default fixer
