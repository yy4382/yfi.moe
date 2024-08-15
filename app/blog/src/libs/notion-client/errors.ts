export class InsufficientDataError extends Error {
  readonly dataCount: number;
  readonly paginationConfig: { skip: number; limit: number };

  constructor(
    dataCount: number,
    paginationConfig: { skip: number; limit: number },
  ) {
    const { skip, limit } = paginationConfig;
    super(`Entry count ${dataCount} is less than the required ${skip + limit}`);
    this.name = "InsufficientDataError";
    this.dataCount = dataCount;
    this.paginationConfig = paginationConfig;
  }
}
