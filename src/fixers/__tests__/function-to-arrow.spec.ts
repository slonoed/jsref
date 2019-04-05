import fixer from '../function-to-arrow'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'

const buildEditResponse = createBuildFunction(fixer)

describe('javascript', () => {
  it('no arguments', () => {
    const source = 'const a = function () { return 1; }'
    const r = buildEditResponse(source, range.create(1, 11, 1, 11))

    expect(r).toEqual({
      newText: '() => { return 1; }',
      range: {end: {column: 35, line: 1}, start: {column: 10, line: 1}},
      title: 'Convert to arrow function',
    })
  })

  it('no action when "this" is used inside', () => {
    const source = 'const a = function () { this.call() }'
    const r = buildEditResponse(source, range.create(1, 11, 1, 11))

    expect(r).toEqual(null)
  })
})
