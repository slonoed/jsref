import { CallExpression, Identifier, JSCodeshift } from 'jscodeshift'
import { Fixer } from '../types'

const jestFnNames = ['it', 'test']

function isJestFn(j: JSCodeshift, node: CallExpression) {
  return j.Identifier.check(node.callee) && jestFnNames.includes(node.callee.name)
}

const fix: Fixer = {
  id: 'jest-skip-test',
  fix: ({ j, api }) => {
    const node = api.closestNode(j.CallExpression, (n) => isJestFn(j, n))

    if (!node) {
      return null
    }

    const id = node.callee as Identifier
    const edit = () => {
      const newNode = j.memberExpression(id, j.identifier('skip'))
      return api.replaceNode(node.callee, newNode)
    }

    return {
      title: `Use ${id.name}.skip`,
      edit,
    }
  },
}

export default fix
