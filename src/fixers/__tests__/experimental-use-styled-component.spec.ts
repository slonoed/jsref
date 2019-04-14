import fixer from '../experimental-use-styled-component'
import * as range from '../../range'
import {createMultipleEditBuildFunction} from './test-utils'

const buildEditResponse = createMultipleEditBuildFunction(fixer)

describe('javascript', () => {
  it('simple', () => {
    const source = `
    import r from 'r-dom'
    const Parent = () => {
      return r.div(['Hello'])
    }
`
    const r = buildEditResponse(source, range.create(4, 16, 4, 16))

    expect(r).toEqual([
      {
        newText: "r(StyledDiv, ['Hello'])",
        range: {end: {column: 29, line: 4}, start: {column: 13, line: 4}},
        title: 'Extract "div" to styled component',
      },
      {
        newText: '\nconst StyledDiv = styled("div", {});\n',
        range: {end: {column: 25, line: 2}, start: {column: 25, line: 2}},
        title: 'Extract "div" to styled component',
      },
      {
        newText: '\nimport { styled } from "styletron-react";\n',
        range: {end: {column: 25, line: 2}, start: {column: 25, line: 2}},
        title: 'Extract "div" to styled component',
      },
    ])
  })
  it('with existed styled import', () => {
    const source = `
    import {styled} from 'styletron-react'
    import r from 'r-dom'
    const Parent = () => {
      return r.div(['Hello'])
    }
`
    const r = buildEditResponse(source, range.create(5, 16, 5, 16))

    expect(r).toEqual([
      {
        newText: "r(StyledDiv, ['Hello'])",
        range: {end: {column: 29, line: 5}, start: {column: 13, line: 5}},
        title: 'Extract "div" to styled component',
      },
      {
        newText: '\n\nconst StyledDiv = styled("div", {});\n',
        range: {end: {column: 25, line: 3}, start: {column: 25, line: 3}},
        title: 'Extract "div" to styled component',
      },
    ])
  })
  it('with different tag ("code")', () => {
    const source = `
    import {styled} from 'styletron-react'
    import r from 'r-dom'
    const Parent = () => {
      return r.code(['Hello'])
    }
`
    const r = buildEditResponse(source, range.create(5, 16, 5, 16))

    expect(r).toEqual([
      {
        newText: "r(StyledCode, ['Hello'])",
        range: {end: {column: 30, line: 5}, start: {column: 13, line: 5}},
        title: 'Extract "code" to styled component',
      },
      {
        newText: '\n\nconst StyledCode = styled("code", {});\n',
        range: {end: {column: 25, line: 3}, start: {column: 25, line: 3}},
        title: 'Extract "code" to styled component',
      },
    ])
  })
  it.only('with different rdom import', () => {
    const source = `
    import {styled} from 'styletron-react'
    import rd from 'r-dom'
    const Parent = () => {
      return rd.code(['Hello'])
    }
`
    const r = buildEditResponse(source, range.create(5, 16, 5, 16))

    expect(r).toEqual([
      {
        newText: "rd(StyledCode, ['Hello'])",
        range: {end: {column: 31, line: 5}, start: {column: 13, line: 5}},
        title: 'Extract "code" to styled component',
      },
      {
        newText: '\n\nconst StyledCode = styled("code", {});\n',
        range: {end: {column: 26, line: 3}, start: {column: 26, line: 3}},
        title: 'Extract "code" to styled component',
      },
    ])
  })
})
