import { Fixer, FixerInput } from '../types'

const fix: Fixer = {
  id: 'test-edit-obj',
  fix: ({ params }: FixerInput) => {
    return {
      title: 'Add comment by object',
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
              newText: '// Comment added by "test-edit-obj"\n',
            },
          ],
        },
      },
    }
  },
}

export default fix
