import fixer from '../experimental-use-styled-component'
import * as range from '../../range'
import {createMultipleEditBuildFunction} from './test-utils'

const buildEditResponse = createMultipleEditBuildFunction(fixer)

import {testSpec} from './test-utils'

const specText = require('./specs/experimental-use-styled-component.txt')

testSpec(fixer, specText)
