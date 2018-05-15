// @flow
import type {Fixer} from '../../types'

import {getLogger} from 'log4js'

import DocumentStorage from '../../document-storage'
import AstHelper from '../../ast-helper'
import ImplicitReturnToExplicit from '../implicit-return-to-explicit'
import {createMock} from './utils'

const mock = createMock(ImplicitReturnToExplicit)

test('should suggest fix', () => {
  const code = `const foo = () => 1`
  const commands = mock.suggest(code, 0, 15)

  expect(commands.length).toBe(1)
  expect(commands[0].command).toBe('implicit_return_to_explicit')
  expect(commands[0].title).toMatch('Use explicit return')
})

test('should not suggest fix if arrow has block', () => {
  const code = `const foo = () => { return 1 }`
  const commands = mock.suggest(code, 0, 15)

  expect(commands.length).toBe(0)
})

test('should create body with return', () => {
  const code = `const foo = () => 1;`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `() => {
  return 1
}`

  const change = Object.values(edit.changes)[0]
  expect(change).toEqual([
    {
      newText: expected,
      range: {start: {line: 0, character: 12}, end: {line: 0, character: 19}},
    },
  ])
})

test('should work inside expression', () => {
  const code = `console.log(() => 1);`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `() => {
  return 1
}`

  const change = Object.values(edit.changes)[0]
  expect(change).toEqual([
    {
      newText: expected,
      range: {start: {line: 0, character: 12}, end: {line: 0, character: 19}},
    },
  ])
})
