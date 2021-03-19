import fixer from '../extract-return'
import {testSpec} from './test-utils'

const specText = require('./specs/extract-return.txt')

testSpec(fixer, specText)
