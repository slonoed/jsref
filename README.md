ConConfig

```
{
  "languageserver": {
    "jsreftest": {
      "trace.server.verbosity": "verbose",
      "module": "~/_repos/jsref/build/js/run.js",
      "args": ["--node-ipc"],
      "filetypes": ["javascript", "typescript"],
      "trace.server": "verbose",
      "rootPatterns": ["package.json"],
      // Used for debugging NodeJS
      "execArgv": ["--nolazy", "--inspect-brk=6045"],
      "initializationOptions": {
        "folders": ["~/_repos/jsref/dev/fixers"]
      },
      "settings": {
        "validate": true
      }
    }
  }
}
```

vim

```
nmap <silent>ga <Plug>(coc-codeaction-cursor)
nmap tt :CocRestart<cr>
```

# Development

## Working on fixer packages locally

Create package with name "jsref-fixer-something" or "@something/jsref-fixer-somethingelse".
Run `npm link` inside that package.
Run `npm i -g PACKAGENAME`
