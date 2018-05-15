// @flow
import type {Fixer} from '../../types'

import {getLogger} from 'log4js'

import DocumentStorage from '../../document-storage'
import AstHelper from '../../ast-helper'
import ReactFunctionToClass from '../react-function-to-class'
import {createMock} from './utils'

const mock = createMock(ReactFunctionToClass)

test('should suggest fix', () => {
  const code = `import React from 'react';

function Page(props) {
  return <div>{props.title}</div>
}
`
  const commands = mock.suggest(code, 3, 4)

  expect(commands.length).toBe(1)
  expect(commands[0].command).toBe('react-function-to-class')
  expect(commands[0].title).toMatch('Convert "Page" to React class')
})

test('should create simple class', () => {
  const code = `import React from 'react';

function Page(props) {
  return <div>{props.title}</div>
}
`
  const edit = mock.edit(0, code, 3, 4)

  const expected = `class Page extends React.Component {
  render() {
    const props = this.props
    return <div>{props.title}</div>
  }
}`

  const change = Object.values(edit.changes)[0]
  expect(change).toEqual([
    {
      newText: expected,
      range: {start: {line: 2, character: 0}, end: {line: 4, character: 1}},
    },
  ])
})
