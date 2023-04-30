import { Fixer } from '../types'

const fix: Fixer = {
  id: 'arrow-to-regular-function',
  fix: ({ j, api }) => {
    const node = api.closestNode(j.ArrowFunctionExpression)

    if (!node) {
      return null
    }

    const edit = () => {
      const newNode = j.functionExpression(
        null, // id
        node.params,
        node.body.type === 'BlockStatement'
          ? node.body
          : j.blockStatement([j.returnStatement(node.body)]),
        false, // generator
        false
      )
      newNode.async = node.async

      return api.replaceNode(node, newNode)
    }

    return {
      title: 'Convert to regular function',
      edit,
    }
  },
}

export default fix
