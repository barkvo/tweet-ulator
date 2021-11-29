import { fold } from 'fp-ts/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/pipeable';

export const eitherToPromise = async <E, R>(processFn: TE.TaskEither<E, R>): Promise<R> =>
  pipe(
    await processFn(),
    fold(
      (e: E) => {
        throw e;
      },
      (r: R) => {
        return r;
      },
    ),
  );

export default eitherToPromise;
