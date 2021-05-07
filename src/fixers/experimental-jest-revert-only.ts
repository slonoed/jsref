import {Fixer} from '../types'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'

type Data = {position: Position.t; functionName: string}

const fixer: Fixer<Data> = {
  suggestCodeAction(params) {
    const {j, ast} = params

    const node = Ast.findFirstNode(ast, j.CallExpression, n => {
      return (
        n.loc !== null &&
        Range.isInside(params.selection, n.loc) &&
        j.MemberExpression.check(n.callee) &&
        j.Identifier.check(n.callee.object) &&
        (n.callee.object.name === 'it' || n.callee.object.name === 'test') &&
        j.Identifier.check(n.callee.property) &&
        n.callee.property.name === 'only'
      )
    })
    if (
      !node ||
      !node.loc ||
      !j.MemberExpression.check(node.callee) ||
      !j.Identifier.check(node.callee.object)
    ) {
      return null
    }

    const functionName = node.callee.object.name

    return {
      title: `Remove "only"`,
      data: {
        position: node.loc.start,
        functionName,
      },
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.CallExpression, n => Ast.isOnPosition(n, data.position))

    if (!node) {
      return null
    }

    const id = node.callee
    const newNode = j.identifier(data.functionName)

    return Patch.replaceNode(j, id, newNode)
  },
}

export default fixer
