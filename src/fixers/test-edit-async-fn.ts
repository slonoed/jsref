import { Fixer, FixerInput } from '../types'

const fix: Fixer = {
  id: 'test-edit-async-fn',
  fix: (input: FixerInput) => {
    const { params } = input
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
              newText: '// Comment added by "test-edit-asyn-fn"\n',
            },
          ],
        },
      }
    }

    return {
      title: 'Add comment by async function',
      edit,
    }
  },
}
export default fix
