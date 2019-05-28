import * as jscodeshift from 'jscodeshift'
import fixer from '../explicit-return-to-implicit'
import * as range from '../../range'

import {testSpec} from './test-utils'

const specText = require('./specs/explicit-return-to-implicit.txt')

testSpec(fixer, specText)

describe('javascript', () => {
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
