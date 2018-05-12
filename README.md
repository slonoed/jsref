# jsref

_DEVELOPMENT STAGE. Code will be changed._

JavaScript refactoring language server

An idea behind this project is to have desirable refactoring experience for JavaScript without tying to any editor.

This tool implements [language server protocol][ls] (LSP) to avoid any direct binding to code editors.
This means each [editor with LSP support][ls-page] can use it.

It uses babylon parser to parse and generate JavaScript.

Tested with [vim-lsc][vim-lsc] on MacOS.

Alternatives considered
[js-refactor][js-refactor] — refactoring plugin for VScode. Works only with VSCode
[graspjs][grasp] — grep-like refactoring util. Does't have editor integrations.

[js-refactor]: https://github.com/cmstead/js-refactor/blob/master/package.json
[babylon]: https://github.com/babel/babel/tree/master/packages/babylon
[lsc]: https://github.com/natebosch/vim-lsc
[jtl]: https://github.com/sourcegraph/javascript-typescript-langserver/blob/master/src/plugins.ts
[grasp]: http://www.graspjs.com/
[ls]: https://microsoft.github.io/language-server-protocol/
[ls-page]: https://langserver.org/
[vim-lsc]: https://github.com/natebosch/vim-lsc/tree/master/after/plugin
