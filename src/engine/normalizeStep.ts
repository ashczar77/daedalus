import type {
  CallFrame,
  HeapObject,
  NormalizedStep,
  Scene,
  Step,
} from './types'

/**
 * Convert a curated (or legacy) Step into the storytelling memory model.
 * Older packs that only have `scene` + `variables` still play via this adapter.
 */
export function normalizeStep(step: Step): NormalizedStep {
  const narrative = step.narrative ?? step.message ?? 'Working…'
  const why = step.why

  if (step.callStack && step.heap) {
    return {
      id: step.id,
      narrative,
      why,
      codeFocus: step.codeFocus,
      callStack: markActiveFrame(step.callStack),
      heap: step.heap,
    }
  }

  const heap = step.heap ?? sceneToHeap(step.scene)
  const callStack =
    step.callStack ??
    ([
      {
        name: 'solution',
        locals: step.variables ?? {},
        active: true,
      },
    ] satisfies CallFrame[])

  return {
    id: step.id,
    narrative,
    why,
    codeFocus: step.codeFocus,
    callStack: markActiveFrame(callStack),
    heap,
  }
}

function markActiveFrame(frames: CallFrame[]): CallFrame[] {
  if (frames.length === 0) return frames
  if (frames.some((frame) => frame.active)) return frames
  return frames.map((frame, index) =>
    index === frames.length - 1 ? { ...frame, active: true } : frame,
  )
}

/** Flatten a legacy Scene into heap objects so animations still render. */
function sceneToHeap(scene: Scene | undefined): HeapObject[] {
  if (!scene) return []

  if (scene.type === 'group') {
    return scene.children.flatMap((child, index) =>
      sceneNodeToHeap(child, `obj-${index}`),
    )
  }

  return sceneNodeToHeap(scene, 'obj-0')
}

function sceneNodeToHeap(scene: Scene, id: string): HeapObject[] {
  if (scene.type === 'group') {
    return scene.children.flatMap((child, index) =>
      sceneNodeToHeap(child, `${id}-${index}`),
    )
  }

  if (scene.type === 'array') {
    return [
      {
        id,
        kind: 'array',
        label: scene.label,
        values: scene.values,
        highlights: scene.highlights,
        pointers: scene.pointers,
        display: scene.display,
        metrics: scene.metrics,
        focused: Boolean(scene.highlights?.length || scene.pointers),
      },
    ]
  }

  if (scene.type === 'hashmap') {
    return [
      {
        id,
        kind: 'hashmap',
        label: scene.label,
        entries: scene.entries,
        focusKeys: scene.focusKeys,
        focused: Boolean(scene.focusKeys?.length),
      },
    ]
  }

  if (scene.type === 'stack') {
    return [
      {
        id,
        kind: 'stack',
        label: scene.label,
        items: scene.items,
        topAction: scene.topAction,
        focused: Boolean(scene.topAction),
      },
    ]
  }

  if (scene.type === 'queue') {
    return [
      {
        id,
        kind: 'queue',
        label: scene.label,
        items: scene.items,
        frontAction: scene.frontAction,
        focused: Boolean(scene.frontAction),
      },
    ]
  }

  if (scene.type === 'linkedList') {
    return [
      {
        id,
        kind: 'linkedList',
        label: scene.label,
        nodes: scene.nodes,
        pointers: scene.pointers,
        cycleTo: scene.cycleTo,
        focusIds: scene.focusIds,
        caption: scene.caption,
        focused: Boolean(scene.focusIds?.length || scene.pointers),
      },
    ]
  }

  return [
    {
      id,
      kind: 'tree',
      label: scene.label,
      nodes: scene.nodes,
      rootId: scene.rootId,
      focusIds: scene.focusIds,
      viz: scene.viz,
      focused: Boolean(scene.focusIds?.length),
    },
  ]
}
