import fixer from '../flip-ternary'
import {testSpec} from './test-utils'

const specText = require('./specs/flip-ternary.txt')

testSpec(fixer, specText)
