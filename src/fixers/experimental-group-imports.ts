import {Fixer, AstRoot} from '../types'
import * as jscodeshift from 'jscodeshift'
import * as Range from '../range'
import * as Position from '../pos'
import * as Ast from '../ast'
import * as Patch from '../patch'
import astTypes from 'recast/lib/types'
import {Collection} from 'jscodeshift/src/Collection'
import {capitalize} from '../text-utils'
import {pathExists, pathExistsSync} from 'fs-extra'

type Data = null

const builtInModules = [
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'trace_events',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'zlib',
]

function compareImports(
  a: jscodeshift.ImportDeclaration,
  b: jscodeshift.ImportDeclaration
): number {
  const ap = a.source.value
  const bp = b.source.value

  if (typeof ap !== 'string' || typeof bp !== 'string') {
    throw new Error('Import source is not a string')
  }

  return ap.localeCompare(bp)
}

function joinImports(j: jscodeshift.JSCodeshift, nodes: jscodeshift.ImportDeclaration[]): string {
  return nodes
    .sort(compareImports)
    .map(node => j(node).toSource())
    .join('\n')
}

const fixer: Fixer<Data> = {
  suggestCodeAction(params) {
    const {j, ast} = params

    const importNode = Ast.findFirstNode(
      ast,
      j.ImportDeclaration,
      n => (n.loc && Range.isInside(params.selection, n.loc)) || false
    )

    if (!importNode) {
      return null
    }

    return {
      title: `Group imports`,
      data: null,
    }
  },
  createEdit(params) {
    const {data, ast, j} = params

    const imports = Ast.find(ast, j.ImportDeclaration).nodes()

    const systemImports: jscodeshift.ImportDeclaration[] = []
    const packageImports: jscodeshift.ImportDeclaration[] = []
    const sourceImports: jscodeshift.ImportDeclaration[] = []

    const patches = []
    for (const node of imports) {
      if (node.loc) {
        const loc: Range.t = {
          start: node.loc.start,
          end: {line: node.loc.end.line, column: node.loc.end.column + 1},
        }
        patches.push(Patch.del(loc))
      }

      const path = node.source.value
      if (typeof path === 'string') {
        if (builtInModules.includes(path)) {
          systemImports.push(node)
        } else if (/^[a-z]/i.test(path)) {
          packageImports.push(node)
        } else {
          sourceImports.push(node)
        }
      }
    }

    patches.reverse()

    patches.push(
      Patch.insert(j, Position.create(1, 0), [
        joinImports(j, systemImports),
        '\n',
        '\n',
        joinImports(j, packageImports),
        '\n',
        '\n',
        joinImports(j, sourceImports),
        '\n',
        '\n',
      ])
    )

    return patches
  },
}

export default fixer
