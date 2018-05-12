// @flow

import {parse} from 'babylon'
import type {Node} from 'babylon-types'
import {getLogger} from 'log4js'

import AstHelper from '../ast-helper'

const uri = 'file://testfile'
const logger = getLogger('test')

function getNodes(code: string, line, character): Node[] {
  const ast = new AstHelper(logger)
  const pos = {line, character}
  const location = {uri, range: {start: pos, end: pos}}
  const nodes = ast.findNodes(code, location)
  return nodes
}

test('find simple let', () => {
  const nodes = getNodes('let a;', 0, 1)
  expect(nodes.length).toBe(3)
  expect(nodes[0].type).toBe('VariableDeclaration')
  expect(nodes[0].kind).toBe('let')
})

test('find let identifier', () => {
  const nodes = getNodes('let a;', 0, 4)
  expect(nodes.length).toBe(5)
  expect(nodes[0].type).toBe('Identifier')
  expect(nodes[0].name).toBe('a')
})

test('find function identifier', () => {
  const code = `function hello() {
}`

  const nodes = getNodes(code, 0, 1)
  expect(nodes[0].type).toBe('FunctionDeclaration')
})
