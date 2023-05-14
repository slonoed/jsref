import { CallExpression, JSCodeshift } from 'jscodeshift'
import { Fixer } from '../types'

const jestFnNames = ['it', 'test']
const modifiers = ['only', 'skip']

function isCallWithModifier(j: JSCodeshift, node: CallExpression) {
  return (
    j.MemberExpression.check(node.callee) &&
    j.Identifier.check(node.callee.object) &&
    jestFnNames.includes(node.callee.object.name) &&
    j.Identifier.check(node.callee.property) &&
    modifiers.includes(node.callee.property.name)
  )
}

const fix: Fixer = {
  id: 'jest-remove-modifier',
  fix: ({ j, api }) => {
    const node = api.closestNode(j.CallExpression, (n) => isCallWithModifier(j, n))

    if (!node) {
      return null
    }

    const fnName = (node.callee as any).object.name
    const modifierName = (node.callee as any).property.name

    const edit = () => {
      const newNode = j.identifier(fnName)
      return api.replaceNode(node.callee, newNode)
    }

    return {
      title: `Remove .${modifierName} from ${fnName}`,
      edit,
    }
  },
}

export default fix
