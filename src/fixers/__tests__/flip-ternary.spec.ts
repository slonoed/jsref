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
})
