import fixer from '../require-to-import'
import * as range from '../../range'
import {createBuildFunction} from './test-utils'

const buildEditResponse = createBuildFunction(fixer)

describe('javascript', () => {
  it('named require', () => {
    const source = "const a = require('b')"
    const r = buildEditResponse(source, range.create(1, 15, 1, 15))

    expect(r).toEqual({
      newText: 'import a from "b";',
      range: {end: {column: 22, line: 1}, start: {column: 0, line: 1}},
      title: 'Convert require to ES import',
    })
  })

  it('cursor before require', () => {
    const source = "const a = require('b')"
    const r = buildEditResponse(source, range.create(1, 10, 1, 10))

    expect(r).toEqual({
      newText: 'import a from "b";',
      range: {end: {column: 22, line: 1}, start: {column: 0, line: 1}},
      title: 'Convert require to ES import',
    })
  })

  it('unnamed require', () => {
    const source = "require('b')"
    const r = buildEditResponse(source, range.create(1, 4, 1, 4))

    expect(r).toEqual({
      newText: 'import "b";',
      range: {end: {column: 12, line: 1}, start: {column: 0, line: 1}},
      title: 'Convert require to ES import',
    })
  })
})

describe('typescript', () => {
  it('named require', () => {
    const source = "const a = require('b')"
    const r = buildEditResponse(source, range.create(1, 15, 1, 15), 'ts')

    expect(r).toEqual({
      newText: 'import a from "b";',
      range: {end: {column: 22, line: 1}, start: {column: 0, line: 1}},
      title: 'Convert require to ES import',
    })
  })

  it('named require with type', () => {
    const source = "const a:number = require('b')"
    const r = buildEditResponse(source, range.create(1, 19, 1, 19), 'ts')

    expect(r).toEqual({
      newText: 'import a from "b";',
      range: {end: {column: 29, line: 1}, start: {column: 0, line: 1}},
      title: 'Convert require to ES import',
    })
  })
})

describe('flow', () => {
  it('named require', () => {
    const source = "const a = require('b')"
    const r = buildEditResponse(source, range.create(1, 15, 1, 15), 'flow')

    expect(r).toEqual({
      newText: 'import a from "b";',
      range: {end: {column: 22, line: 1}, start: {column: 0, line: 1}},
      title: 'Convert require to ES import',
    })
  })

  it('named require with type', () => {
    const source = "const a:number = require('b')"
    const r = buildEditResponse(source, range.create(1, 19, 1, 19), 'flow')

    expect(r).toEqual({
      newText: 'import a from "b";',
      range: {end: {column: 29, line: 1}, start: {column: 0, line: 1}},
      title: 'Convert require to ES import',
    })
  })
})
