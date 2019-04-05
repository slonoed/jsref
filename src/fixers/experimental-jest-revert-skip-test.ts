import {Fixer} from '../types'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'

type Data = Position.t

const fixer: Fixer<Data> = {
  suggestCodeAction(params) {
    const {j, ast} = params

    const node = Ast.findFirstNode(ast, j.CallExpression, n => {
      return (
        Range.isInside(params.selection, n.loc) &&
        j.MemberExpression.check(n.callee) &&
        j.Identifier.check(n.callee.object) &&
        n.callee.object.name === 'it' &&
        j.Identifier.check(n.callee.property) &&
        n.callee.property.name === 'skip'
      )
    })

    if (!node) {
      return null
    }

    return {
      title: `Enable test`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.CallExpression, n => Ast.isOnPosition(n, data))

    const id = node.callee
    const newNode = j.identifier('it')

    return Patch.replaceNode(j, id, newNode)
  },
}

export default fixer
