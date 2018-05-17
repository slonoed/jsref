# jsref

JavaScript refactoring language server

![Demo Animation](../assets/preview.gif?raw=true)

An idea behind this project is to have desirable refactoring experience for JavaScript without tying to any editor.

This tool implements [language server protocol][ls] (LSP) to avoid any direct binding to code editors.
This means any [editor with LSP support][ls-page] can use it.

It uses babylon parser to parse and generate JavaScript.

Supported refactorings:

* Convert arrow function to regular function
* Convert regular function to arrow function
* Convert explicit return to implicit
* Convert implicit return to explicit
* Convert React function to class

## Installation

This plugin requires NodeJS >8 and NPM.

### Vim

Install package globally via
```
npm i -g @slonoed/jsref
```

Executable `jsref` should be available in the PATH.

Install [vim-lsc plugin][vim-lsc] and setup plugin
```
Plug 'natebosch/vim-lsc'
let g:lsc_server_commands = {
\'javascript': 'jsref --stdio',
\'javascript.jsx': 'jsref --stdio',
\}
```

### VSCode

[TBD][issue-vscode]

### Atom

[TBD][issue-atom]

## Contributing

Start with a [new issue][new-issue] ;)

[js-refactor]: https://github.com/cmstead/js-refactor/blob/master/package.json
[babylon]: https://github.com/babel/babel/tree/master/packages/babylon
[lsc]: https://github.com/natebosch/vim-lsc
[jtl]: https://github.com/sourcegraph/javascript-typescript-langserver/blob/master/src/plugins.ts
[grasp]: http://www.graspjs.com/
[ls]: https://microsoft.github.io/language-server-protocol/
[ls-page]: https://langserver.org/
[vim-lsc]: https://github.com/natebosch/vim-lsc/tree/master/after/plugin
[new-issue]: https://github.com/slonoed/jsref/issues/new
[issue-vscode]: https://github.com/slonoed/jsref/issues/2
[issue-atom]: https://github.com/slonoed/jsref/issues/3
