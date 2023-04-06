import { Fixer } from '../types'

const fix: Fixer = {
  id: 'flip-ternary',
  fix: ({ j, api }) => {
    const node = api.closestNode(j.ConditionalExpression)

    if (!node) {
      return null
    }

    const consequent = node.consequent
    const alternate = node.alternate
    const test = api.negateExpression(node.test)
    const newNode = j.conditionalExpression(test, alternate, consequent)
    const edit = api.replaceNode(node, newNode)

    return {
      title: 'Flip ternary',
      edit,
    }
  },
}

export default fix
