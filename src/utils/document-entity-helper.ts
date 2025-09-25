import { Transform } from 'class-transformer';

export class EntityDocumentHelper {
  @Transform(
    (value) => {
      if ('value' in value) {
        // https://github.com/typestack/class-transformer/issues/879
        return value.obj[value.key].toString();
      }

      return 'common.unknownValue';
    },
    {
      toPlainOnly: true,
    },
  )
  public _id: string;
}
