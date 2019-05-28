import fixer from '../experimental-jest-skip-test'
import {testSpec} from './test-utils'

const specText = require('./specs/experimental-jest-skip-test.txt')

testSpec(fixer, specText)
