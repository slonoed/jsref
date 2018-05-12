// @flow
import type {Fixer} from '../../types'

import {getLogger} from 'log4js'

import DocumentStorage from '../../document-storage'
import AstHelper from '../../ast-helper'
import FunctionToArrow from '../function-to-arrow'
import {createMock} from './utils'

const mock = createMock(FunctionToArrow)

test('should suggest fix', () => {
  const code = `function hello() {
}`
  const commands = mock.suggest(code, 0, 3)

  expect(commands.length).toBe(1)
  expect(commands[0].command).toBe('function_to_arrow')
  expect(commands[0].title).toMatch('hello')
})

test('should suggest fix on internal function', () => {
  const code = `function hello() {
  function cool() {
  }
}`
  const commands = mock.suggest(code, 1, 4)

  expect(commands.length).toBe(1)
  expect(commands[0].command).toBe('function_to_arrow')
  expect(commands[0].title).toMatch('cool')
})

test('should create simple edit', () => {
  const code = `function hello() {
}`
  const edit = mock.edit(0, code, 0, 3)

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: 'const hello = () => {};',
          range: {end: {character: 1, line: 1}, start: {character: 0, line: 0}},
        },
      ],
    },
  })
})
