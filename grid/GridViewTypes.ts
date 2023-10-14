//GridViewTypes.ts

export interface IFilterSortObject {
  //tabWindowId: number;
  filterByFields: IFilterField[];
  sortByFields: ISortField[];
  tableName: string;
}

export interface IFilterSortRequest {
  offset: number;
  rowsCount: number;
  filterFields: IFilterField[];
  sortByFields: ISortField[];
}

export interface IGridColumn {
  caption: string;
  visible: boolean;
  sortable: boolean;
  fieldName: string;
  isKey: boolean;
  control: React.ReactNode;
  changingFieldName: string;
  possibleValues: any[];
  typeName: string;
}

export interface IGridScrollTo {
  index: number;
}

export interface ISortField {
  fieldName: string;
  ascending: boolean;
}

export interface IFilterField {
  fieldName: string;
  value: string;
}

export interface IRowsData {
  allRowsCount: number;
  offset: number;
  rows: any[];
}
