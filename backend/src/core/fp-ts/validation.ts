import { plainToClass, ClassConstructor } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { pipe } from 'fp-ts/pipeable';
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray';
import * as TE from 'fp-ts/TaskEither';

export const transformAndValidateAsTE = <DTO>(
  dto: ClassConstructor<DTO>,
  data: Record<string, unknown>,
): TE.TaskEither<Error, DTO> => {
  return pipe(
    TE.right(plainToClass(dto, data)),
    TE.chain((dtoInstance) => {
      return pipe(
        TE.tryCatch(
          () => validateOrReject(dtoInstance as unknown as object),
          (e) => e as RNEA.ReadonlyNonEmptyArray<ValidationError>,
        ),
        TE.map(() => dtoInstance),
        TE.mapLeft((errors) => {
          return new Error(`DTO validation failed (${errors.length})`);
        }),
      );
    }),
  );
};
