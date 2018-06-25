// @flow
import RequireToImport from '../require-to-import'
import {createMock} from './utils'

const mock = createMock(RequireToImport)

test('should suggest fix for const', () => {
  const code = `const fs = require('fs')`
  const commands = mock.suggest(code, 0, 15)

  expect(commands.length).toBe(1)
  expect(commands[0].command).toBe('require_to_import')
  expect(commands[0].title).toBe('Convert to import')
})

test('should transform to simple import', () => {
  const code = `const fs = require('fs')`
  const edit = mock.edit(0, code, 0, 15)

  const expected = "import fs from 'fs'"

  expect(edit).toEqual({
    changes: {
      'file://testfile.js': [
        {
          newText: expected,
          range: {end: {character: 24, line: 0}, start: {character: 0, line: 0}},
        },
      ],
    },
  })
})

//test('should transform with body', () => {
//const code = `const foo = () => { return 1 }`
//const edit = mock.edit(0, code, 0, 15)

//const expected = `function foo() {
//return 1
//}`

//expect(edit).toEqual({
//changes: {
//'file://testfile.js': [
//{
//newText: expected,
//range: {end: {character: 30, line: 0}, start: {character: 0, line: 0}},
//},
//],
//},
//})
//})

//test('should copy param', () => {
//const code = `const foo = (a) => { return a }`
//const edit = mock.edit(0, code, 0, 15)

//const expected = `function foo(a) {
//return a
//}`

//expect(edit).toEqual({
//changes: {
//'file://testfile.js': [
//{
//newText: expected,
//range: {end: {character: 31, line: 0}, start: {character: 0, line: 0}},
//},
//],
//},
//})
//})

//test('should copy params', () => {
//const code = `const foo = (a, {title = 1}) => { return a }`
//const edit = mock.edit(0, code, 0, 15)

//const expected = `function foo(a, { title = 1 }) {
//return a
//}`

//expect(edit).toEqual({
//changes: {
//'file://testfile.js': [
//{
//newText: expected,
//range: {end: {character: 44, line: 0}, start: {character: 0, line: 0}},
//},
//],
//},
//})
//})

//test('should use const name', () => {
//const code = `const foo = () => 1`
//const edit = mock.edit(0, code, 0, 15)

//const expected = `function foo() {
//return 1
//}`

//expect(edit).toEqual({
//changes: {
//'file://testfile.js': [
//{
//newText: expected,
//range: {end: {character: 19, line: 0}, start: {character: 0, line: 0}},
//},
//],
//},
//})
//})

//test('should not use const name if expression', () => {
//const code = `console.log(() => 1)`
//const edit = mock.edit(0, code, 0, 15)

//const expected = `function replace_me_name() {
//return 1
//}`

//expect(edit).toEqual({
//changes: {
//'file://testfile.js': [
//{
//newText: expected,
//range: {end: {character: 19, line: 0}, start: {character: 12, line: 0}},
//},
//],
//},
//})
//})

//test('should replace declaration', () => {
//const code = `import React from 'react'

//const Page = () => {
//return <div>{test}</div>
//}
//`
//const edit = mock.edit(0, code, 3, 15)

//const expected = `function Page() {
//return <div>{test}</div>
//}`

//expect(edit).toEqual({
//changes: {
//'file://testfile.js': [
//{
//newText: expected,
//range: {end: {character: 1, line: 4}, start: {character: 0, line: 2}},
//},
//],
//},
//})
//})
