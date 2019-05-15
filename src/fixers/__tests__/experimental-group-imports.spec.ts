import fixer from '../experimental-group-imports'

import {testSpec} from './test-utils'

const specText = require('./specs/experimental-group-imports.txt')

testSpec(fixer, specText)
