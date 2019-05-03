import fixer from '../implicit-return-to-explicit'
import {testSpec} from './test-utils'

const specText = require('./specs/implicit-return-to-explicit.txt')

testSpec(fixer, specText)
