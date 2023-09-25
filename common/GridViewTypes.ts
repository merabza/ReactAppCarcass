//GridViewTypes.ts

export interface IFilterSortObject {
  tabWindowId: number;
  filterByFields: ISortField[];
  sortByFields: ISortField[];
  tableName: string;
}

export interface IGridColumn {
  caption: string;
  visible: boolean;
  sortable: boolean;
  fieldName: string;
  isKey: boolean;
  control: React.ReactNode;
  changingFieldName: string;
}

export interface IGridScrollTo {
  index: number;
}

export interface ISortField {
  fieldName: string;
  ascending: boolean;
}
