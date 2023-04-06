import { Fixer } from '../types'

const fix: Fixer = {
  id: 'implicit-return-to-explicit',
  fix: ({ j, api }) => {
    const node = api.closestNode(j.ArrowFunctionExpression)

    if (!node) {
      return null
    }

    const body = node.body
    if (j.BlockStatement.check(body)) {
      return null
    }

    const edit = () => {
      const newNode = j.arrowFunctionExpression(
        node.params,
        j.blockStatement([j.returnStatement(body)]),
        false
      )
      newNode.async = node.async

      return api.replaceNode(node, newNode)
    }

    return {
      title: 'Use explicit return',
      edit,
    }
  },
}

export default fix
