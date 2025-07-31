export class Ok<T> {
  readonly _tag = "ok";
  value: T;

  constructor(value: T) {
    this.value = value;
  }
}

export class Err<E> {
  readonly _tag = "err";
  error: E;

  constructor(error: E) {
    this.error = error;
  }
}

export type Result<T, E> = Ok<T> | Err<E>;

export function err<E>(e: E): Err<E> {
  return new Err(e);
}

export function ok<T>(t: T): Ok<T> {
  return new Ok(t);
}
