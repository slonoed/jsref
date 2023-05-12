import { findNodeAtPosition } from './api'
import { File } from 'jscodeshift'
import { Position } from 'vscode-languageserver-types'
import jscodeshift from 'jscodeshift'

describe('findNodeAtPosition', () => {
  const code = `
    function test() {
      console.log("Hello, World!");
    }
  `

  const ast = jscodeshift(code)

  test('should find deepest node at position', () => {
    const position: Position = { line: 2, character: 18 } // Inside "Hello, World!" string
    const result = findNodeAtPosition(ast, position)
    expect(result).not.toBeNull()
    expect(result!.get().value.type).toBe('Literal')
  })

  test('should find console name', () => {
    const position: Position = { line: 2, character: 10 }
    const result = findNodeAtPosition(ast, position)
    expect(result).not.toBeNull()
    expect(result!.get().value.type).toBe('Identifier')
  })

  test('should work with export value', () => {
    const code = `export const a = 1`
    const ast = jscodeshift(code)
    const j = jscodeshift.withParser('babylon')
    const position: Position = { line: 0, character: 10 }
    const result = findNodeAtPosition(ast, position)
    expect(result.size()).toBe(1)
    expect(result.isOfType(j.VariableDeclaration)).toBe(true)
  })

  // test('should return null when position is outside any node', () => {
  //   const position: Position = { line: 0, character: 0 } // Outside any node
  //   const result = findNodeAtPosition(ast, position)
  //   expect(result).toBeNull()
  // })
})
