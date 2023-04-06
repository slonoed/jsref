import { CodeActionKind, TextEdit, WorkspaceEdit } from 'vscode-languageserver'
import { randomUUID } from 'crypto'
import {
  CodeActionParams,
  ExecuteCommandParams,
  ApplyWorkspaceEditParams,
  CodeAction,
} from 'vscode-languageserver-protocol'
import FixerStore from './fixer-store'
import { Logger, Fix, Edit } from './types'
import AstService from './ast-service'
import Api, { findNodeAtPosition } from './api'

type Payload = {
  fix: Fix
  uri: string
}

export default class ActionManager {
  store: FixerStore
  logger: Logger
  astService: AstService

  // uuid -> payload
  actions: Map<string, Payload>

  constructor(store: FixerStore, logger: Logger, astService: AstService) {
    this.store = store
    this.logger = logger
    this.astService = astService
    this.actions = new Map()
  }

  suggestCodeActions(params: CodeActionParams): CodeAction[] {
    // Remove reference to previous fixes to avoid memory growth
    this.actions = new Map()
    const uri = params.textDocument.uri
    const actions: CodeAction[] = []

    const j = this.astService.getCodeShift(uri)
    if (!j) {
      return actions
    }
    const ast = this.astService.getAstTree(uri)
    if (!ast) {
      return actions
    }
    const target = findNodeAtPosition(ast, params.range.start)

    const input = {
      params,
      j,
      ast,
      target,
      logger: this.logger,
      api: new Api(j, target),
    }

    for (const fixer of this.store.getAll()) {
      const fix = safe(() => fixer.fix(input), null)
      if (fix) {
        const id = randomUUID()
        this.actions.set(id, { fix, uri })
        actions.push({
          title: fix.title,
          kind: CodeActionKind.RefactorRewrite,
          command: {
            title: fix.title,
            command: id,
          },
        })
      }
    }

    return actions
  }

  async createEdit(params: ExecuteCommandParams): Promise<ApplyWorkspaceEditParams | null> {
    const payload = this.actions.get(params.command)
    if (!payload) {
      return null
    }
    const { fix, uri } = payload

    let edit: Edit
    if (typeof fix.edit === 'function') {
      edit = await fix.edit()
    } else {
      edit = fix.edit
    }

    return {
      label: fix.title,
      edit: fixerEditToWorkspace(edit, uri),
    }
  }
}

function safe<T>(fn: () => T, def: T) {
  try {
    return fn()
  } catch (e) {
    return def
  }
}

function fixerEditToWorkspace(edit: Edit, uri: string): WorkspaceEdit {
  if (isWorkspaceEdit(edit)) {
    return edit
  }

  return {
    changes: {
      [uri]: [edit],
    },
  }
}

function isWorkspaceEdit(edit: Edit): edit is WorkspaceEdit {
  return typeof (edit as WorkspaceEdit).changes !== 'undefined'
}
