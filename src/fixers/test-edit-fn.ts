import { Fixer, FixerInput } from '../types'

const fix: Fixer = {
  id: 'test-edit-fn',
  fix: ({ params }: FixerInput) => {
    function edit() {
      return {
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
              newText: '// Comment added by "test-edit-fn"\n',
            },
          ],
        },
      }
    }

    return {
      title: 'Add comment by function',
      edit,
    }
  },
}
export default fix
