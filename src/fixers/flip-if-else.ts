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
      j.IfStatement,
      n => n.loc !== null && Range.isInside(params.selection, n.loc)
    )

    if (!node || !node.loc) {
      return null
    }

    return {
      title: `Flip if-else`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.IfStatement, n => Ast.isOnPosition(n, data))
    if (!node) {
      return null
    }

    const consequent = node.consequent
    let alternate = node.alternate
    if (!alternate) {
      const empty = j.emptyStatement()
      const comment = j.commentLine(' do nothing')
      empty.comments = [comment]
      alternate = j.blockStatement([empty])
    }
    const test = Ast.negateExpression(j, node.test)
    const newNode = j.ifStatement(test, alternate, consequent)

    return Patch.replaceNode(j, node, newNode)
  },
}

export default fixer
