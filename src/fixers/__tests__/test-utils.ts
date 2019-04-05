import * as jscodeshift from 'jscodeshift'
import * as range from '../../range'
import {Fixer} from '../../types'

type responseData = {
  title: string
  newText: string
  range: range.t
}
export function createBuildFunction<T>(fixer: Fixer<T>) {
  return function buildEditResponse(source: string, r: range.t, parser?: string): responseData {
    const api = jscodeshift.withParser(parser || 'babylon')
    const params = {
      j: api,
      ast: api(source),
      selection: r,
      logger: console,
    }
    const action = fixer.suggestCodeAction(params)

    if (!action) {
      return null
    }

    const edit = fixer.createEdit({
      j: api,
      ast: api(source),
      data: action.data,
    })

    return {
      title: action.title,
      newText: edit.newText,
      range: edit.range,
    }
  }
}
