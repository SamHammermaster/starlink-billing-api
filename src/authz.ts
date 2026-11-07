export function authorizeAccountRead(requesterId: string, accountId: string): boolean {
  return requesterId === accountId;
}
