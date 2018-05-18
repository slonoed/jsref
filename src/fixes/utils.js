// @flow

import type {IPosition} from 'vscode-languageserver-types'
import type {Node, Location, Position} from '../babylon-types'

// pos 0 pased, loc 1 based
function locToPos(loc: Position): IPosition {
  return {line: loc.line - 1, character: loc.column}
}

export function createReplacementEdit(uri: string, node: Node, code: string) {
  const {
    loc: {start, end},
  } = node

  return {
    changes: {
      [uri]: [
        {
          range: {
            start: locToPos(start),
            end: locToPos(end),
          },
          newText: code,
        },
      ],
    },
  }
}
