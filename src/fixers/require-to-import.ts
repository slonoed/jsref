import {TextEdit} from 'vscode-languageserver'
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
        j.Identifier.check(n.callee) &&
        n.callee.name === 'require' &&
        !!n.loc &&
        Range.isInside(params.selection, n.loc)
    )

    if (!node || !node.loc) {
      return null
    }

    return {
      title: 'Convert require to ES import',
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const collection = Ast.find(ast, j.CallExpression, n => Ast.isOnPosition(n, data))

    const fnode = Ast.firstNode(collection)
    if (!fnode) {
      return null
    }
    const arg = fnode.arguments[0]
    const importPath = j.Literal.check(arg) ? arg.value : 'unknown'

    const vd = collection.closest(j.VariableDeclaration)
    if (vd.size() === 1) {
      const vnode = Ast.firstNode(vd)
      if (!vnode) {
        return null
      }
      const pc = collection.closest(j.VariableDeclarator)
      if (pc.size()) {
        const p = Ast.firstNode(pc)
        if (p && j.Identifier.check(p.id)) {
          const importVar = p.id.name
          const decl = j.importDeclaration(
            [j.importDefaultSpecifier(j.identifier(importVar))],
            j.literal(importPath),
            'value'
          )
          return Patch.replaceNode(j, vnode, decl)
        }
      }
    }

    const source = j.literal(importPath)
    const declaration = j.importDeclaration([], source)

    return Patch.replaceNode(j, fnode, declaration)
  },
}

export default fixer
