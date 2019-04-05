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

    const collection = ast.find(
      j.ArrowFunctionExpression,
      (n: jscodeshift.ArrowFunctionExpression) => {
        return Range.isInside(params.selection, n.loc) && j.Expression.check(n.body)
      }
    )

    if (collection.size() !== 1) {
      return null
    }

    const node = collection.nodes()[0]

    return {
      title: `Use explicit return`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.ArrowFunctionExpression, n => Ast.isOnPosition(n, data))

    const body = node.body
    if (j.BlockStatement.check(body)) {
      return null
    }

    const newNode = j.blockStatement([j.returnStatement(body)])

    return Patch.replaceNode(j, body, newNode)
  },
}

export default fixer