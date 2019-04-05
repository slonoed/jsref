/*
  Test server answer to initialize request
*/
import * as cp from 'child_process'
import * as path from 'path'

const bin = path.join(__dirname, '../../bin/jsref.js')

let proc: cp.ChildProcess

beforeEach(() => {
  proc = cp.spawn(bin, ['--stdio'], {stdio: ['pipe', 'pipe', 'pipe']})
})
afterEach(() => {
  proc.kill('SIGINT')
})

it('initialize response', async () => {
  callRpc(proc, 'initialize', getFakeInitialParams(proc.pid), 1)

  const data: string = await new Promise(r => {
    let answer = ''
    proc.stdout.on('data', c => {
      answer += String(c)
      const parts = answer.split('\r\n\r\n')
      try {
        const data = JSON.parse(parts[1])
        r(data)
      } catch (e) {}
    })
  })

  expect(data).toEqual({
    id: 1,
    jsonrpc: '2.0',
    result: {
      capabilities: {
        codeActionProvider: true,
        executeCommandProvider: {
          commands: expect.any(Array),
        },
        textDocumentSync: 1,
      },
    },
  })
})

function callRpc(proc: cp.ChildProcess, method: string, params: any, id?: number): void {
  const message: any = {
    jsonrpc: '2.0',
    method,
    params: params,
  }
  if (id) {
    message.id = id
  }
  const pack = JSON.stringify(message)
  const size = Buffer.byteLength(pack, 'utf8')
  const headers = `Content-Length: ${size}\r\n\r\n`
  const data = headers + pack
  proc.stdin.write(data, err => {
    if (err) {
      console.log('error writing: ', err.message)
    }
  })
}

async function timeout(time: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time)
  })
}

function getFakeInitialParams(pid: number) {
  const rootUri = 'file://' + path.join(__dirname, '../dev/playground')
  return {
    processId: pid,
    rootUri,
    capabilities: {
      workspace: {
        applyEdit: true,
      },
      textDocument: {
        synchronization: {
          willSave: false,
          willSaveWaitUntil: false,
          didSave: false,
        },
        completion: {
          completionItem: {
            snippetSupport: false,
          },
        },
        definition: {dynamicRegistration: false},
        codeAction: {
          codeActionLiteralSupport: {
            codeActionKind: {valueSet: ['quickfix', 'refactor', 'source']},
          },
        },
        signatureHelp: {dynamicRegistration: false},
      },
      workspaceFolders: [
        {
          uri: rootUri,
          name: 'playground',
        },
      ],
    },
  }
}
