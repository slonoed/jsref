// @flow
import type {Fixer} from '../../types'

import {getLogger} from 'log4js'

import DocumentStorage from '../../document-storage'
import AstHelper from '../../ast-helper'
import ArrowToFunction from '../arrow-to-function'
import {createMock} from './utils'

const mock = createMock(ArrowToFunction)

test('should suggest fix', () => {
  const code = `const foo = () => 1`
  const commands = mock.suggest(code, 0, 15)

  expect(commands.length).toBe(1)
  expect(commands[0].command).toBe('arrow_to_function')
  expect(commands[0].title).toMatch('arrow')
})

test('should transform with explicit return', () => {
  const code = `const foo = () => 1`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `function f() {
  return 1;
}`

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 19, line: 0}, start: {character: 12, line: 0}},
        },
      ],
    },
  })
})

test('should transform with body', () => {
  const code = `const foo = () => { return 1 }`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `function f() {
  return 1;
}`

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 30, line: 0}, start: {character: 12, line: 0}},
        },
      ],
    },
  })
})
