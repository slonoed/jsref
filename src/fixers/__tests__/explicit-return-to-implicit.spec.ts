import fixer from '../explicit-return-to-implicit'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'

const buildEditResponse = createBuildFunction(fixer)

describe('javascript', () => {
  it('simple', () => {
    const source = '() => { return test() }'
    const r = buildEditResponse(source, range.create(1, 6, 1, 6))

    expect(r).toEqual({
      newText: 'test()',
      range: {end: {column: 23, line: 1}, start: {column: 6, line: 1}},
      title: 'Use implicit return',
    })
  })

  it('do not work on empty return', () => {
    const source = '() => { return }'
    const r = buildEditResponse(source, range.create(1, 6, 1, 6))

    expect(r).toBe(null)
  })
})
