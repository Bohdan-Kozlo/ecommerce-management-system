export function parseJwtExpirationToDate(expiresIn: string): Date {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(
      `Invalid JWT expiration format: "${expiresIn}". Expected format: number followed by s/m/h/d (e.g., "7d", "24h", "60m", "3600s")`,
    );
  }

  const [, value, unit] = match;
  const duration = parseInt(value!, 10);
  const now = new Date();

  switch (unit) {
    case 's':
      return new Date(now.getTime() + duration * 1000);
    case 'm':
      return new Date(now.getTime() + duration * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + duration * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
    default:
      throw new Error(
        `Invalid time unit in JWT expiration: "${unit}". Supported units: s (seconds), m (minutes), h (hours), d (days)`,
      );
  }
}
