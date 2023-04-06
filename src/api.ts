/*
 * This module contains all kind of helpers need to write fixers.
 * These functions will be passed as part of input to fixer
 */

import { File, Node, JSCodeshift, Printable, ASTNode } from 'jscodeshift'
import { Position, TextEdit } from 'vscode-languageserver-types'
import { Collection } from 'jscodeshift/src/Collection'
import { Type } from 'ast-types/lib/types'

type NodeReplacementItem = ASTNode | string
type NodeReplacement = NodeReplacementItem | NodeReplacementItem[]
type Filter<T> = (value: T) => boolean

export function findNodeAtPosition(ast: Collection<File>, position: Position): Collection<any> {
  function isPositionInsideNode(node: any): boolean {
    const start = node.loc.start
    const end = node.loc.end

    return (
      (start.line - 1 < position.line ||
        (start.line - 1 === position.line && start.column <= position.character)) &&
      (end.line - 1 > position.line ||
        (end.line - 1 === position.line && end.column >= position.character))
    )
  }

  return ast
    .find(Node, (node) => {
      return isPositionInsideNode(node)
    })
    .at(-1)
}

export default class Api {
  j: JSCodeshift
  target: Collection<any>

  constructor(j: JSCodeshift, target: Collection<any>) {
    this.j = j
    this.target = target
  }

  closestNode<T>(type: Type<T>, filter?: Filter<T>): T | null {
    const targetMatched = this.target.isOfType(type)
    if (targetMatched) {
      const node = this.target.nodes()[0]
      if (!filter || filter?.(node)) {
        return node
      }
    }

    return this.target.closest(type, filter).nodes()[0]
  }

  replaceNode(oldNode: Printable, newNode: NodeReplacement): TextEdit {
    const j = this.j
    const { loc } = oldNode
    if (!loc) {
      throw new Error('old node should have location')
    }

    const newNodes = Array.isArray(newNode) ? newNode : [newNode]

    const newCode = newNodes.map((n) => (typeof n === 'string' ? n : j(n).toSource())).join('')

    return {
      range: {
        start: astPositionToServerPosition(loc.start),
        end: astPositionToServerPosition(loc.end),
      },
      newText: newCode,
    }
  }

  // Negate expression (ex: == to !=)
  negateExpression(expr: any) {
    const j = this.j
    // 1. !a => a
    if (j.UnaryExpression.check(expr) && expr.operator === '!') {
      return expr.argument
    }

    // 2. invert binary operators
    const operatorMap: {
      [operator: string]: string | undefined
    } = {
      '<': '>=',
      '>': '<=',
      '>=': '<',
      '<=': '>',
      '!=': '==',
      '==': '!=',
      '!==': '===',
      '===': '!==',
    }
    if (j.BinaryExpression.check(expr) && operatorMap[expr.operator]) {
      expr.operator = operatorMap[expr.operator] as any
      return expr
    }

    // Fallback: a => !a
    return j.unaryExpression('!', expr as any, true)
  }
}

function astPositionToServerPosition(p: any): Position {
  return {
    line: p.line - 1,
    character: p.column,
  }
}
