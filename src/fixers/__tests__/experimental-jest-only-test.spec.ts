import fixer from '../experimental-jest-only-test'
import {testSpec} from './test-utils'

const specText = require('./specs/experimental-jest-only-test.txt')

testSpec(fixer, specText)
