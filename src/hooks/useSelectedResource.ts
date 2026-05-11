export function resolveNextSelectedResourceId(currentResourceId: string | null, requestedResourceId: string): string | null {
  return currentResourceId === requestedResourceId ? null : requestedResourceId;
}
