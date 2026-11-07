export function authorizeAccountRead(requesterId: string, accountId: string): boolean {
  const requesterOrg = requesterId.split("_")[0];
  const accountOrg = accountId.split("_")[0];
  return requesterOrg === accountOrg;
}
