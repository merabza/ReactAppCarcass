//GetDisplayValue.test.ts

import { describe, expect, it } from "vitest";

import {
    GetDisplayValue,
    GetDisplayValueForLookup,
    GetDisplayValueForMdLookup,
    ToTimeMoment,
} from "./GetDisplayValue";
import type { IMasterDataState } from "../redux/slices/masterdataSlice";
import type {
    Cell,
    DateCell,
    LookupCell,
    MdLookupCell,
    RsLookupCell,
} from "../redux/types/gridTypes";
import type { ILookup } from "../redux/types/masterdataTypes";

const parents: ILookup[] = [
    { id: 1, name: "ხელფასი" },
    { id: 2, name: "" },
];

const olds = [
    { oldId: 10, oldName: "ძველი ათი" },
    { oldId: 11, oldName: "" },
];

const masterData = {
    mdLookupRepo: { Parents: parents, EmptyParents: undefined },
    mdataRepo: { Olds: olds, EmptyOlds: undefined },
} as unknown as IMasterDataState;

function cell(typeName: string, extra: object = {}): Cell {
    return { typeName, fieldName: "field", caption: "ველი", visible: true, ...extra } as Cell;
}

function dateCell(showDate: boolean, showTime: boolean): DateCell {
    return {
        typeName: "Date",
        fieldName: "field",
        caption: "დრო",
        visible: true,
        isRequiredErr: null,
        isNullable: null,
        def: null,
        showDate,
        showTime,
    };
}

function mdLookupCell(dtTable: string | null): MdLookupCell {
    return cell("MdLookup", { dtTable }) as MdLookupCell;
}

function rsLookupCell(rowSource: string | null): RsLookupCell {
    return cell("RsLookup", { rowSource }) as RsLookupCell;
}

function lookupCell(dataMember: string | null): LookupCell {
    return cell("Lookup", { dataMember, valueMember: "oldId", displayMember: "oldName" }) as LookupCell;
}

function display(col: Cell, value: unknown) {
    return GetDisplayValue(masterData, { field: value }, col);
}

describe("ToTimeMoment", () => {
    it("parses a HH:mm:ss string as a time of day", () => {
        expect(ToTimeMoment("08:30:00").format("HH:mm")).toBe("08:30");
    });

    it("parses a HH:mm string as a time of day", () => {
        expect(ToTimeMoment("21:05").format("HH:mm")).toBe("21:05");
    });

    it("parses a one-digit hour as a time of day", () => {
        expect(ToTimeMoment("8:05").format("HH:mm")).toBe("08:05");
    });

    it("parses a date-time string as a date", () => {
        expect(ToTimeMoment("2026-09-15T14:45:00").format("YYYY-MM-DD HH:mm")).toBe(
            "2026-09-15 14:45"
        );
    });

    it("parses a date object as that date", () => {
        const date = new Date(2026, 8, 15, 14, 45);

        expect(ToTimeMoment(date).format("YYYY-MM-DD HH:mm")).toBe("2026-09-15 14:45");
    });

    it("does not read a longer text ending in a time as a time of day", () => {
        expect(ToTimeMoment("x08:30").isValid()).toBe(false);
    });

    it("does not read a time followed by more text as a time of day", () => {
        expect(ToTimeMoment("08:30:00x").isValid()).toBe(false);
    });
});

describe("GetDisplayValue Boolean cell", () => {
    it("shows true as yes", () => {
        expect(display(cell("Boolean"), true)).toBe("დიახ");
    });

    it("shows false as no", () => {
        expect(display(cell("Boolean"), false)).toBe("არა");
    });

    it("returns a missing value as it is", () => {
        expect(display(cell("Boolean"), null)).toBeNull();
    });
});

describe("GetDisplayValue Date cell", () => {
    it("shows a TimeOnly value of a time-only cell as HH:mm", () => {
        expect(display(dateCell(false, true), "08:00:00")).toBe("08:00");
    });

    it("shows a date-time value of a time-only cell as HH:mm", () => {
        expect(display(dateCell(false, true), "2026-09-15T14:45:00")).toBe("14:45");
    });

    it("shows a date-only value with the date format", () => {
        expect(display(dateCell(true, false), "2026-09-15T00:00:00")).toBe("15-Sep-2026 ");
    });

    it("shows a date-and-time value with both formats", () => {
        expect(display(dateCell(true, true), "2026-09-15T14:45:30")).toBe("15-Sep-2026 14:45:30");
    });

    it("returns the raw value when neither date nor time is shown", () => {
        expect(display(dateCell(false, false), "x")).toBe("x");
    });
});

describe("GetDisplayValue MdLookup cell", () => {
    it("shows the name of the lookup row", () => {
        expect(display(mdLookupCell("Parents"), 1)).toBe("ხელფასი");
    });

    it("shows nothing for an id the lookup does not have", () => {
        expect(display(mdLookupCell("Parents"), 3)).toBeUndefined();
    });

    it("returns the raw value when the lookup table is not loaded", () => {
        expect(display(mdLookupCell("Others"), 1)).toBe(1);
    });

    it("returns the raw value when the loaded lookup table is empty", () => {
        expect(display(mdLookupCell("EmptyParents"), 1)).toBe(1);
    });

    it("returns the raw value when the cell names no table", () => {
        expect(display(mdLookupCell(null), 1)).toBe(1);
    });
});

describe("GetDisplayValue RsLookup cell", () => {
    const rowSource = "1;დანამატი;2;გამოქვითვა ხელზე ასაღებიდან";

    it("shows the text after the value in the row source", () => {
        expect(display(rsLookupCell(rowSource), 2)).toBe("გამოქვითვა ხელზე ასაღებიდან");
    });

    it("shows the text of the first value", () => {
        expect(display(rsLookupCell(rowSource), 1)).toBe("დანამატი");
    });

    it("returns the raw value when the row source does not have it", () => {
        expect(display(rsLookupCell(rowSource), 3)).toBe(3);
    });

    it("returns the raw value when it is the last item of the row source", () => {
        expect(display(rsLookupCell("1;ერთი;2"), 2)).toBe(2);
    });

    it("returns the raw value when its text is empty", () => {
        expect(display(rsLookupCell("1;;2;ორი"), 1)).toBe(1);
    });

    it("returns null as it is", () => {
        expect(display(rsLookupCell(rowSource), null)).toBeNull();
    });

    it("returns undefined as it is", () => {
        expect(display(rsLookupCell(rowSource), undefined)).toBeUndefined();
    });

    it("returns the raw value when the cell has no row source", () => {
        expect(display(rsLookupCell(null), 1)).toBe(1);
    });
});

describe("GetDisplayValue Lookup cell", () => {
    it("shows the display member of the row", () => {
        expect(display(lookupCell("Olds"), 10)).toBe("ძველი ათი");
    });

    it("returns the raw value when the table is not loaded", () => {
        expect(display(lookupCell("Others"), 10)).toBe(10);
    });

    it("returns the raw value when the loaded table is empty", () => {
        expect(display(lookupCell("EmptyOlds"), 10)).toBe(10);
    });

    it("returns the raw value when the cell names no table", () => {
        expect(display(lookupCell(null), 10)).toBe(10);
    });
});

describe("GetDisplayValue other cells", () => {
    it("returns the value of a text cell as it is", () => {
        expect(display(cell("String"), "ტექსტი")).toBe("ტექსტი");
    });

    it("does not show true of a cell that is not a boolean as yes", () => {
        expect(display(cell("String"), true)).toBe(true);
    });
});

describe("GetDisplayValueForLookup", () => {
    it("returns the display member of the row with the value", () => {
        expect(GetDisplayValueForLookup(olds, 10, "oldId", "oldName")).toBe("ძველი ათი");
    });

    it("returns the value when the row has an empty display member", () => {
        expect(GetDisplayValueForLookup(olds, 11, "oldId", "oldName")).toBe(11);
    });

    it("returns the value when no row has it", () => {
        expect(GetDisplayValueForLookup(olds, 12, "oldId", "oldName")).toBe(12);
    });

    it("returns the value without a value member", () => {
        expect(GetDisplayValueForLookup(olds, 10, null, "oldName")).toBe(10);
    });

    it("returns the value without a display member", () => {
        expect(GetDisplayValueForLookup(olds, 10, "oldId", null)).toBe(10);
    });

    it("returns the value without a table", () => {
        expect(GetDisplayValueForLookup(undefined, 10, "oldId", "oldName")).toBe(10);
    });
});

describe("GetDisplayValueForMdLookup", () => {
    it("returns the name of the row with the id", () => {
        expect(GetDisplayValueForMdLookup(parents, 1)).toBe("ხელფასი");
    });

    it("returns nothing for a row with an empty name", () => {
        expect(GetDisplayValueForMdLookup(parents, 2)).toBeUndefined();
    });

    it("returns nothing when no row has the id", () => {
        expect(GetDisplayValueForMdLookup(parents, 3)).toBeUndefined();
    });

    it("returns the value without a table", () => {
        expect(GetDisplayValueForMdLookup(undefined, 1)).toBe(1);
    });
});
