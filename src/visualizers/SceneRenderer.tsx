import type { Scene } from '../engine/types'
import { ArrayViz } from './ArrayViz'
import { GridViz } from './GridViz'
import { HashMapViz } from './HashMapViz'
import { HeapViz } from './HeapViz'
import { LinkedListViz } from './LinkedListViz'
import { QueueViz } from './QueueViz'
import { StackViz } from './StackViz'
import { TreeViz } from './TreeViz'
import './SceneRenderer.css'

type Props = {
  scene: Scene
}

/**
 * Picks the right visualizer for a step's scene.
 * Groups recurse so one step can show multiple structures side by side.
 */
export function SceneRenderer({ scene }: Props) {
  if (scene.type === 'group') {
    return (
      <div className="scene-group">
        {scene.children.map((child, index) => (
          <div key={`${child.type}-${index}`} className="scene-group__panel">
            <SceneRenderer scene={child} />
          </div>
        ))}
      </div>
    )
  }

  if (scene.type === 'array') return <ArrayViz scene={scene} />
  if (scene.type === 'hashmap') return <HashMapViz scene={scene} />
  if (scene.type === 'stack') return <StackViz scene={scene} />
  if (scene.type === 'queue') return <QueueViz scene={scene} />
  if (scene.type === 'heap') return <HeapViz scene={scene} />
  if (scene.type === 'linkedList') return <LinkedListViz scene={scene} />
  if (scene.type === 'grid') return <GridViz scene={scene} />
  return <TreeViz scene={scene} />
}
