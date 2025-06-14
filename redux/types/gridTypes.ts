//gridTypes.ts

import type { Err } from "./errorTypes";

export interface GridModel {
    cells: Cell[];
}

export interface IGrid {
    cells: Array<
        | BooleanCell
        | DateCell
        | IntegerCell
        | LookupCell
        | MixedCell
        | NumberCell
        | StringCell
    >;
}

export interface Cell {
    typeName: string;
    fieldName: string;
    caption: string | null;
    visible: boolean;
}

export interface MixedCell extends Cell {
    isRequiredErr: Err | null;
    isNullable: boolean | null;
}

export interface BooleanCell extends MixedCell {
    def: boolean | null;
}

export interface DateCell extends MixedCell {
    def: string | null;
    showDate: boolean;
    showTime: boolean;
}

export interface NumberCell extends MixedCell {
    isPositiveErr: Err | null;
}

export interface StringCell extends MixedCell {
    def: string | null;
    maxLenRule: IntRule | null;
}

export interface IntegerCell extends NumberCell {
    def: number | null;
    isIntegerErr: Err | null;
    minValRule: IntRule | null;
    isShort: boolean;
    isSortId: boolean;
}

export interface LookupCell extends IntegerCell {
    dataMember: string | null;
    valueMember: string | null;
    displayMember: string | null;
}

export interface RsLookupCell extends IntegerCell {
    rowSource: string | null;
}

export interface MdLookupCell extends IntegerCell {
    dtTable: string | null;
}

export interface IntRule {
    val: number;
    err: Err;
}

export function DeserializeGridModel(
    dtGridRulesJson: string
): GridModel | null {
    // console.log("DeserializeGridModel 1 dtGridRulesJson=", dtGridRulesJson);
    const grid = JSON.parse(dtGridRulesJson) as GridModel;
    // console.log("DeserializeGridModel 2 grid=", grid);
    const cells = grid.cells;
    if (cells == null) return null;
    const gridResult = {} as IGrid;
    gridResult.cells = new Array<
        | BooleanCell
        | DateCell
        | IntegerCell
        | LookupCell
        | MixedCell
        | NumberCell
        | StringCell
    >();
    cells.forEach((cell) => {
        const cJson = JSON.stringify(cell);
        // console.log("DeserializeGridModel 3 cell=", cell);
        // console.log("DeserializeGridModel 4 cJson=", cJson);
        // console.log("DeserializeGridModel 5 cell.typeName=", cell.typeName);
        switch (cell.typeName) {
            case "Boolean": {
                var boolCell = JSON.parse(cJson) as BooleanCell;
                gridResult.cells.push(boolCell);
                break;
            }
            case "Date": {
                var dateCell = JSON.parse(cJson) as DateCell;
                gridResult.cells.push(dateCell);
                break;
            }
            case "Integer": {
                // console.log("DeserializeGridModel 6 TypeName is Integer");
                var intCell = JSON.parse(cJson) as IntegerCell;
                // console.log("DeserializeGridModel 7 intCell=", intCell);
                gridResult.cells.push(intCell);
                break;
            }
            case "MdLookup": {
                var mdLookupCell = JSON.parse(cJson) as MdLookupCell;
                gridResult.cells.push(mdLookupCell);
                break;
            }
            case "Lookup": {
                var lookupCell = JSON.parse(cJson) as LookupCell;
                gridResult.cells.push(lookupCell);
                break;
            }
            case "RsLookup": {
                var rsLookupCell = JSON.parse(cJson) as RsLookupCell;
                gridResult.cells.push(rsLookupCell);
                break;
            }
            case "Mixed": {
                var mixedCell = JSON.parse(cJson) as MixedCell;
                gridResult.cells.push(mixedCell);
                break;
            }
            case "Number": {
                var numberCell = JSON.parse(cJson) as NumberCell;
                gridResult.cells.push(numberCell);
                break;
            }
            case "String": {
                var stringCell = JSON.parse(cJson) as StringCell;
                gridResult.cells.push(stringCell);
                break;
            }
        }
    });
    // console.log("DeserializeGridModel 8 gridResult=", gridResult);
    return gridResult;
}
