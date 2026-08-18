import { javaAdvancedPath } from './paths/java-advanced'
import { javaSpringBootMapPath } from './paths/java-spring-boot-map'
import { springBootPath } from './paths/spring-boot'
import { springCorePath } from './paths/spring-core'
import {
  javaClassloadingModernLesson,
  javaCollectionsHashMapLesson,
  javaConcurrencyLesson,
  javaEqualsHashLesson,
  javaGcGenerationsLesson,
  javaGenericsLesson,
  javaMemoryGcLesson,
  javaStreamsOptionalLesson,
} from './lessons/java-advanced/index'
import { doINeedBootLesson } from './lessons/java-spring-boot-map/do-i-need-boot'
import { helloThreeWaysLesson } from './lessons/java-spring-boot-map/hello-three-ways'
import { annotationsGuideLesson } from './lessons/java-spring-boot-map/annotations-guide'
import { whatIsWhatLesson } from './lessons/java-spring-boot-map/what-is-what'
import {
  springAopProxiesLesson,
  springComponentScanLesson,
  springContextScopesLesson,
  springEnvironmentLesson,
  springInterviewPackLesson,
  springIocDiLesson,
} from './lessons/spring-core/index'
import {
  bootActuatorLesson,
  bootAutoConfigLesson,
  bootConfigLesson,
  bootDataTxLesson,
  bootInterviewTrapsLesson,
  bootSecurityLesson,
  bootTestingLesson,
  bootWebLesson,
} from './lessons/spring-boot/index'
import type { LanguageLesson, LanguagePath } from './types'

/** All Languages learning paths (suggested catalog order). */
export const languagePaths: LanguagePath[] = [
  javaSpringBootMapPath,
  javaAdvancedPath,
  springCorePath,
  springBootPath,
].sort((a, b) => a.order - b.order)

/** All lessons; sorted by path order then lesson order. */
export const languageLessons: LanguageLesson[] = [
  whatIsWhatLesson,
  helloThreeWaysLesson,
  annotationsGuideLesson,
  doINeedBootLesson,
  javaMemoryGcLesson,
  javaGcGenerationsLesson,
  javaConcurrencyLesson,
  javaEqualsHashLesson,
  javaGenericsLesson,
  javaStreamsOptionalLesson,
  javaClassloadingModernLesson,
  javaCollectionsHashMapLesson,
  springIocDiLesson,
  springContextScopesLesson,
  springComponentScanLesson,
  springAopProxiesLesson,
  springEnvironmentLesson,
  springInterviewPackLesson,
  bootAutoConfigLesson,
  bootConfigLesson,
  bootWebLesson,
  bootDataTxLesson,
  bootTestingLesson,
  bootActuatorLesson,
  bootSecurityLesson,
  bootInterviewTrapsLesson,
].sort((a, b) => {
  const pathA = languagePaths.find((p) => p.id === a.pathId)?.order ?? 0
  const pathB = languagePaths.find((p) => p.id === b.pathId)?.order ?? 0
  if (pathA !== pathB) return pathA - pathB
  return a.order - b.order
})

const lessonsById = Object.fromEntries(
  languageLessons.map((lesson) => [lesson.id, lesson]),
) as Record<string, LanguageLesson>

export function getLanguageLesson(id: string): LanguageLesson | undefined {
  return lessonsById[id]
}

export function lessonsForPath(pathId: string): LanguageLesson[] {
  return languageLessons.filter((lesson) => lesson.pathId === pathId)
}

export function pathTitle(pathId: string): string {
  return languagePaths.find((p) => p.id === pathId)?.title ?? pathId
}
