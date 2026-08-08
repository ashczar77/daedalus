/** Build linked-list heap nodes from values (ids n1..nK). */
export function listNodesFromValues(
  values: number[],
): Array<{ id: string; value: number; next: string | null }> {
  return values.map((value, index) => ({
    id: `n${index + 1}`,
    value,
    next: index + 1 < values.length ? `n${index + 2}` : null,
  }))
}

export function listNodeId(index: number): string {
  return `n${index + 1}`
}
