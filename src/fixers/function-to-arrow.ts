import {Fixer} from '../types'
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
      j.FunctionExpression,
      n => n.loc !== null && Range.isInside(params.selection, n.loc)
    )

    if (!node || !node.loc) {
      return null
    }

    if (j(node).find(j.ThisExpression).length) {
      return null
    }

    return {
      title: `Convert to arrow function`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const func = Ast.findFirstNode(ast, j.FunctionExpression, n => Ast.isOnPosition(n, data))
    if (!func) {
      return null
    }
    const node = j.arrowFunctionExpression(func.params, func.body, false)

    return Patch.replaceNode(j, func, node)
  },
}

export default fixer
