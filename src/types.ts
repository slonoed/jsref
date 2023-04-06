import { JSCodeshift, Node } from 'jscodeshift'
import { Collection } from 'jscodeshift/src/Collection'
import { CodeActionParams, TextEdit, WorkspaceEdit } from 'vscode-languageserver'
import Api from './api'

// This type represents edit that fixer can return
// WorkspaceEdit edit gives full control across multiple documents
// TextEdit represents a simple edit in document where code action was called
export type Edit = WorkspaceEdit | TextEdit

type EditFn = () => Edit
type EditFnAsync = () => Promise<Edit>

// Most of the time fixer will delay computations (EditFn) until user pick that fixer.
// If computation is lightweight fixer can return Edit right away.
// If fixer needs some async operations then it can return EditFnAsync
export type FixEdit = Edit | EditFn | EditFnAsync

export type Fix = {
  title: string
  edit: FixEdit
}

export type FixerInput = {
  params: CodeActionParams
  j: JSCodeshift
  ast: Collection<any>
  target: Collection<any>
  logger: Logger
  api: Api
}

type FixFn = (i: FixerInput) => Fix | null

export type Fixer = {
  id: string
  fix: FixFn
}

export type Logger = {
  error(message: string, ...args: any[]): void
  warn(message: string, ...args: any[]): void
  info(message: string, ...args: any[]): void
  log(message: string, ...args: any[]): void
}

export type Loader = {
  load(): Promise<Fixer[]>
}
