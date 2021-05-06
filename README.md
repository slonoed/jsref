# jsref

JavaScript refactoring language server

![Demo Animation](../assets/preview.gif?raw=true)

An idea behind this project is to have desirable refactoring experience for JavaScript (JSX, TypeScript, Flowtype)
without tying to any editor.

This tool implements [language server protocol][ls] (LSP) to avoid any direct binding to code editors.
This means any [editor with LSP support][ls-page] can use it.

It uses babylon parser to parse and generate JavaScript.

Supported refactorings:

<table>
  <tr>
    <th>Refactoring</th>
    <th>Code before</th>
    <th>Code after</th>
  <tr>
  <tr>
  <td>const arrow to function declaration</td>
  <td>
    <pre><code>const a = () =&gt; { return 1; }</code></pre>
  </td>
  <td>
    <pre><code>function a() { return 1; }</code></pre>
  </td>
</tr>
<tr>
  <td>experimental jest only test</td>
  <td>
    <pre><code>it(&#039;hello&#039;, () =&gt; {})</code></pre>
  </td>
  <td>
    <pre><code>it.only(&#039;hello&#039;, () =&gt; {})</code></pre>
  </td>
</tr>
<tr>
  <td>experimental jest revert only</td>
  <td>
    <pre><code>it.only(&#039;hello&#039;, () =&gt; {})</code></pre>
  </td>
  <td>
    <pre><code>it(&#039;hello&#039;, () =&gt; {})</code></pre>
  </td>
</tr>
<tr>
  <td>experimental jest revert skip test</td>
  <td>
    <pre><code>it.skip(&quot;s&quot;, () =&gt; { hello(); })</code></pre>
  </td>
  <td>
    <pre><code>it(&quot;s&quot;, () =&gt; { hello(); })</code></pre>
  </td>
</tr>
<tr>
  <td>experimental jest skip test</td>
  <td>
    <pre><code>it(&quot;s&quot;, () =&gt; { hello(); })</code></pre>
  </td>
  <td>
    <pre><code>it.skip(&quot;s&quot;, () =&gt; { hello(); })</code></pre>
  </td>
</tr>
<tr>
  <td>experimental use styled component</td>
  <td>
    <pre><code>import r from &#039;r-dom&#039;

const A = () =&gt; {
  return r.div()
}</code></pre>
  </td>
  <td>
    <pre><code>import r from &#039;r-dom&#039;
import { styled } from &quot;styletron-react&quot;;

const StyledDiv = styled(&quot;div&quot;, {});

const A = () =&gt; {
  return r(StyledDiv)
}</code></pre>
  </td>
</tr>
<tr>
  <td>explicit return to implicit</td>
  <td>
    <pre><code>() =&gt; { return test() }</code></pre>
  </td>
  <td>
    <pre><code>() =&gt; test()</code></pre>
  </td>
</tr>
<tr>
  <td>extract return</td>
  <td>
    <pre><code>return a + b</code></pre>
  </td>
  <td>
    <pre><code>const result = a + b;

return result;</code></pre>
  </td>
</tr>
<tr>
  <td>flip if else</td>
  <td>
    <pre><code>if (a) {
  b()
} else {
  c()
}</code></pre>
  </td>
  <td>
    <pre><code>if (!a) {
  c()
} else {
  b()
}</code></pre>
  </td>
</tr>
<tr>
  <td>flip ternary</td>
  <td>
    <pre><code>a ? b : c</code></pre>
  </td>
  <td>
    <pre><code>!a ? c : b</code></pre>
  </td>
</tr>
<tr>
  <td>function to arrow</td>
  <td>
    <pre><code>const a = function () { return 1; }</code></pre>
  </td>
  <td>
    <pre><code>const a = () =&gt; { return 1; }</code></pre>
  </td>
</tr>
<tr>
  <td>implicit return to explicit</td>
  <td>
    <pre><code>const foo = () =&gt; hello()</code></pre>
  </td>
  <td>
    <pre><code>const foo = () =&gt; {
    return hello();
}</code></pre>
  </td>
</tr>
<tr>
  <td>jsx expand empty tag</td>
  <td>
    <pre><code>&lt;input/&gt;</code></pre>
  </td>
  <td>
    <pre><code>&lt;input&gt;&lt;/input&gt;</code></pre>
  </td>
</tr>
<tr>
  <td>replace with concatenation</td>
  <td>
    <pre><code>`hello ${a}`</code></pre>
  </td>
  <td>
    <pre><code>&quot;hello &quot; + a</code></pre>
  </td>
</tr>
<tr>
  <td>require to import</td>
  <td>
    <pre><code>const a = require(&#039;b&#039;)</code></pre>
  </td>
  <td>
    <pre><code>import a from &quot;b&quot;;</code></pre>
  </td>
</tr>
</table>

## Installation

### Vim and Neovim (via coc.nvim)

1. Install [coc.nvim plugin][coc-nvim-repo]
2. Run `:CocInstall coc-jsref`
3. Configure hotkeys. For example to use `ga`:

```
nmap ga <Plug>(coc-codeaction-cursor)
xmap ga <Plug>(coc-codeaction-selected)
```

### [VSCode][vscode-jsref-marketplace]

_VSCode extension contains server and you don't need to install global one with `brew`._

Search in **Extensions** panel for `jsref` or install via CLI

`code --install-extension slonoed.jsref`

### Sublime Text 3

Install **jsref** language binary via brew

```
brew install slonoed/tap/jsref
```

or npm

```
npm i -g @slonoed/jsref
```

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
    "jsref": {
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

### Other editors

All other editors are supported via standard plugins for language servers.

jsref language server can be installed via brew

```
brew install slonoed/tap/jsref
```

or npm

```
npm i -g @slonoed/jsref
```

_Help needed to add instructions for other editors._


## Plans

- Ability to create custom refactorings (per user and per workspace)
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
[coc-nvim-repo]: https://github.com/neoclide/coc.nvim
