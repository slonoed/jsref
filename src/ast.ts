import {Collection} from 'jscodeshift/src/Collection'
import {Type} from 'recast'
import {File} from './types'
import * as Position from './pos'
import * as jscodeshift from 'jscodeshift'
import {ExpressionKind} from 'ast-types/gen/kinds'

export function firstNode<TNode>(c: Collection<TNode>): null | TNode {
  return c.nodes()[0] || null
}

export function find<T>(
  ast: Collection<File>,
  type: Type<T>,
  filter: (n: T) => boolean
): Collection<T> {
  return ast.find(type, filter)
}

export function findFirstNode<T>(
  ast: Collection<File>,
  type: Type<T>,
  filter: (n: T) => boolean
): T | null {
  const coll = ast.find(type, filter)
  return firstNode(coll)
}

export function findLastNode<T>(
  ast: Collection<File>,
  type: Type<T>,
  filter: (n: T) => boolean
): T | null {
  const coll = ast.find(type, filter)
  const nodes = coll.nodes()
  return nodes[nodes.length - 1] || null
}

export function cloneNode<T>(j: jscodeshift.JSCodeshift, node: T): T {
  return j(node as any).nodes()[0] as T
}

export function isOnPosition(n: jscodeshift.Printable, pos: Position.t) {
  return n.loc.start.line === pos.line && n.loc.start.column === pos.column
}
export function negateExpression(j: jscodeshift.JSCodeshift, expr: ExpressionKind) {
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
  return j.unaryExpression('!', expr, true)
}
