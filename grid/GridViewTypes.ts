//GridViewTypes.ts

//GridViewTypes.ts
import type { ILookup } from "../redux/types/masterdataTypes";

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
    nullable: boolean;
    fieldName: string;
    isKey: boolean;
    control: React.ReactNode | null;
    changingFieldName: string;
    typeName: string;
    lookupColumnPart: ILookup[] | null;
}

// export interface IMdLookupColumnPart {
//   lookupTable: ILookup[];
//   valueMember: string;
//   displayMember: string;
// }

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
