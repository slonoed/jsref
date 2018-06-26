// @flow
import type {ICommand, ILocation, IPosition} from 'vscode-languageserver-types'
import type {Fixer} from '../../types'

import {getLogger} from 'log4js'

import DocumentStorage from '../../document-storage'
import AstHelper from '../../ast-helper'
import FunctionToArrow from '../function-to-arrow'

class FakeDocStorage {
  docs: Map<string, string>
  constructor() {
    this.docs = new Map()
  }
  add(f, c) {
    this.docs.set(f, c)
  }
  get(f) {
    return this.docs.get(f)
  }
}

type mock = {
  suggest: (code: string, line: number, character: number) => ICommand[],
  edit: (select: number, code: string, line: number, character: number) => Object,
}

export function createMock(FixerCls: Function): mock {
  const buildWithFixer = (code, line, character) => {
    const uri = 'file://testfile.js'
    const logger = getLogger('test')
    const pos = {line, character}
    const location = {uri, range: {start: pos, end: pos}}
    const documentStorage = new FakeDocStorage()
    const astHelper = new AstHelper(logger)
    const fixer = new FixerCls({logger, documentStorage, astHelper})

    documentStorage.add(uri, code)

    const commands = fixer.suggestCommands(location)
    return [commands, fixer]
  }

  const suggest = (...args) => {
    const [commands] = buildWithFixer(...args)
    return commands
  }

  const edit = (select, ...args) => {
    const [commands, fixer] = buildWithFixer(...args)
    return fixer.createEdit(commands[select].arguments)
  }

  return {
    suggest,
    edit,
  }
}

test('empty', () => {})
