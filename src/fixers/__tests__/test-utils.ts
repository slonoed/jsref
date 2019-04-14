import * as jscodeshift from 'jscodeshift'
import * as range from '../../range'
import {Fixer} from '../../types'
import {createMessageConnection} from 'vscode-jsonrpc'

type responseData = {
  title: string
  newText: string
  range: range.t
}
export function createBuildFunction<T>(fixer: Fixer<T>) {
  const foo = createMultipleEditBuildFunction(fixer)

  return function buildEditResponse(source: string, r: range.t, parser?: string): responseData {
    return foo(source, r, parser)[0]
  }
}

export function createMultipleEditBuildFunction<T>(fixer: Fixer<T>) {
  return function buildEditResponse(source: string, r: range.t, parser?: string): responseData[] {
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
