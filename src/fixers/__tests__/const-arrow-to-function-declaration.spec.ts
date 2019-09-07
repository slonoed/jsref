import fixer from '../const-arrow-to-function-declaration'
import { testSpec} from './test-utils'

const specText = require('./specs/const-arrow-to-function-declaration.txt')

testSpec(fixer, specText)
