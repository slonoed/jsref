import fixer from '../implicit-return-to-explicit'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'

const buildEditResponse = createBuildFunction(fixer)

describe('javascript', () => {
  it('simple', () => {
    const source = '() => test()'
    const r = buildEditResponse(source, range.create(1, 6, 1, 6))

    expect(r).toEqual({
      newText: '{\n    return test();\n}',
      range: {end: {column: 12, line: 1}, start: {column: 6, line: 1}},
      title: 'Use explicit return',
    })
  })
})
