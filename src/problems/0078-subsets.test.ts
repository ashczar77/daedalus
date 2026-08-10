import { describe, expect, it } from 'vitest'
import { subsets } from './0078-subsets'

function lineAt(source: string, lineNo: number): string {
  return source.replace(/\n$/, '').split('\n')[lineNo - 1]?.trim() ?? ''
}

describe('0078 subsets teaching beats', () => {
  const java = subsets.languages.java
  const kotlin = subsets.languages.kotlin
  const python = subsets.languages.python

  const parsed = subsets.input!.parse(subsets.input!.defaultRaw)
  if (!parsed.ok) throw new Error(parsed.errors.join('; '))
  const steps = subsets.input!.generateSteps(parsed.value)

  it('highlights path.add / path.remove source lines in every language', () => {
    const add = steps.find((step) => (step.narrative ?? '').includes('path.add(nums['))
    const remove = steps.find((step) => (step.narrative ?? '').includes('path.remove('))
    expect(add).toBeTruthy()
    expect(remove).toBeTruthy()

    expect(lineAt(java, add!.codeFocus.java)).toBe('path.add(nums[i]);')
    expect(lineAt(java, remove!.codeFocus.java)).toBe('path.remove(path.size() - 1);')

    expect(lineAt(kotlin, add!.codeFocus.kotlin)).toBe('path.add(nums[i])')
    expect(lineAt(kotlin, remove!.codeFocus.kotlin)).toBe('path.removeAt(path.lastIndex)')

    expect(lineAt(python, add!.codeFocus.python)).toBe('path.append(nums[i])')
    expect(lineAt(python, remove!.codeFocus.python)).toBe('path.pop()')
  })

  it('shows path as a stack with explicit ADD / REMOVE actions', () => {
    const add = steps.find((step) => (step.narrative ?? '').includes('path.add(nums['))!
    const remove = steps.find((step) => (step.narrative ?? '').includes('path.remove('))!
    const addPath = add.heap?.find((obj) => obj.id === 'path')
    const removePath = remove.heap?.find((obj) => obj.id === 'path')

    expect(addPath?.kind).toBe('stack')
    expect(removePath?.kind).toBe('stack')
    if (addPath?.kind === 'stack') {
      expect(addPath.label).toMatch(/^path · ADD /)
      expect(addPath.topAction).toBe('push')
    }
    if (removePath?.kind === 'stack') {
      expect(removePath.label).toMatch(/^path · REMOVE /)
      expect(removePath.topAction).toBe('pop')
    }
  })

  it('keeps heap object order stable across add/remove', () => {
    const add = steps.find((step) => (step.narrative ?? '').includes('path.add(nums['))!
    const remove = steps.find((step) => (step.narrative ?? '').includes('path.remove('))!
    expect(add.heap?.map((obj) => obj.id)).toEqual(['nums', 'path', 'result'])
    expect(remove.heap?.map((obj) => obj.id)).toEqual(['nums', 'path', 'result'])
  })
})
