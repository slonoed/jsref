import fixer from '../function-to-arrow'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'
import * as jscodeshift from 'jscodeshift'
import {testSpec} from './test-utils'

const specText = require('./specs/function-to-arrow.txt')

testSpec(fixer, specText)

const buildEditResponse = createBuildFunction(fixer)

describe('javascript', () => {
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
