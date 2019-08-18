import fixer from '../flip-if-else'
import {testSpec} from './test-utils'

const specText = require('./specs/flip-if-else.txt')

testSpec(fixer, specText)
