import {Fixer, AstRoot} from '../types'
import * as jscodeshift from 'jscodeshift'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'
import astTypes from 'recast/lib/types'
import {Collection} from 'jscodeshift/src/Collection'
import {capitalize} from '../text-utils'
import {pathExists} from 'fs-extra'

type Data = Position.t

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

    if (!node || !node.loc) {
      return null
    }

    const tag = getTagName(j, node)

    return {
      title: `Extract "${tag}" to styled component`,
      data: node.loc.start,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const node = Ast.findLastNode(ast, j.CallExpression, n => Ast.isOnPosition(n, data))
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


    patches.push(
      Patch.insert(j, declarationStart, topInserts)
    )

    return patches
  },
}

export default fixer
