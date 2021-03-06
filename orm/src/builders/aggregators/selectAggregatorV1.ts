/* eslint-disable max-len */
import { AbstractColumn } from '../../columns/column';
import ColumnType from '../../columns/types/columnType';
import { AbstractTable } from '../../tables';
import { ecranate } from '../../utils/ecranate';
import Order from '../highLvlBuilders/order';
// eslint-disable-next-line import/no-cycle
import Join from '../joinBuilders/join';
import Expr from '../requestBuilders/where/where';
import Aggregator from './abstractAggregator';

export default class SelectAggregatorV1 extends Aggregator {
  private _from: Array<string> = [];
  private _filters: Array<string> = [];
  private _select: Array<string> = ['SELECT'];
  private _join: Array<string> = [];
  private _limit: Array<string> = [];
  private _offset: Array<string> = [];
  private _distinct: Array<string> = [];
  // private _groupBy: Array<string> = [];
  private _orderBy: Array<string> = [];
  private _values: Array<any> = [];

  private _joinCache: { [tableName: string]: string } = {};

  // public constructor(table: AbstractTable<any>);
  // public constructor(table: AbstractTable<any>, partial: {[name: string]: AbstractColumn<ColumnType<any>, boolean, boolean, AbstractTable<any>>})
  public constructor(table: AbstractTable<any>, partial?: { [name: string]: AbstractColumn<ColumnType<any>, boolean, boolean, AbstractTable<any>> }) {
    super(table, partial);
  }

  public filters = (filters: Expr): SelectAggregatorV1 => {
    if (filters) {
      const queryBuilder = filters.toQueryV1({ position: 1, tableCache: this._joinCache, session: this._table.db.session() });
      this._filters.push('WHERE ');
      this._filters.push(queryBuilder.query);
      this._values = queryBuilder.values;
    }
    return this;
  };

  public limit = (limit?: number): SelectAggregatorV1 => {
    if (limit) {
      this._limit.push('LIMIT ');
      this._limit.push(limit.toString());
    }
    return this;
  };

  public offset = (offset?: number): SelectAggregatorV1 => {
    if (offset) {
      this._offset.push('OFFSET ');
      this._offset.push(offset.toString());
    }
    return this;
  };

  public orderBy = (column?: AbstractColumn<ColumnType, boolean, boolean>,
    order?: Order): SelectAggregatorV1 => {
    if (column !== null && column !== undefined) {
      this._orderBy.push('ORDER BY ');
      const columnParent = this._joinCache[column.getParent().tableName()] ? this._joinCache[column.getParent().tableName()] : column.getParent().tableName();
      this._orderBy.push(`${columnParent}.${ecranate(column.getColumnName())} `);
      this._orderBy.push(Order[order!]);
    }
    return this;
  };

  public distinct = (column?: AbstractColumn<ColumnType, boolean, boolean>): SelectAggregatorV1 => {
    if (column) {
      this._distinct.push(` DISTINCT ON(${column.getParent().tableName()}.${ecranate(column.getColumnName())}) `);
    }
    return this;
  };

  public appendFrom = (tableName: string): SelectAggregatorV1 => {
    this._from.push('FROM ');
    this._from.push(tableName);
    // this._from.push(`${tableName} AS ${tableName}_0`);
    this._joinCache[tableName] = tableName;
    return this;
  };

  // Add select generator for second table also
  public join = (joins: Array<{
    join: Join<any>, partial?: { [name: string]: AbstractColumn<ColumnType<any>, boolean, boolean, any> },
    id?: number
  }>): SelectAggregatorV1 => {
    // const cache: {[tableName: string]: string} = {};
    joins.forEach((joinObject: {
      join: Join<any>, partial?: { [name: string]: AbstractColumn<ColumnType<any>, boolean, boolean, any> },
      id?: number
    }) => {
      if (joinObject) {
        const tableFrom = joinObject.join.fromColumn.getParentName();
        const tableTo = joinObject.join.toColumn.getParentName();
        const { type } = joinObject.join;

        let fromAlias = '';
        if (this._joinCache[tableFrom]) {
          fromAlias = this._joinCache[tableFrom];
        } else {
          fromAlias = `${tableFrom}${joinObject.id ? `_${joinObject.id}` : ''}`;
          this._joinCache[tableFrom] = fromAlias;
        }

        let selectString;
        if (joinObject.partial) {
          selectString = this.generateSelectArrayV1(`${tableTo}${joinObject.id ? `_${joinObject.id}` : ''}`, Object.values(joinObject.partial), joinObject.id).join('');
        } else {
          selectString = this.generateSelectArrayV1(`${tableTo}${joinObject.id ? `_${joinObject.id}` : ''}`, Object.values(joinObject.join.mappedServiceToDb), joinObject.id).join('');
        }
        this._fields.push(', ');
        this._fields.push(selectString);
        this._join.push('\n');
        this._join.push(type);
        this._join.push(' ');
        this._join.push(tableTo);
        this._join.push(' ');
        this._join.push(`AS ${tableTo}${joinObject.id ? `_${joinObject.id}` : ''}`);
        this._joinCache[tableTo] = `${tableTo}${joinObject.id ? `_${joinObject.id}` : ''}`;
        this._join.push('\n');
        this._join.push('ON ');
        this._join.push(fromAlias);
        // if (this._joinCache[tableFrom]) {
        //   this._join.push(this._joinCache[tableFrom]);
        // } else {
        //   this._join.push(tableFrom);
        //   this._joinCache[tableFrom] = `${tableFrom}${joinObject.id ? `_${joinObject.id}` : ''}`;
        // }
        this._join.push('.');
        this._join.push(joinObject.join.fromColumn.getColumnName());
        this._join.push(' = ');
        this._join.push(`${tableTo}${joinObject.id ? `_${joinObject.id}` : ''}`);
        // this._join.push(toAlias);
        this._join.push('.');
        this._join.push(joinObject.join.toColumn.getColumnName());
      }
    });

    return this;
  };

  public buildQuery = (): { query: string, values: Array<any> } => {
    this._select.push(this._distinct.join(''));
    this._select.push(this._fields.join(''));
    this._select.push('\n');
    this._select.push(this._from.join(''));
    this._select.push('\n');
    this._select.push(this._join.join(''));
    if (this._join.length > 0) {
      this._select.push('\n');
    }
    this._select.push(this._filters.join(''));
    this._select.push('\n');
    this._select.push(this._orderBy.join(''));
    this._select.push('\n');
    this._select.push(this._limit.join(''));
    this._select.push('\n');
    this._select.push(this._offset.join(''));

    return { query: this._select.join(''), values: this._values };
  };
}
