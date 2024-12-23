const MIN_IN_MILLISECONDS = 60 * 1000;

export class RateLimit {
  private windowSize: number;
  private maxRequestsPerWindow: number;
  private routePrefix: string;
  private requestsPerUserUuid: Map<string, number[]> = new Map<
    string,
    number[]
  >();

  constructor(
    windowInMinutes: number = 5,
    maxRequestsPerWindow: number = 10,
    routePrefix: string = '',
  ) {
    this.windowSize = windowInMinutes * MIN_IN_MILLISECONDS;
    this.maxRequestsPerWindow = maxRequestsPerWindow;
    this.routePrefix = routePrefix;
  }

  private cleanupOldEntries(timestamps: number[]): number[] {
    const now = Date.now();
    return timestamps.filter((timestamp) => now - timestamp < this.windowSize);
  }

  public checkRateLimit(uuid: string): void {
    if (!this.requestsPerUserUuid.has(uuid)) {
      this.requestsPerUserUuid.set(uuid, []);
    }

    this.requestsPerUserUuid.set(
      uuid,
      this.cleanupOldEntries(this.requestsPerUserUuid.get(uuid)!),
    );

    if (
      this.requestsPerUserUuid.get(uuid)!.length >= this.maxRequestsPerWindow
    ) {
      console.error(`${this.routePrefix} User [${uuid}] exceeded rate limit`);
      throw new Error('Rate limit exceeded');
    }

    this.requestsPerUserUuid.get(uuid)!.push(Date.now());
  }
}
