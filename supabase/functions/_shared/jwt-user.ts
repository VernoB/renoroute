export type JwtUser = { id: string };

export function bearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const match = header.match(/^Bearer\s+(\S+)/i);
  return match?.[1] ?? null;
}

export async function userFromAuthHeader(
  header: string | null,
  getUser: (jwt: string) => Promise<JwtUser | null>,
): Promise<JwtUser | null> {
  const token = bearerToken(header);
  if (!token) {
    return null;
  }
  return getUser(token);
}
