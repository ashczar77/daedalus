import type { Scene } from '../engine/types'
import { ArrayViz } from './ArrayViz'
import { HashMapViz } from './HashMapViz'
import { StackViz } from './StackViz'
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

  if (scene.type === 'array') {
    return <ArrayViz scene={scene} />
  }

  if (scene.type === 'hashmap') {
    return <HashMapViz scene={scene} />
  }

  return <StackViz scene={scene} />
}
