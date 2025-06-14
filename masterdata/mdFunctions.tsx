//mdFunctions.ts

import { NzInt } from "../common/myFunctions";
import type { IGridColumn, IRowsData } from "../grid/GridViewTypes";
import { GetDisplayValue } from "../modules/GetDisplayValue";
import type { IMasterDataState } from "../redux/slices/masterdataSlice";
import type { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import type {
    GridModel,
    LookupCell,
    MdLookupCell,
    MixedCell,
    RsLookupCell,
} from "../redux/types/gridTypes";
import type { ILookup } from "../redux/types/masterdataTypes";

export function ConvertGridModelToGridColumns(
    sourceGrid: GridModel,
    dataType: DataTypeFfModel,
    masterData: IMasterDataState
): IGridColumn[] {
    // console.log("ConvertGridModelToGridColumns sourceGrid=", sourceGrid);
    // console.log("ConvertGridModelToGridColumns dataType=", dataType);

    return sourceGrid.cells.map((field) => {
        // console.log("ConvertGridModelToGridColumns field=", field);
        let lookupData: ILookup[] | null = null;
        const mixedCell = field as MixedCell;
        if (field.typeName === "Lookup") {
            //deprecated
            // console.log("ConvertGridModelToGridColumns Lookup field=", field);

            const lookupCol = field as LookupCell;
            const { dataMember } = lookupCol;
            if (
                dataMember &&
                dataMember in masterData.mdataRepo &&
                masterData.mdataRepo[dataMember]
            ) {
                lookupData = masterData.mdataRepo[dataMember];
            }
        }

        if (field.typeName === "RsLookup") {
            const rsLookupCol = field as RsLookupCell;
            lookupData = CreateArrayFromRowSource(rsLookupCol.rowSource);
        }

        if (field.typeName === "MdLookup") {
            const mdLookupCol = field as MdLookupCell;
            const { dtTable } = mdLookupCol;
            // console.log("GetDisplayValue MdLookupCell dtTable=", dtTable);
            // console.log(
            //   "GetDisplayValue MdLookupCell masterData.mdLookupRepo=",
            //   masterData.mdLookupRepo
            // );
            if (
                dtTable &&
                dtTable in masterData.mdLookupRepo &&
                masterData.mdLookupRepo[dtTable]
            ) {
                lookupData = masterData.mdLookupRepo[dtTable];
                // console.log("GetDisplayValue MdLookupCell value=", value);
                // console.log("GetDisplayValue MdLookupCell lookupTable=", lookupTable);
            }
        }

        return {
            caption: field.caption,
            visible: field.visible,
            sortable: field.visible,
            fieldName: field.fieldName,
            typeName: field.typeName,
            isKey: field.fieldName === dataType.idFieldName ? true : false,
            lookupColumnPart: lookupData,
            nullable: mixedCell.isNullable,
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

/*
  id: number;
  name: string;

*/

export function CreateArrayFromRowSource(rowSource: string | null): ILookup[] {
    const rows = [] as ILookup[];
    if (rowSource === null) return rows;
    const rsarr = rowSource.split(";");
    rsarr.forEach((item, index) => {
        if (index % 2 === 0) return;
        const idval = NzInt(rsarr[index - 1]);
        if (idval !== null && item)
            rows.push({ id: idval, name: item } as ILookup);
    });
    return rows;
}
