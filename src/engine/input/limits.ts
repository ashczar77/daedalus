/** Soft ceiling so freeform inputs cannot explode the player. */
export const DEFAULT_MAX_STEPS = 40

/**
 * If a generator would emit too many frames, callers should stop and
 * surface a parse-time or generate-time error instead.
 */
export function exceedsStepBudget(
  stepCount: number,
  maxSteps: number = DEFAULT_MAX_STEPS,
): boolean {
  return stepCount > maxSteps
}
