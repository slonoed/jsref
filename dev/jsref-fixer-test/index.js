// Used to test package fixers. Run "npm link" to get it into global
module.exports = [
  {
    id: 'package-fixer',
    fix: (params) => {
      return {
        title: 'Use package fixer',
        edit: {
          changes: {
            [params.textDocument.uri]: [
              {
                range: {
                  start: {
                    line: 0,
                    character: 0,
                  },
                  end: {
                    line: 0,
                    character: 0,
                  },
                },
                newText: '// Comment added by "package fixer"\n',
              },
            ],
          },
        },
      }
    },
  },
]
