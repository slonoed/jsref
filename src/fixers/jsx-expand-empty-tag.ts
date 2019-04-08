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

    const node = Ast.findFirstNode(ast, j.JSXElement, n => {
      return (
        !!n.loc &&
        Range.isInside(params.selection, n.loc) &&
        n.closingElement === null &&
        n.openingElement.selfClosing === true
      )
    })

    if (!node || !node.loc) {
      return null
    }

    const tagNameNode = node.openingElement.name
    const tagName = j.JSXIdentifier.check(tagNameNode) ? tagNameNode.name : 'tag'

    return {
      title: `Expand ${tagName}`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findFirstNode(ast, j.JSXElement, n => Ast.isOnPosition(n, data))
    if (!node) {
      return null
    }

    const newNode = Ast.cloneNode(j, node)
    if (!newNode) {
      return null
    }

    newNode.closingElement = j.jsxClosingElement(node.openingElement.name)
    newNode.openingElement.selfClosing = false

    return Patch.replaceNode(j, node, newNode)
  },
}

export default fixer
