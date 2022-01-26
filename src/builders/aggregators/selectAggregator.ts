/* eslint-disable max-len */
import { AbstractColumn } from '../../columns/column';
import ColumnType from '../../columns/types/columnType';
import { AbstractTable } from '../../tables';
import { ecranate } from '../../utils/ecranate';
import Order from '../highLvlBuilders/order';
import Join from '../joinBuilders/join';
import Expr from '../requestBuilders/where/where';
import Aggregator from './abstractAggregator';

export default class SelectAggregator extends Aggregator {
  private _from: Array<string> = [];
  private _filters: Array<string> = [];
  private _select: Array<string> = ['SELECT'];
  private _join: Array<string> = [];
  private _limit: Array<string> = [];
  private _offset: Array<string> = [];
  private _distinct: Array<string> = [];
  // private _groupBy: Array<string> = [];
  private _orderBy: Array<string> = [];

  // public constructor(table: AbstractTable<any>);
  // public constructor(table: AbstractTable<any>, partial: {[name: string]: AbstractColumn<ColumnType<any>, boolean, boolean, AbstractTable<any>>})
  public constructor(table: AbstractTable<any>, partial?: {[name: string]: AbstractColumn<ColumnType<any>, boolean, boolean, AbstractTable<any>>}) {
    super(table, partial);
  }

  public filters = (filters: Expr): SelectAggregator => {
    if (filters) {
      this._filters.push('WHERE ');
      this._filters.push(filters.toQuery());
    }
    return this;
  };

  public limit = (limit?: number): SelectAggregator => {
    if (limit) {
      this._limit.push('LIMIT ');
      this._limit.push(limit.toString());
    }
    return this;
  };

  public offset = (offset?: number): SelectAggregator => {
    if (offset) {
      this._offset.push('OFFSET ');
      this._offset.push(offset.toString());
    }
    return this;
  };

  public orderBy = (column?: AbstractColumn<ColumnType, boolean, boolean>,
    order?: Order): SelectAggregator => {
    if (column !== null && column !== undefined) {
      this._orderBy.push('ORDER BY ');
      this._orderBy.push(`${column.getColumnName()} `);
      this._orderBy.push(Order[order!]);
    }
    return this;
  };

  public distinct = (column?: AbstractColumn<ColumnType, boolean, boolean>): SelectAggregator => {
    if (column) {
      this._distinct.push(` DISTINCT ON(${column.getParent()}.${ecranate(column.getColumnName())}) `);
    }
    return this;
  };

  public appendFrom = (tableName: string): SelectAggregator => {
    this._from.push('FROM ');
    this._from.push(tableName);
    return this;
  };

  // Add select generator for second table also
  public join = (joins: Array<{join: Join<any>, partial?: {[name: string]: AbstractColumn<ColumnType<any>, boolean, boolean, any>}}>): SelectAggregator => {
    joins.forEach((joinObject: {join: Join<any>, partial?: {[name: string]: AbstractColumn<ColumnType<any>, boolean, boolean, any>}}) => {
      if (joinObject) {
        const tableFrom = joinObject.join.fromColumn.getParentName();
        const tableTo = joinObject.join.toColumn.getParentName();
        const { type } = joinObject.join;

        let selectString;
        if (joinObject.partial) {
          selectString = this.generateSelectArray(tableTo, Object.values(joinObject.partial)).join('');
        } else {
          selectString = this.generateSelectArray(tableTo, Object.values(joinObject.join.mappedServiceToDb)).join('');
        }
        this._fields.push(', ');
        this._fields.push(selectString);
        this._join.push('\n');
        this._join.push(type);
        this._join.push(' ');
        this._join.push(tableTo);
        this._join.push('\n');
        this._join.push('ON ');
        this._join.push(tableFrom);
        this._join.push('.');
        this._join.push(joinObject.join.fromColumn.getColumnName());
        this._join.push(' = ');
        this._join.push(tableTo);
        this._join.push('.');
        this._join.push(joinObject.join.toColumn.getColumnName());
      }
    });

    return this;
  };

  public buildQuery = () => {
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

    return this._select.join('');
  };
}
