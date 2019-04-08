import fixer from '../function-to-arrow'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'
import * as jscodeshift from 'jscodeshift'

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
    const api = jscodeshift.withParser('babylon')
    const params = {
      j: api,
      ast: api(source),
      selection: range.create(1, 11, 1, 11),
      logger: console,
    }
    const action = fixer.suggestCodeAction(params)

    expect(action).toEqual(null)
  })
})
