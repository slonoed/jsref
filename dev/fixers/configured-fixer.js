module.exports = {
  id: 'configured-fixer',
  fix: (params) => {
    return {
      title: 'Use configured fixer',
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
              newText: '// Comment added by "configured fixer"\n',
            },
          ],
        },
      },
    }
  },
}
