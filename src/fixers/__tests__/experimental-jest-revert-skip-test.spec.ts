import fixer from '../experimental-jest-revert-skip-test'
import {testSpec} from './test-utils'

const specText = require('./specs/experimental-jest-revert-skip-test.txt')

testSpec(fixer, specText)
