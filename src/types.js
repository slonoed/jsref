// @flow

import type {Node} from 'babylon-types'
import type {ICommand, ILocation, IPosition} from 'vscode-languageserver-types'
import type {Logger} from 'log4js'

import type DocumentStorage from './document-storage'
import type AstHelper from './ast-helper'

export interface Fixer {
  +type: string;

  suggestCommands(location: ILocation): ICommand[];
  createEdit(...args: any[]): WorkspaceEdit;
}

export type FixerOptions = {
  documentStorage: DocumentStorage,
  astHelper: AstHelper,
}
