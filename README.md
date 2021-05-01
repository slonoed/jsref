# jsref

JavaScript refactoring language server

![Demo Animation](../assets/preview.gif?raw=true)

An idea behind this project is to have desirable refactoring experience for JavaScript without tying to any editor.

This tool implements [language server protocol][ls] (LSP) to avoid any direct binding to code editors.
This means any [editor with LSP support][ls-page] can use it.

It uses babylon parser to parse and generate JavaScript.

Supported refactorings:

- Convert explicit return to implicit
- Flip if-else
- Flip ternary expression
- Convert regular function to arrow function
- Convert implicit return to explicit
- Expand empty JSX tag
- Replace string literal with concatenation of strings
- Convert `require` to `import`

Experimental refactorings (can be removed in future):

- Disable Jest test (add '.skip')
- Enable Jest test (remove '.skip')
- Add '.only' to Jest test
- Remove '.only' from Jest test
- Use styled component form "styletron-react"

## Installation

Install globally via brew

```
brew install slonoed/tap/jsref
```

### Vim

Install [vim-lsc plugin][vim-lsc] and setup

```
Plug 'natebosch/vim-lsc'
let g:lsc_server_commands = {
\'javascript': 'jsref --stdio',
\'javascript.jsx': 'jsref --stdio',
\}
```

By default [vim-lsc][vim-lsc] adds `ga` shortcut for requesting code actions.

### [VSCode][vscode-jsref-marketplace]

_VSCode extension contains server and you don't need to install global one with `brew`._

Search in **Extensions** panel for `jsref` or install via CLI

`code-insiders --install-extension slonoed.jsref`

### Atom

[TBD][issue-atom]

_help needed_

### Sublime Text 3

Install **LSP** package from Package Control.

Add new client to LSP via `Preferences: LSP Setting`.

```
"jsref": {
  "command": ["jsref", "--stdio"],
	"scopes": ["source.js"],
	"syntaxes": [
		"Packages/babel-sublime/JavaScript (Babel).tmLanguage",
		"Packages/Babel/JavaScript (Babel).sublime-syntax",
		"Packages/JavaScript/JavaScript.sublime-syntax"
	],
	"languageId": "javascript",
},
```

Final config should look like this

```
{
  "clients": {
    "jref": {
      "command": ["jsref", "--stdio"],
      "scopes": ["source.js"],
      "syntaxes": [
        "Packages/babel-sublime/JavaScript (Babel).tmLanguage",
        "Packages/Babel/JavaScript (Babel).sublime-syntax",
        "Packages/JavaScript/JavaScript.sublime-syntax"
      ],
      "languageId": "javascript"
    }
  }
}
```

Enable language server via `LSP: Enable Language Server Globally` or `LSP: Enable Language Server in Project`

### Emacs

[TBD][issue-emacs]

_help needed_

## Plans

- More refactorings! If you need some specific, create an [issue][new-issue]

## Development

Install deps `npm i`

### coc.nvim extension

Build package `make coc-pack`

Add `set runtimepath^=~/THISREPO/build/coc/` to vimrc or run as command.

[Debug guide][coc-ls-debug]

### Debug VScode extension

Install LSP Inspector.
Run debug version with extension

```
make run-vscode
```

### Debug server

Run `jsbin` with `--lspi` flag and running inspector.

## Deploy

### Release npm package

```
make npm-publish
```

### Release coc packaged

```
make coc-publish
```

### Release brew tap (after npm release)

Install **noob** package

```
brew install zmwangx/npm-noob/noob
```

Publishing

```
make brew-publish
```

### Release vscode extension

```
make vscode-publish
```

## Contributing

You can easily contribute by creating new kinds of refactoring. A good example can be found [here][fixer-example]. To avoid duplication, create [an issue][new-issue] first.

[js-refactor]: https://github.com/cmstead/js-refactor/blob/master/package.json
[babylon]: https://github.com/babel/babel/tree/master/packages/babylon
[lsc]: https://github.com/natebosch/vim-lsc
[jtl]: https://github.com/sourcegraph/javascript-typescript-langserver/blob/master/src/plugins.ts
[grasp]: http://www.graspjs.com/
[ls]: https://microsoft.github.io/language-server-protocol/
[ls-page]: https://langserver.org/
[vim-lsc]: https://github.com/natebosch/vim-lsc/tree/master/after/plugin
[new-issue]: https://github.com/slonoed/jsref/issues/new
[issue-atom]: https://github.com/slonoed/jsref/issues/3
[issue-emacs]: https://github.com/slonoed/jsref/issues/10
[issue-sublime]: https://github.com/slonoed/jsref/issues/7
[fixer-example]: https://github.com/slonoed/jsref/blob/master/src/fixers/implicit-return-to-explicit.ts
[vscode-jsref-marketplace]: https://marketplace.visualstudio.com/items?itemName=slonoed.jsref
[coc-ls-debug]: https://github.com/neoclide/coc.nvim/wiki/Debug-language-server
