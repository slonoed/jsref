import {Fixer, AstRoot} from '../types'
import * as jscodeshift from 'jscodeshift'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'
import astTypes from 'recast/lib/types'
import {Collection} from 'jscodeshift/src/Collection'
import {capitalize} from '../text-utils'
import {jsxElement} from '@babel/types'

type NodeType = 'jsx' | 'rdom'
type Data = {
  start: Position.t
  type: NodeType
}

function hasStyledImport(j: jscodeshift.JSCodeshift, ast: AstRoot): boolean {
  const styletronSpecifiers = getImportSpecifiers(j, ast, 'styletron-react')
  const styledSpecifier = styletronSpecifiers.find(
    s =>
      j.ImportSpecifier.check(s) && j.Identifier.check(s.imported) && s.imported.name === 'styled'
  )

  return Boolean(styledSpecifier)
}

function getDefaultImportName(
  j: jscodeshift.JSCodeshift,
  ast: AstRoot,
  module: string
): string | null {
  const node = Ast.findFirstNode(
    ast,
    j.ImportDeclaration,
    n =>
      n.specifiers.length === 1 &&
      j.Identifier.check(n.specifiers[0].local) &&
      n.source.value === module
  )

  const specifiers = getImportSpecifiers(j, ast, module)

  const defSpec = specifiers.find(s => j.ImportDefaultSpecifier.check(s))

  if (!defSpec || !j.Identifier.check(defSpec.local)) {
    return null
  }

  return defSpec.local.name
}

type ImportSpecifier =
  | jscodeshift.ImportSpecifier
  | jscodeshift.ImportNamespaceSpecifier
  | jscodeshift.ImportDefaultSpecifier

function getImportSpecifiers(
  j: jscodeshift.JSCodeshift,
  ast: AstRoot,
  module: string
): ImportSpecifier[] {
  const node = Ast.findFirstNode(
    ast,
    j.ImportDeclaration,
    n => n.specifiers.length === 1 && n.source.value === module
  )

  if (!node) {
    return []
  }

  return node.specifiers
}

function getTagName(j: jscodeshift.JSCodeshift, node: jscodeshift.CallExpression): string | null {
  return j.MemberExpression.check(node.callee) &&
    j.Identifier.check(node.callee.object) &&
    j.Identifier.check(node.callee.property)
    ? node.callee.property.name
    : null
}

function isLowerCase(word: string): boolean {
  return word === word.toLowerCase()
}

const fixer: Fixer<Data> = {
  suggestCodeAction(params) {
    const {j, ast} = params

    const rDomVar = getDefaultImportName(j, ast, 'r-dom')

    const node = Ast.findLastNode(
      ast,
      j.CallExpression,
      n =>
        n.loc !== null &&
        Range.isInside(params.selection, n.loc) &&
        j.MemberExpression.check(n.callee) &&
        j.Identifier.check(n.callee.object) &&
        n.callee.object.name === rDomVar &&
        j.Identifier.check(n.callee.property)
    )

    if (node && node.loc) {
      const tag = getTagName(j, node)

      return {
        title: `Extract "${tag}" to styled component`,
        data: {start: node.loc.start, type: 'rdom'},
      }
    }

    const jsxElement = Ast.findLastNode(
      ast,
      j.JSXElement,
      n =>
        n.loc !== null &&
        Range.isInside(params.selection, n.loc) &&
        j.JSXIdentifier.check(n.openingElement.name) &&
        isLowerCase(n.openingElement.name.name)
    )

    if (!jsxElement || !jsxElement.loc) {
      return null
    }

    const jsxNode = jsxElement.openingElement

    if (jsxNode && jsxNode.loc && j.JSXIdentifier.check(jsxNode.name)) {
      const tag = jsxNode.name.name

      return {
        title: `Extract "${tag}" to styled component`,
        data: {start: jsxElement.loc.start, type: 'jsx'},
      }
    }

    return null
  },
  createEdit(params) {
    const {data, ast, j} = params

    if (data.type === 'rdom') {
      const node = Ast.findLastNode(ast, j.CallExpression, n => Ast.isOnPosition(n, data.start))
      if (!node) {
        return null
      }

      const rDomVar = getDefaultImportName(j, ast, 'r-dom')
      if (!rDomVar) {
        return null
      }

      const tag = getTagName(j, node)

      if (!tag) {
        return null
      }

      const componentName = 'Styled' + capitalize(tag)

      const patches = []

      const newNode = j.callExpression(j.identifier(rDomVar), [
        j.identifier(componentName),
        ...node.arguments,
      ])

      patches.push(Patch.replaceNode(j, node, newNode))

      const lastImport = Ast.findLastNode(ast, j.ImportDeclaration, () => true)
      const declarationStart =
        lastImport && lastImport.loc
          ? Position.create(lastImport.loc.end.line, lastImport.loc.end.column)
          : Position.create(1, 0)

      const topInserts: any = ['\n']

      const shouldInsertStyledImport = !hasStyledImport(j, ast)
      if (shouldInsertStyledImport) {
        const styledImport = j.importDeclaration(
          [j.importSpecifier(j.identifier('styled'))],
          j.literal('styletron-react')
        )
        topInserts.push(styledImport)
        topInserts.push('\n')
      }

      topInserts.push('\n')

      const styledComponentDeclaration = j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier(componentName),
          j.callExpression(j.identifier('styled'), [j.literal(tag), j.objectExpression([])])
        ),
      ])

      topInserts.push(styledComponentDeclaration)

      patches.push(Patch.insert(j, declarationStart, topInserts))

      return patches
    }

    const elementNode = Ast.findLastNode(ast, j.JSXElement, n => Ast.isOnPosition(n, data.start))
    if (!elementNode) {
      return null
    }
    const node = elementNode.openingElement

    const tag = j.JSXIdentifier.check(node.name) && node.name.name

    if (!tag) {
      return null
    }

    const componentName = 'Styled' + capitalize(tag)

    const patches = []

    const newNode = Ast.cloneNode(j, node)
    newNode.name = j.jsxIdentifier(componentName)
    newNode.attributes = newNode.attributes.filter(
      attr =>
        !(
          j.JSXAttribute.check(attr) &&
          j.JSXIdentifier.check(attr.name) &&
          attr.name.name === 'style'
        )
    )
    if (!node.selfClosing && elementNode.closingElement) {
      const newNode = Ast.cloneNode(j, elementNode.closingElement)
      newNode.name = j.jsxIdentifier(componentName)
      patches.push(Patch.replaceNode(j, elementNode.closingElement, newNode))
    }

    patches.push(Patch.replaceNode(j, node, newNode))

    const lastImport = Ast.findLastNode(ast, j.ImportDeclaration, () => true)
    const declarationStart =
      lastImport && lastImport.loc
        ? Position.create(lastImport.loc.end.line, lastImport.loc.end.column)
        : Position.create(1, 0)

    const topInserts: any = lastImport ? ['\n'] : []

    const shouldInsertStyledImport = !hasStyledImport(j, ast)
    if (shouldInsertStyledImport) {
      const styledImport = j.importDeclaration(
        [j.importSpecifier(j.identifier('styled'))],
        j.literal('styletron-react')
      )
      topInserts.push(styledImport)
      topInserts.push('\n')
    }

    topInserts.push('\n')

    const styledComponentDeclaration = j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier(componentName),
        j.callExpression(j.identifier('styled'), [j.literal(tag), j.objectExpression([])])
      ),
    ])

    topInserts.push(styledComponentDeclaration)

    topInserts.push('\n')
    topInserts.push('\n')

    patches.push(Patch.insert(j, declarationStart, topInserts))

    return patches
  },
}

export default fixer
