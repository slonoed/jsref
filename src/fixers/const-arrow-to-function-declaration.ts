import {Fixer} from '../types'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'

type Data = Position.t

const fixer: Fixer<Data> = {
  suggestCodeAction(params) {
    const {j, ast} = params

    const node = Ast.findFirstNode(ast, j.VariableDeclaration, n => {
      if (!n.loc || n.kind !== 'const' || n.declarations.length !== 1) {
        return false
      }

      const declarator = n.declarations[0]
      if (!j.VariableDeclarator.check(declarator)) {
        return false
      }

      return j.Identifier.check(declarator.id) && j.ArrowFunctionExpression.check(declarator.init)
    })

    if (!node || !node.loc) {
      return null
    }

    if (j(node).find(j.ThisExpression).length) {
      return null
    }

    return {
      title: `Convert to function declaration`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const decl = Ast.findFirstNode(ast, j.VariableDeclaration, n => Ast.isOnPosition(n, data))

    if (!decl) {
      return null
    }
    const declarator = decl.declarations[0]
    if (!j.VariableDeclarator.check(declarator)) {
      return null
    }

    const name = declarator.id
    if (!j.Identifier.check(name)) {
      return null
    }
    const init = declarator.init
    if (!j.ArrowFunctionExpression.check(init)) {
      return null
    }

    let body = init.body

    if (!j.BlockStatement.check(body)) {
      body = j.blockStatement([j.returnStatement(body)])
    }

    const node = j.functionDeclaration(name, init.params, body, init.generator)

    node.async = init.async

    return Patch.replaceNode(j, decl, node)
  },
}

export default fixer
