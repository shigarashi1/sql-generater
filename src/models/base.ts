export type TTableName = 'users' | 'projects';

type TCommand = 'INSERT' | 'SELECT' | 'UPDATE' | 'DELETE';
type TDataType = string | number | Date;
type TWhereFilter = '=' | '>' | '<' | '>=' | '<=';
type TOrderStr = 'asc' | 'desc';
type TTargetColumn = {
  columnName: string;
  replacedName?: string;
  value?: TDataType;
};
type TWhereCondition = {
  columnName: string;
  opStr: TWhereFilter;
  value: TDataType;
};
type TOrderByCondition = {
  columnName: string;
  orderStr: TOrderStr;
};
type TInitializeOption = {
  sql: TCommand;
  canAddColumn: boolean;
  canWhere: boolean;
  canOrderBy: boolean;
};

const toTargetColumn = (v: string | TTargetColumn): TTargetColumn => (typeof v !== 'string' ? v : { columnName: v });
const wrapSingleQuotation = (v: TDataType): string => (typeof v === 'string' ? `'${v}'` : `${v}`);

export abstract class BaseQuery {
  protected _option: TInitializeOption;
  protected _tableName: string;
  protected _columns: TTargetColumn[] = [];
  protected _where: TWhereCondition[] = [];
  protected _orderBy: TOrderByCondition[] = [];

  constructor(tableName: TTableName, option: TInitializeOption) {
    this._tableName = tableName;
    this._option = option;
  }

  public column(params: string | TTargetColumn | Array<string | TTargetColumn>) {
    if (!this._option.canAddColumn) {
      throw Error('Can not add Columns.');
    }
    if (Array.isArray(params)) {
      this._columns = [...this._columns, ...params.map(toTargetColumn)];
    } else {
      this._columns.push(toTargetColumn(params));
    }
    return this;
  }

  public where(columnName: string, opStr: TWhereFilter, value: string | number) {
    if (!this._option.canWhere) {
      throw Error('Can not add Where Conditions.');
    }
    this._where.push({ columnName, opStr, value });
    return this;
  }

  protected get whereStr(): string {
    if (this._where.length < 1) {
      return '';
    }
    const q = this._where
      .map(({ columnName, opStr, value }) => `${columnName} ${opStr} ${wrapSingleQuotation(value)}`)
      .join(' AND ');
    return `WHERE 1 = 1 AND ${q}`;
  }

  public orderBy(columnName: string, orderStr: TOrderStr = 'asc') {
    if (!this._option.canOrderBy) {
      throw Error('Can not add OrderBy Conditions.');
    }
    this._orderBy.push({ columnName, orderStr });
    return this;
  }

  protected get orderByStr(): string {
    if (this._orderBy.length < 1) {
      return '';
    }
    const q = this._orderBy.map(({ columnName, orderStr }) => `${columnName} ${orderStr || 'asc'}`).join(', ');
    return `ORDER BY ${q}`;
  }

  protected abstract get columnStr(): string;
  abstract get query(): string;
}
