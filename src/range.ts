import * as p from './pos'
import * as ls from 'vscode-languageserver'

export type t = {
  readonly start: p.t
  readonly end: p.t
}

export function create(sl: number, sc: number, el: number, ec: number): t {
  return {
    start: p.create(sl, sc),
    end: p.create(el, ec),
  }
}

export function fromProtocolRange(range: ls.Range): t {
  return {
    start: p.fromProtocol(range.start),
    end: p.fromProtocol(range.end),
  }
}

export function toProtocol(range: t): ls.Range {
  return {
    start: p.toProtocol(range.start),
    end: p.toProtocol(range.end),
  }
}

// | ---- outer ----|
//   | -- inner --|
export function isInside(inner: t, outer: t): boolean {
  return p.isAfterOrSame(inner.start, outer.start) && p.isBeforeOrSame(inner.end, outer.end)
}
export function isInsideStrict(inner: t, outer: t): boolean {
  return p.isAfter(inner.start, outer.start) && p.isBefore(inner.end, outer.end)
}

export function format(r: t): string {
  return `${r.start.line}:${r.start.column}-${r.end.line}:${r.end.column}`
}
