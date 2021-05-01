import * as Range from './range'
import * as Position from './pos'
import {TextEdit} from 'vscode-languageserver'
import {Printable, JSCodeshift, ASTNode} from 'jscodeshift'

export type t = {
  readonly range: Range.t
  readonly newText: string
}

export function toTextEdit(patch: t): TextEdit {
  return {
    newText: patch.newText,
    range: Range.toProtocol(patch.range),
  }
}

export function replace(range: Range.t, newText: string): t {
  return {range, newText}
}

export function insert(j: JSCodeshift, position: Position.t, entries: Array<ASTNode | string>): t {
  const newText = entries.map(n => (typeof n === 'string' ? n : j(n).toSource())).join('')

  return {
    range: {start: position, end: position},
    newText,
  }
}

export function del(range: Range.t): t {
  return {range, newText: ''}
}

type NodeReplacementItem = ASTNode | string
type NodeReplacement = NodeReplacementItem | NodeReplacementItem[]

export function replaceNode(j: JSCodeshift, oldNode: Printable, newNode: NodeReplacement): t {
  const {loc} = oldNode
  if (!loc) {
    throw new Error('old node should have location')
  }

  const newNodes = Array.isArray(newNode) ? newNode : [newNode]

  const newCode = newNodes.map(n => (typeof n === 'string' ? n : j(n).toSource())).join('')

  return replace(
    Range.create(loc.start.line, loc.start.column, loc.end.line, loc.end.column),
    newCode
  )
}
