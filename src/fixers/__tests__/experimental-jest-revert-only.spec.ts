import fixer from '../experimental-jest-revert-only'
import {testSpec} from './test-utils'

const specText = require('./specs/experimental-jest-revert-only.txt')

testSpec(fixer, specText)
