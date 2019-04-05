import fixer from '../experimental-jest-revert-skip-test'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'

const buildEditResponse = createBuildFunction(fixer)

describe('javascript', () => {
  it('simple', () => {
    const source = 'it.skip("s", () => { hello(); })'
    const r = buildEditResponse(source, range.create(1, 17, 1, 17))

    expect(r).toEqual({
      newText: 'it',
      range: {end: {column: 7, line: 1}, start: {column: 0, line: 1}},
      title: 'Enable test',
    })
  })
})
