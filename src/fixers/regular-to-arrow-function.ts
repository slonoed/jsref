import { Fixer } from '../types'

const fix: Fixer = {
  id: 'regular-to-arrow-function',
  fix: ({ j, api }) => {
    const node = api.closestNode(j.FunctionExpression)

    if (!node || node.generator) {
      return null
    }

    const edit = () => {
      const isSingleReturnStatement =
        node.body.body.length === 1 && j.ReturnStatement.check(node.body.body[0])

      const body = isSingleReturnStatement
        ? (node.body.body[0] as any).argument ?? j.identifier('undefined')
        : j.blockStatement(node.body.body)

      const newNode = j.arrowFunctionExpression(node.params, body, false)
      newNode.async = node.async

      return api.replaceNode(node, newNode)
    }

    return {
      title: 'Convert to arrow function',
      edit,
    }
  },
}

export default fix
