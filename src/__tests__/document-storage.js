// @low

import DocumentStorage from '../document-storage'

const filePath = '/tmp/path'
const code = 'some random code'

test('Should store document', () => {
  const ds = new DocumentStorage()
  ds.add(filePath, code)

  expect(ds.get(filePath)).toBe(code)
})

test('Should remove document', () => {
  const ds = new DocumentStorage()
  ds.add(filePath, code)
  ds.remove(filePath)
  expect(ds.get(filePath)).toBeUndefined()
})
