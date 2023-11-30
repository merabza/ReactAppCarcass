//mdFunctions.ts

import { IGridColumn, IRowsData } from "../grid/GridViewTypes";
import { GetDisplayValue } from "../modules/GetDisplayValue";
import { IMasterDataState } from "../redux/slices/masterdataSlice";
import { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import { GridModel } from "../redux/types/gridTypes";

export function ConvertGridModelToGridColumns(
  sourceGrid: GridModel,
  dataType: DataTypeFfModel
): IGridColumn[] {
  // console.log("ConvertGridModelToGridColumns sourceGrid=", sourceGrid);
  // console.log("ConvertGridModelToGridColumns dataType=", dataType);

  return sourceGrid.cells.map((field) => {
    return {
      caption: field.caption,
      visible: field.visible,
      sortable: field.visible,
      fieldName: field.fieldName,
      typeName: field.typeName,
      isKey: field.fieldName === dataType.idFieldName ? true : false,
    } as IGridColumn;
  });
}

export function CountDisplayValues(
  table: any[] | null | undefined,
  gridRules: GridModel | null | undefined,
  masterData: IMasterDataState
): any[] {
  return (
    table?.map((row) => {
      let newrow = {} as any;
      gridRules?.cells.forEach((col) => {
        newrow[col.fieldName] = GetDisplayValue(masterData, row, col);
      });
      return newrow;
    }) ?? ([] as any[])
  );
}

export function CountRowDataDisplayValues(
  rowData: IRowsData | null | undefined,
  gridRules: GridModel | null | undefined,
  masterData: IMasterDataState
): IRowsData | undefined {
  if (!rowData) return undefined;
  return {
    allRowsCount: rowData.allRowsCount,
    offset: rowData.offset,
    rows: CountDisplayValues(rowData.rows, gridRules, masterData),
  };
}
