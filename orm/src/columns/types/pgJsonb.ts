/* eslint-disable max-len */
import ColumnType from './columnType';

export default class PgJsonb<TCodeType> extends ColumnType<TCodeType> {
  public codeType: TCodeType;
  public dbName: string;

  public constructor() {
    super();
    this.dbName = 'JSONB';
  }

  public getDbName = (): string => this.dbName;

  // public insertStrategy = (value: TCodeType): string => `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  public insertStrategy = (value: TCodeType): string => `${JSON.stringify(value).replace(/'/g, "''")}`;

  public selectStrategy(value: any): TCodeType {
    return value;
  }
}