import { CodeActionKind, TextDocuments, WorkspaceEdit } from 'vscode-languageserver'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { CodeActionParams } from 'vscode-languageserver-protocol'
import ActionManager from './action-manager'
import AstService from './ast-service'
import FixerStore from './fixer-store'
import { FixEdit } from './types'

const title = 'test title'
const edit = makeEdit('test-uri', 'test-text')
const params: CodeActionParams = {
  textDocument: { uri: 'test-document-uri' },
  range: {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 0 },
  },
  context: {
    diagnostics: [],
  },
}

test.only('run fixer with object edit', async () => {
  const actionManager = await createManager(edit)
  const actions = actionManager.suggestCodeActions(params)

  expect(actions).toHaveLength(1)
  expect(actions[0]).toEqual({
    title,
    kind: CodeActionKind.RefactorRewrite,
    command: {
      title,
      command: expect.any(String),
    },
  })

  const command = actions[0].command?.command
  const result = await actionManager.createEdit({ command } as any)

  expect(result).toEqual({
    label: title,
    edit,
  })
})

test('run fixer with function edit', async () => {
  const actionManager = await createManager(() => edit)
  const actions = actionManager.suggestCodeActions(params)

  expect(actions).toHaveLength(1)
  expect(actions[0]).toEqual({
    title,
    kind: CodeActionKind.RefactorRewrite,
    command: {
      title,
      command: expect.any(String),
    },
  })

  const command = actions[0].command?.command
  const result = await actionManager.createEdit({ command } as any)

  expect(result).toEqual({
    label: title,
    edit,
  })
})

test('run fixer with async function edit', async () => {
  const actionManager = await createManager(async () => edit)
  const actions = actionManager.suggestCodeActions(params)

  expect(actions).toHaveLength(1)
  expect(actions[0]).toEqual({
    title,
    kind: CodeActionKind.RefactorRewrite,
    command: {
      title,
      command: expect.any(String),
    },
  })

  const command = actions[0].command?.command
  const result = await actionManager.createEdit({ command } as any)

  expect(result).toEqual({
    label: title,
    edit,
  })
})

test('run unknown command', async () => {
  const actionManager = await createManager(edit)
  const result = await actionManager.createEdit({ command: 'nope' } as any)
  expect(result).toBeNull()
})

test('should not keep old fixer', async () => {
  const actionManager = await createManager(edit)
  const actions = actionManager.suggestCodeActions(params)
  const command = actions[0].command?.command

  // Run seconds time
  actionManager.suggestCodeActions(params)

  const result = await actionManager.createEdit({ command } as any)

  expect(result).toBeNull()
})

async function createManager(edit: FixEdit) {
  const loader = {
    load: async () => {
      const obj = {
        id: 'obj',
        fix: () => {
          return {
            title,
            edit,
          }
        },
      }

      return [obj]
    },
  }
  const store = new FixerStore(console, [loader])
  await store.init()
  const documents = new TextDocuments<TextDocument>({} as any)
  const astService = new AstService(console, documents)
  return new ActionManager(store, console, astService)
}

function makeEdit(uri: string, text: string): WorkspaceEdit {
  return {
    changes: {
      [uri]: [
        {
          range: {
            start: {
              line: 0,
              character: 0,
            },
            end: {
              line: 0,
              character: 0,
            },
          },
          newText: text,
        },
      ],
    },
  }
}
