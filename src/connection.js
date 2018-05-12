// @flow
import {IConnection} from 'vscode-languageserver'

export function showMessage(connection: IConnection, message: string) {
  const notification = {
    type: 'window/showMessage',
    message,
  }
  connection.sendNotification(notification.type, notification)
}

export function logMessage(connection: IConnection, message: string) {
  const notification = {
    type: 'window/logMessage',
    message,
  }
  connection.sendNotification(notification.type, notification)
}
