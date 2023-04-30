import { Fixer } from '../types'

const fix: Fixer = {
  id: 'flip-if-else',
  fix: ({ j, api }) => {
    const node = api.closestNode(j.IfStatement)

    if (!node) {
      return null
    }

    const edit = () => {
      const test = api.negateExpression(node.test)
      const consequent = node.consequent
      const alternate = node.alternate || j.blockStatement([])

      const newNode = j.ifStatement(test, alternate, consequent)

      return api.replaceNode(node, newNode)
    }

    return {
      title: 'Flip if-else',
      edit,
    }
  },
}

export default fix
