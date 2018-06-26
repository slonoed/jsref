// @flow
import {IConnection, TextDocuments} from 'vscode-languageserver'

export default class DocumentStorage {
  documents: TextDocuments

  constructor(connection: IConnection) {
    this.documents = new TextDocuments()
    this.documents.listen(connection)
  }

  get(fileUri: string) {
    return this.documents.get(fileUri).getText()
  }
}
