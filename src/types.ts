import * as jscodeshift from 'jscodeshift'
import {Collection} from 'jscodeshift/src/Collection'
import * as Range from './range'
import * as Patch from './patch'
import {Logger} from './logger'
import {pathExists} from 'fs-extra'

export interface File extends jscodeshift.Node {
  type: string
  program: jscodeshift.Program
  name: string | null
}

export type AstRoot = Collection<File>

type Config = {
  packages: string[]
}

export type SuggestActionParams = {
  j: jscodeshift.JSCodeshift
  ast: Collection<File>
  selection: Range.t
  logger: Logger
  config?: Config
}

export type SuggestActionResult<T> = {
  title: string
  data: T
}

export type CreateEditParams<T> = {
  ast: AstRoot
  j: jscodeshift.JSCodeshift
  data: T
}

export type CreateEditResult = Patch.t | Patch.t[]

export interface Fixer<T> {
  suggestCodeAction(params: SuggestActionParams): SuggestActionResult<T> | null
  createEdit(params: CreateEditParams<T>): CreateEditResult | null
}
