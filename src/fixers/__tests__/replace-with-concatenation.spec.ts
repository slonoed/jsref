import fixer from '../replace-with-concatenation'
import {testSpec} from './test-utils'

const specText = require('./specs/replace-with-concatenation.txt')

testSpec(fixer, specText)
