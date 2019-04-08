import * as jscodeshift from 'jscodeshift'
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

    const api = jscodeshift.withParser('babylon')
    const params = {
      j: api,
      ast: api(source),
      selection: range.create(1, 6, 1, 6),
      logger: console,
    }
    const action = fixer.suggestCodeAction(params)

    expect(action).toEqual(null)
  })
})
