import {Fixer} from './types'
import {
  CodeActionParams,
  Command,
  ExecuteCommandParams,
  ApplyWorkspaceEditParams,
  TextDocuments,
} from 'vscode-languageserver'
import * as fs from 'fs-extra'
import * as path from 'path'
import AstService from './ast-service'
import * as Range from './range'
import * as Patch from './patch'
import {Logger} from './logger'

export type AstRoot = any

const fixersPath = path.join(__dirname, './fixers')
const fullPath = (fileName: string) => path.join(fixersPath, fileName)

export default class FixerService {
  private fixers: Map<string, Fixer<any>>
  private astService: AstService

  constructor(private documents: TextDocuments, private logger: Logger) {
    this.fixers = new Map()
    this.astService = new AstService(this.documents, this.logger)
  }

  async start() {
    this.fixers = await this.loadFixers()
    if (this.fixers.size < 1) {
      this.logger.log('No fixers loaded')
    }
  }

  getAvailableCommands(): string[] {
    return [...this.fixers.keys()]
  }

  suggestCodeActions(params: CodeActionParams): Command[] {
    const {uri} = params.textDocument
    const jscodeshift = this.astService.getCodeShift(uri)
    if (!jscodeshift) {
      this.logger.error('No codeshift found for file ' + uri)
      return []
    }
    const ast = this.astService.getAstTree(uri)
    if (!ast) {
      this.logger.error('Can not build ast for file ' + uri)
      return []
    }
    const selection = Range.fromProtocolRange(params.range)
    const opts = {
      ast,
      j: jscodeshift,
      selection,
      logger: this.logger,
    }

    const actions = []

    for (const [id, f] of this.fixers.entries()) {
      const suggested = f.suggestCodeAction(opts)
      if (suggested) {
        actions.push({
          command: id,
          title: suggested.title,
          arguments: [{uri}, suggested.data],
        })
      }
    }

    return actions
  }

  createEdit(params: ExecuteCommandParams): ApplyWorkspaceEditParams | null {
    if (!params.arguments) {
      return null
    }
    const uri = params.arguments[0].uri as string
    const fixer = this.fixers.get(params.command)

    if (!fixer) {
      this.logger.error(`Fixer ${params.command} does not exist`)
      return null
    }

    const jscodeshift = this.astService.getCodeShift(uri)
    if (!jscodeshift) {
      return null
    }
    const ast = this.astService.getAstTree(uri)
    if (!ast) {
      return null
    }
    const createEditParams = {
      ast,
      j: jscodeshift,
      data: params.arguments[1],
    }
    const edit = fixer.createEdit(createEditParams)

    if (!edit) {
      return null
    }

    const patches = edit instanceof Array ? edit : [edit]

    return {
      label: params.command,
      edit: {
        changes: {
          [uri]: patches.map(Patch.toTextEdit),
        },
      },
    }
  }

  private async loadFixers(): Promise<Map<string, Fixer<any>>> {
    const allFileNames: string[] = await fs.readdir(fixersPath)
    const names = await Promise.all(allFileNames.map(f => this.filterJsFileName(f)))

    const fixers = new Map()
    names
      .filter(f => f)
      .map(n => this.parseFixer(n as string))
      .filter(f => f)
      .forEach(([id, fixer]) => {
        fixers.set(id, fixer)
      })

    return fixers
  }

  private async filterJsFileName(fileName: string): Promise<string | null> {
    if (!fileName.match(/\.js$/)) {
      return null
    }
    const stat = await fs.lstat(path.join(fixersPath, fileName))
    return stat.isFile() ? fileName : null
  }

  private parseFixer(fileName: string): [string, Fixer<any>] | null {
    let fixer
    try {
      fixer = require(fullPath(fileName))
    } catch (e) {
      this.logger.error("Can't load " + fileName + ' fixer')
      return null
    }

    if (!fixer) {
      this.logger.error('No export from fixer: ' + fileName)
      return null
    }

    // Handle es6 modules
    if (fixer.default) {
      fixer = fixer.default
    }
    const {suggestCodeAction, createEdit}: Fixer<any> = fixer

    if (!suggestCodeAction || typeof suggestCodeAction !== 'function') {
      this.logger.error('Fixer ' + fileName + ' should implement suggestCodeAction')
      return null
    }

    if (!createEdit || typeof createEdit !== 'function') {
      this.logger.error('Fixer ' + fileName + ' should implement createEdit')
      return null
    }

    const name = path.basename(fileName, path.extname(fileName))

    return [
      name,
      {
        suggestCodeAction: suggestCodeAction,
        createEdit: createEdit,
      },
    ]
  }
}
