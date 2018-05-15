// @flow
import type {Fixer} from '../../types'

import {getLogger} from 'log4js'

import DocumentStorage from '../../document-storage'
import AstHelper from '../../ast-helper'
import ExplicitReturnToImplicit from '../explicit-return-to-implicit'
import {createMock} from './utils'

const mock = createMock(ExplicitReturnToImplicit)

test('should suggest fix', () => {
  const code = `const foo = () => { return 1; }`
  const commands = mock.suggest(code, 0, 15)

  expect(commands.length).toBe(1)
  expect(commands[0].command).toBe('explicit_return_to_implicit')
  expect(commands[0].title).toMatch('Use implicit return')
})

test('should not suggest fix if arrow already has implicit return', () => {
  const code = `const foo = () => 1`
  const commands = mock.suggest(code, 0, 15)

  expect(commands.length).toBe(0)
})

test('should not suggest fix if arrow has >1 statements', () => {
  const code = `const foo = () => {
  console.log('something')
  return 'nothing'
}`
  const commands = mock.suggest(code, 0, 15)

  expect(commands.length).toBe(0)
})

test('should not suggest fix if arrow has no return statement', () => {
  const code = `const foo = () => {
  console.log('something')
}`
  const commands = mock.suggest(code, 0, 15)

  expect(commands.length).toBe(0)
})

test('should convert body', () => {
  const code = `const foo = () => {return 1;}`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `() => 1`

  const change = Object.values(edit.changes)[0]
  expect(change).toEqual([
    {
      newText: expected,
      range: {start: {line: 0, character: 12}, end: {line: 0, character: 29}},
    },
  ])
})

test('should copy params convert body', () => {
  const code = `const foo = (a) => {return a;}`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `a => a`

  const change = Object.values(edit.changes)[0]
  expect(change).toEqual([
    {
      newText: expected,
      range: {start: {line: 0, character: 12}, end: {line: 0, character: 30}},
    },
  ])
})
