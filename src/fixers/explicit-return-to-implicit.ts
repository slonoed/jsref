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
        if (
          Range.isInside(params.selection, n.loc) &&
          j.BlockStatement.check(n.body) &&
          n.body.body.length === 1
        ) {
          const retSt = n.body.body[0]
          if (j.ReturnStatement.check(retSt) && retSt.argument) {
            return true
          }
        }
        return false
      }
    )

    if (collection.size() !== 1) {
      return null
    }

    const node = collection.nodes()[0]

    return {
      title: `Use implicit return`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.ArrowFunctionExpression, n => Ast.isOnPosition(n, data))

    if (!j.BlockStatement.check(node.body)) {
      return null
    }

    const retSt = node.body.body[0]

    if (!j.ReturnStatement.check(retSt)) {
      return null
    }

    return Patch.replaceNode(j, node.body, retSt.argument)
  },
}

export default fixer
