// @flow

import type {IConnection} from 'vscode-languageserver'

import {IPCMessageReader, IPCMessageWriter} from 'vscode-jsonrpc'
import {createConnection} from 'vscode-languageserver'
import {getLogger} from 'log4js'

import net from 'net'
import stream from 'stream'

export type ConnectionOptions =
  | {
      method: 'socket',
      port: number,
    }
  | {
      method: 'stdio',
    }
  | {
      method: 'node-ipc',
    }

export default function connectionFromOptions(method: string, port: ?number): IConnection {
  let reader: stream$Readable
  let writer: stream$Writable
  let server

  switch (method) {
    case 'socket':
      if (!port) {
        throw new Error('port required')
      }
      // For socket connection, the message connection needs to be
      // established before the server socket starts listening.
      // Do that, and return at the end of this block.
      writer = new stream.PassThrough()
      reader = new stream.PassThrough()
      server = net
        .createServer(socket => {
          server.close()
          socket.pipe(writer)
          reader.pipe(socket)
        })
        .listen(port)
      break
    case 'stdio':
      reader = process.stdin
      writer = process.stdout
      break
    case 'node-ipc':
    default:
      reader = new IPCMessageReader(process)
      writer = new IPCMessageWriter(process)
      break
  }

  return createConnection(reader, writer)
}
