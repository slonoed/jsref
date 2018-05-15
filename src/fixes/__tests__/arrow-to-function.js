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

  const expected = `function foo() {
  return 1
}`

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 19, line: 0}, start: {character: 0, line: 0}},
        },
      ],
    },
  })
})

test('should transform with body', () => {
  const code = `const foo = () => { return 1 }`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `function foo() {
  return 1
}`

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 30, line: 0}, start: {character: 0, line: 0}},
        },
      ],
    },
  })
})

test('should copy param', () => {
  const code = `const foo = (a) => { return a }`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `function foo(a) {
  return a
}`

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 31, line: 0}, start: {character: 0, line: 0}},
        },
      ],
    },
  })
})

test('should copy params', () => {
  const code = `const foo = (a, {title = 1}) => { return a }`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `function foo(a, { title = 1 }) {
  return a
}`

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 44, line: 0}, start: {character: 0, line: 0}},
        },
      ],
    },
  })
})

test('should use const name', () => {
  const code = `const foo = () => 1`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `function foo() {
  return 1
}`

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 19, line: 0}, start: {character: 0, line: 0}},
        },
      ],
    },
  })
})

test('should not use const name if expression', () => {
  const code = `console.log(() => 1)`
  const edit = mock.edit(0, code, 0, 15)

  const expected = `function replace_me_name() {
  return 1
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

test('should replace declaration', () => {
  const code = `import React from 'react'

const Page = () => {
  return <div>{test}</div>
}
`
  const edit = mock.edit(0, code, 3, 15)

  const expected = `function Page() {
  return <div>{test}</div>
}`

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 1, line: 4}, start: {character: 0, line: 2}},
        },
      ],
    },
  })
})
