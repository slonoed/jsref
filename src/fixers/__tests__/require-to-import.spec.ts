import fixer from '../require-to-import'
import {testSpec} from './test-utils'
const specText = require('./specs/require-to-import.txt')
testSpec(fixer, specText)
