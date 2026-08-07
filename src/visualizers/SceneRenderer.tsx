import type { Scene } from '../engine/types'
import { ArrayViz } from './ArrayViz'
import { HashMapViz } from './HashMapViz'
import './SceneRenderer.css'

type Props = {
  scene: Scene
}

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

  return <HashMapViz scene={scene} />
}
