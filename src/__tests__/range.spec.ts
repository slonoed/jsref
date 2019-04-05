import * as Range from '../range'

describe('.create', () => {
  it('from numbers', () => {
    const r = Range.create(1, 2, 3, 4)

    expect(r).toEqual({
      start: {line: 1, column: 2},
      end: {line: 3, column: 4},
    })
  })
})

describe('.fromProtocolRange', () => {
  it('simple', () => {
    const r = Range.fromProtocolRange({
      start: {line: 1, character: 2},
      end: {line: 1, character: 2},
    })

    expect(r).toEqual({
      start: {line: 2, column: 2},
      end: {line: 2, column: 2},
    })
  })
})

describe('.toProtocol', () => {
  it('simple', () => {
    const r = Range.create(1, 2, 3, 4)

    expect(Range.toProtocol(r)).toEqual({
      start: {line: 0, character: 2},
      end: {line: 2, character: 4},
    })
  })
})

describe('.isInside', () => {
  it('true for inner inside outer', () => {
    const inner = Range.create(1, 5, 1, 8)
    const outer = Range.create(1, 3, 1, 9)

    expect(Range.isInside(inner, outer)).toBe(true)
  })
  it('false for inner outside outer', () => {
    const inner = Range.create(1, 5, 1, 8)
    const outer = Range.create(1, 3, 1, 7)

    expect(Range.isInside(inner, outer)).toBe(false)
  })
})
