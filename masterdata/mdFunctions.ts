//mdFunctions.ts

import { IGridColumn } from "../common/GridViewTypes";
import { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import { GridModel } from "../redux/types/gridTypes";

export function ConvertGridModelToGridColumns(
  sourceGrid: GridModel,
  dataType: DataTypeFfModel
): IGridColumn[] {
  console.log("ConvertGridModelToGridColumns sourceGrid=", sourceGrid);
  console.log("ConvertGridModelToGridColumns dataType=", dataType);

  return sourceGrid.cells.map((element) => {
    return {
      caption: element.caption,
      visible: element.visible,
      sortable: element.visible,
      fieldName: element.fieldName,
      isKey: element.fieldName === dataType.idFieldName ? true : false,
    } as IGridColumn;
  });
}
