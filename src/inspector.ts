// Helps to connect to LSP Inspector.
import {Readable, Writable, Transform, Stream} from 'stream'
import * as WebSocket from 'ws'
import * as Logger from './logger'

type t = {
  input: Readable
  output: Writable
}

export function connect(input: Readable, output: Writable): t {
  const port = 7000
  let socket: WebSocket
  try {
    socket = new WebSocket(`ws://localhost:${port}`)
  } catch (e) {
    throw new Error(`Can't connect to LSP Inspector on port ${port}`)
  }
  const wrappedInput = createLogableStream(input, socket, msg =>
    msg.id ? 'send-request' : 'send-notification'
  )
  const wrappedOutput = createLogableStream(output, socket, msg =>
    msg.id && msg.result === undefined ? 'recv-request' : 'recv-response'
  )

  input.pipe(wrappedInput)
  wrappedOutput.pipe(output)

  return {
    input: wrappedInput,
    output: wrappedOutput,
  }
}
type formatType = (msg: any) => string

function createLogableStream(source: Stream, socket: WebSocket, formatType: formatType): Transform {
  let incommingText = ''
  return new Transform({
    transform(chunk, encoding, callback) {
      incommingText += String(chunk)
      if (socket.readyState === WebSocket.OPEN) {
        const messageParts = incommingText.split('\r\n\r\n')
        if (messageParts.length) {
          const messageText = messageParts[messageParts.length - 1]
          try {
            const message = JSON.parse(messageText)
            incommingText = ''
            const logEntry = {
              isLSPMessage: true,
              type: formatType(message),
              message: message,
              timestamp: Date.now(),
            }
            socket.send(`[LSP   - 0:00:00 PM] ${JSON.stringify(logEntry)}\r\n`)
          } catch (e) {}
        }
      }
      callback(null, chunk)
    },
  })
}
