import fixer from '../flip-ternary'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'

const buildEditResponse = createBuildFunction(fixer)

describe('javascript', () => {
  it('simple', () => {
    const source = 'a ? b : c'
    const r = buildEditResponse(source, range.create(1, 6, 1, 6))

    expect(r).toEqual({
      newText: '!a ? c : b',
      range: {end: {column: 9, line: 1}, start: {column: 0, line: 1}},
      title: 'Flip ternary',
    })
  })
  it('nested, should convert inner', () => {
    const source = 'a ? b : x ? y : z'
    const r = buildEditResponse(source, range.create(1, 11, 1, 11))

    expect(r).toEqual({
      newText: '!x ? z : y',
      range: {end: {column: 17, line: 1}, start: {column: 8, line: 1}},
      title: 'Flip ternary',
    })
  })
})
