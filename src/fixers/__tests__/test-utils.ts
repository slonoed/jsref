import * as fs from 'fs'
import * as path from 'path'
import * as jscodeshift from 'jscodeshift'
import * as range from '../../range'
import * as position from '../../pos'
import {Fixer} from '../../types'
import {createMessageConnection} from 'vscode-jsonrpc'
import {isTSExpressionWithTypeArguments} from '@babel/types'

export type ResponseData = {
  title: string
  newText: string
  range: range.t
}
export function createBuildFunction<T>(fixer: Fixer<T>) {
  const foo = createMultipleEditBuildFunction(fixer)

  return function buildEditResponse(source: string, r: range.t, parser?: string): ResponseData {
    return foo(source, r, parser)[0]
  }
}

export function createMultipleEditBuildFunction<T>(fixer: Fixer<T>) {
  return function buildEditResponse(source: string, r: range.t, parser?: string): ResponseData[] {
    const api = jscodeshift.withParser(parser || 'babylon')
    const params = {
      j: api,
      ast: api(source),
      selection: r,
      logger: console,
    }
    const action = fixer.suggestCodeAction(params)

    if (!action) {
      throw new Error('No suggested action returned from fixer')
    }

    const edit = fixer.createEdit({
      j: api,
      ast: api(source),
      data: action.data,
    })

    if (!edit) {
      throw new Error('No edit returned from fixer')
    }

    const edits = edit instanceof Array ? edit : [edit]

    return edits.map(edit => ({
      title: action.title,
      newText: edit.newText,
      range: edit.range,
    }))
  }
}

export function testSpec<T>(fixer: Fixer<T>, specSourceText: string) {
  const buildEditResponse = createMultipleEditBuildFunction(fixer)

  describe('specs', () => {
    specSourceText
      .split(/^={3,}/m)
      .map(t => t.trim())
      .filter(t => t)
      .map(parseSpec)
      .forEach(spec => {
        const run = spec.only ? it.only : it
        run(spec.name, () => {
          const edits = buildEditResponse(spec.source, spec.range)
          const result = applyEdits(spec.source, edits)
          expect(result.trimRight()).toBe(spec.target.trimRight())
        })
      })
  })
}

type Spec = {
  only: boolean
  name: string
  source: string
  target: string
  range: range.t
}

function parseIntWithDefault(s: string, def: number): number {
  const n = parseInt(s)
  if (Number.isNaN(n)) {
    return def
  }

  return n
}

function parseSpec(txt: string): Spec {
  const [setupText, source, target] = txt.split(/\n\-\-\-\n/m)
  const setup: {[k: string]: string} = setupText
    .split('\n')
    .map(o => o.trim().split(':'))
    .reduce((acc, [name, value]) => ({...acc, [name.trim()]: value.trim()}), {})

  const column = parseInt(setup.column)

  if (!setup.column || Number.isNaN(column)) {
    throw new Error('Setup should have column defined as integer')
  }
  if (!setup.name) {
    throw new Error('Setup should have name defined')
  }

  const line = parseIntWithDefault(setup.line, 1)
  const endLine = parseIntWithDefault(setup.endLine, line)
  const endColumn = parseIntWithDefault(setup.endColumn, column)

  return {
    only: setup.only === 'true',
    source,
    target,
    name: setup.name,
    range: range.create(line, column, endLine, endColumn),
  }
}

function positionToOffset(t: string, p: position.t): number {
  const rows = t.split('\n')
  let offset = 0
  for (let i = 0; i < p.line - 1; i++) {
    offset += rows[i].length + 1
  }
  offset += p.column
  return offset
}

function applyEdit(source: string, edit: ResponseData): string {
  const startOffset = positionToOffset(source, edit.range.start)
  const endOffset = positionToOffset(source, edit.range.end)

  const b = source.slice(0, startOffset) + edit.newText + source.slice(endOffset)

  return b
}

function applyEdits(source: string, edits: ResponseData[]): string {
  return edits.reduce((s, edit) => applyEdit(s, edit), source)
}
