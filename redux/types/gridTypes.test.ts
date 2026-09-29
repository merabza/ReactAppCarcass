//gridTypes.test.ts

import { describe, expect, it } from "vitest";

import { DeserializeGridModel } from "./gridTypes";

// one cell of every type the server writes to DataTypes.DtGridRulesJson, each with a property of its own
const knownCells = [
    { typeName: "Boolean", fieldName: "active", caption: "აქტიური", visible: true, def: true },
    { typeName: "Date", fieldName: "lstTime", caption: "დრო", visible: true, showTime: true },
    { typeName: "Integer", fieldName: "id", caption: null, visible: false, def: 0 },
    { typeName: "MdLookup", fieldName: "rsQuoteTypeId", caption: "სახე", visible: true, dtTable: "RsQuoteTypes" },
    { typeName: "Lookup", fieldName: "oldId", caption: "ძველი", visible: true, dataMember: "Olds" },
    { typeName: "RsLookup", fieldName: "place", caption: "ადგილი", visible: true, rowSource: "1;ერთი" },
    { typeName: "Mixed", fieldName: "mixed", caption: "შერეული", visible: true, isNullable: true },
    { typeName: "Number", fieldName: "price", caption: "ფასი", visible: true },
    { typeName: "String", fieldName: "name", caption: "სახელი", visible: true, maxLenRule: { val: 5 } },
];

describe("DeserializeGridModel", () => {
    it("returns null when the rules have no cells", () => {
        expect(DeserializeGridModel("{}")).toBeNull();
    });

    it("returns null when the cells are null", () => {
        expect(DeserializeGridModel('{"cells":null}')).toBeNull();
    });

    it("returns an empty grid for an empty cell list", () => {
        expect(DeserializeGridModel('{"cells":[]}')).toEqual({ cells: [] });
    });

    it("keeps every known cell type with its own properties in order", () => {
        const grid = DeserializeGridModel(JSON.stringify({ cells: knownCells }));

        expect(grid).toEqual({ cells: knownCells });
    });

    it("leaves out a cell of an unknown type", () => {
        const unknown = { typeName: "Unknown", fieldName: "x", caption: "x", visible: true };
        const string = { typeName: "String", fieldName: "name", caption: "სახელი", visible: true };

        const grid = DeserializeGridModel(JSON.stringify({ cells: [unknown, string] }));

        expect(grid).toEqual({ cells: [string] });
    });
});
