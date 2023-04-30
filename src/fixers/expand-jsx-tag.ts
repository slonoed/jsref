import { Fixer } from '../types'

const fix: Fixer = {
  id: 'expand-jsx-tags',
  fix: ({ j, api }) => {
    const node = api.closestNode(j.JSXElement)

    if (!node || !node.openingElement.selfClosing) {
      return null
    }

    const edit = () => {
      const openingElement = j.jsxOpeningElement(
        node.openingElement.name,
        node.openingElement.attributes,
        false
      )
      const closingElement = j.jsxClosingElement(node.openingElement.name)

      const newNode = j.jsxElement(openingElement, closingElement, [])

      return api.replaceNode(node, newNode)
    }

    return {
      title: 'Expand JSX tags',
      edit,
    }
  },
}

export default fix
