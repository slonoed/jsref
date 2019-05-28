import fixer from '../jsx-expand-empty-tag'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'
import {testSpec} from './test-utils'

const specText = require('./specs/jsx-expand-empty-tag.txt')

testSpec(fixer, specText)

const buildEditResponse = createBuildFunction(fixer)

describe('javascript', () => {
  it('simple', () => {
    const source = '<input/>'
    const r = buildEditResponse(source, range.create(1, 6, 1, 6))

    expect(r).toEqual({
      newText: '<input></input>',
      range: {end: {column: 8, line: 1}, start: {column: 0, line: 1}},
      title: 'Expand input',
    })
  })
})
