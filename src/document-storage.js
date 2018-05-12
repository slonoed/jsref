// @low

export default class DocumentStorage {
  docs: Map<string, string>

  constructor() {
    this.docs = new Map()
  }

  get(fileUri) {
    return this.docs.get(fileUri)
  }

  add(fileUri, code) {
    this.docs.set(fileUri, code)
  }

  remove(fileUri) {
    this.docs.delete(fileUri)
  }
}
