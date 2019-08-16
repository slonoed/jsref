import {Fixer} from '../types'
import * as jscodeshift from 'jscodeshift'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'
import {ExpressionKind} from 'ast-types/gen/kinds'

type Data = Position.t

const fixer: Fixer<Data> = {
  suggestCodeAction(params) {
    const {j, ast} = params

    const node = Ast.findFirstNode(
      ast,
      j.TemplateLiteral,
      n => n.loc !== null && Range.isInside(params.selection, n.loc)
    )

    if (!node || !node.loc) {
      return null
    }

    return {
      title: `Convert to regular string`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.TemplateLiteral, n => Ast.isOnPosition(n, data))
    if (!node) {
      return null
    }

    const expressions: ExpressionKind[] = []
    const firstStrValue = node.quasis[0].value.cooked
    if (firstStrValue) {
      expressions.push(j.stringLiteral(firstStrValue))
    }
    for (let i = 0; i < node.expressions.length; i++) {
      const expr = node.expressions[i]
      expressions.push(expr)
      const strValue = node.quasis[i + 1].value.cooked
      if (strValue) {
        expressions.push(j.stringLiteral(strValue))
      }
    }

    if (expressions.length === 0) {
      expressions.push(j.stringLiteral(firstStrValue))
    }

    function combineExpressions(rightIndex: number): ExpressionKind {
      if (rightIndex === 0) {
        return expressions[0]
      }
      return j.binaryExpression('+', combineExpressions(rightIndex - 1), expressions[rightIndex])
    }

    const combinedExpr = combineExpressions(expressions.length - 1)
    return Patch.replaceNode(j, node, combinedExpr)
  },
}

export default fixer
