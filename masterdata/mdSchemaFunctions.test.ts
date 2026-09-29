//mdSchemaFunctions.test.ts

import { describe, expect, it } from "vitest";
import { ValidationError } from "yup";

import { IsTimeOnlyCell, countMdSchema } from "./mdSchemaFunctions";
import type {
    BooleanCell,
    Cell,
    DateCell,
    GridErr,
    IntegerCell,
    NumberCell,
    StringCell,
} from "../redux/types/gridTypes";

function err(code: string, description: string): GridErr {
    return { code, description, type: 2 };
}

function stringCell(extra: Partial<StringCell>): StringCell {
    return {
        typeName: "String",
        fieldName: "personalId",
        caption: "პირადი ნომერი",
        visible: true,
        isRequiredErr: null,
        isNullable: null,
        def: null,
        maxLenRule: null,
        ...extra,
    };
}

function integerCell(extra: Partial<IntegerCell>): IntegerCell {
    return {
        typeName: "Integer",
        fieldName: "rate",
        caption: "რიგი",
        visible: true,
        isRequiredErr: null,
        isNullable: null,
        isPositiveErr: null,
        def: null,
        isIntegerErr: null,
        minValRule: null,
        isShort: false,
        isSortId: false,
        ...extra,
    };
}

function numberCell(extra: Partial<NumberCell>): NumberCell {
    return {
        typeName: "Number",
        fieldName: "hourSalaryNet",
        caption: "ხელფასი",
        visible: true,
        isRequiredErr: null,
        isNullable: null,
        isPositiveErr: null,
        ...extra,
    };
}

function booleanCell(extra: Partial<BooleanCell>): BooleanCell {
    return {
        typeName: "Boolean",
        fieldName: "active",
        caption: "აქტიური",
        visible: true,
        isRequiredErr: null,
        isNullable: null,
        def: null,
        ...extra,
    };
}

function dateCell(extra: Partial<DateCell>): DateCell {
    return {
        typeName: "Date",
        fieldName: "lstTime",
        caption: "დრო",
        visible: true,
        isRequiredErr: null,
        isNullable: null,
        def: null,
        showDate: true,
        showTime: true,
        ...extra,
    };
}

// the validation error of one field for one value, or null when the value is valid
function errorOf(cell: Cell, value: unknown): ValidationError | null {
    const schema = countMdSchema({ cells: [cell] });
    try {
        schema.validateSyncAt(cell.fieldName, { [cell.fieldName]: value });
        return null;
    } catch (e) {
        return e as ValidationError;
    }
}

function messageOf(cell: Cell, value: unknown): string | null {
    return errorOf(cell, value)?.message ?? null;
}

function defaultOf(cell: Cell): unknown {
    return (countMdSchema({ cells: [cell] }).getDefault() as Record<string, unknown>)[cell.fieldName];
}

describe("IsTimeOnlyCell", () => {
    it("is true when only time is shown (showDate is left out of the JSON)", () => {
        const cell = dateCell({ showTime: true });
        delete (cell as Partial<DateCell>).showDate;
        expect(IsTimeOnlyCell(cell)).toBe(true);
    });

    it("is false for a date-and-time cell", () => {
        expect(IsTimeOnlyCell(dateCell({}))).toBe(false);
    });

    it("is false for a date-only cell", () => {
        expect(IsTimeOnlyCell(dateCell({ showTime: false }))).toBe(false);
    });

    it("is false when neither date nor time is shown", () => {
        expect(IsTimeOnlyCell(dateCell({ showDate: false, showTime: false }))).toBe(false);
    });
});

describe("countMdSchema", () => {
    it("builds one field per cell under its field name", () => {
        const schema = countMdSchema({
            cells: [integerCell({ fieldName: "a" }), stringCell({ fieldName: "b" })],
        });

        expect(Object.keys(schema.fields)).toEqual(["a", "b"]);
    });

    it("refuses a cell type it does not know", () => {
        const cell = { typeName: "Mixed", fieldName: "x", caption: "x", visible: true } as Cell;

        expect(() => countMdSchema({ cells: [cell] })).toThrow(Error);
    });
});

describe("countMdSchema integer cells", () => {
    it.each(["Integer", "RsLookup", "Lookup", "MdLookup"])("%s accepts a whole number", (typeName) => {
        expect(messageOf(integerCell({ typeName }), 3)).toBeNull();
    });

    it.each(["Integer", "RsLookup", "Lookup", "MdLookup"])("%s refuses a fraction", (typeName) => {
        expect(messageOf(integerCell({ typeName }), 1.5)).not.toBeNull();
    });

    it("refuses a value that is not a number", () => {
        expect(messageOf(integerCell({}), "abc")).not.toBeNull();
    });

    it("uses the integer error of the cell for a fraction", () => {
        const cell = integerCell({ isIntegerErr: err("i", "მთელი უნდა იყოს") });

        expect(messageOf(cell, 1.5)).toBe("მთელი უნდა იყოს");
    });

    it("refuses a value below the minimum", () => {
        const cell = integerCell({ minValRule: { val: 0, error: err("m", "მინიმუმი 0") } });

        expect(messageOf(cell, -1)).not.toBeNull();
    });

    it("accepts the minimum itself", () => {
        const cell = integerCell({ minValRule: { val: 0, error: err("m", "მინიმუმი 0") } });

        expect(messageOf(cell, 0)).toBeNull();
    });

    it("uses the positive error of the cell for zero", () => {
        const cell = integerCell({ isPositiveErr: err("p", "არჩეული უნდა იყოს") });

        expect(messageOf(cell, 0)).toBe("არჩეული უნდა იყოს");
    });

    it("accepts zero when the cell does not need a positive number", () => {
        expect(messageOf(integerCell({}), 0)).toBeNull();
    });

    it("takes the default of the cell", () => {
        expect(defaultOf(integerCell({ def: 5 }))).toBe(5);
    });

    it("takes a default of zero", () => {
        expect(defaultOf(integerCell({ def: 0 }))).toBe(0);
    });

    it("has no default when the cell has none", () => {
        expect(defaultOf(integerCell({ def: null }))).toBeUndefined();
    });
});

describe("countMdSchema Number cell", () => {
    it("accepts a decimal value", () => {
        expect(messageOf(numberCell({}), 12.5)).toBeNull();
    });

    it("accepts a decimal typed as a string", () => {
        expect(messageOf(numberCell({}), "12.75")).toBeNull();
    });

    it("accepts zero when the cell does not need a positive number", () => {
        expect(messageOf(numberCell({}), 0)).toBeNull();
    });

    it("refuses a value that is not a number", () => {
        expect(messageOf(numberCell({}), "abc")).not.toBeNull();
    });

    it("uses the positive error of the cell for zero", () => {
        const cell = numberCell({ isPositiveErr: err("p", "დადებითი უნდა იყოს") });

        expect(messageOf(cell, 0)).toBe("დადებითი უნდა იყოს");
    });

    it("uses the required error of the cell for a missing value", () => {
        const cell = numberCell({ isRequiredErr: err("r", "ხელფასი შევსებული უნდა იყოს") });

        expect(messageOf(cell, undefined)).toBe("ხელფასი შევსებული უნდა იყოს");
    });
});

describe("countMdSchema Boolean cell", () => {
    it("accepts true", () => {
        expect(messageOf(booleanCell({}), true)).toBeNull();
    });

    it("refuses a value that is not a boolean", () => {
        expect(messageOf(booleanCell({}), "abc")).not.toBeNull();
    });
});

describe("countMdSchema Date cell", () => {
    it("accepts a time string for a time-only cell", () => {
        expect(messageOf(dateCell({ showDate: false }), "08:30")).toBeNull();
    });

    it("accepts a date string for a date cell", () => {
        expect(messageOf(dateCell({}), "2026-09-15T00:00:00")).toBeNull();
    });

    it("refuses a time string for a date cell", () => {
        expect(messageOf(dateCell({}), "08:30")).not.toBeNull();
    });
});

describe("countMdSchema String cell", () => {
    const minCell = stringCell({
        minLenRule: { val: 11, error: err("s", "ძალიან მოკლეა") },
    });
    const patternCell = stringCell({
        patternRule: { val: "^[0-9]{11}$", error: err("f", "არასწორი ფორმატი") },
    });

    it("accepts a plain text", () => {
        expect(messageOf(stringCell({}), "ტექსტი")).toBeNull();
    });

    it("takes the default of the cell", () => {
        expect(defaultOf(stringCell({ def: "x" }))).toBe("x");
    });

    it("takes an empty default", () => {
        expect(defaultOf(stringCell({ def: "" }))).toBe("");
    });

    it("has no default when the cell has none", () => {
        expect(defaultOf(stringCell({ def: null }))).toBeUndefined();
    });

    it("keeps the max length rule", () => {
        const cell = stringCell({
            maxLenRule: { val: 3, error: err("m", "ძალიან გრძელია") },
        });
        expect(messageOf(cell, "abcd")).toBe("ძალიან გრძელია");
    });

    it("accepts a value of the max length", () => {
        const cell = stringCell({
            maxLenRule: { val: 3, error: err("m", "ძალიან გრძელია") },
        });
        expect(messageOf(cell, "abc")).toBeNull();
    });

    it("rejects a value shorter than the minimum with the minLen test", () => {
        const error = errorOf(minCell, "1234");

        expect(error?.message).toBe("ძალიან მოკლეა");
        expect(error?.type).toBe("minLen");
    });

    it("rejects a value one character shorter than the minimum", () => {
        expect(messageOf(minCell, "1234567890")).toBe("ძალიან მოკლეა");
    });

    it("accepts a value of the minimum length", () => {
        expect(messageOf(minCell, "12345678901")).toBeNull();
    });

    it("does not apply the minimum to an empty value", () => {
        expect(messageOf(minCell, "")).toBeNull();
    });

    it("rejects a value not matching the pattern", () => {
        expect(messageOf(patternCell, "1234567890a")).toBe("არასწორი ფორმატი");
    });

    it("accepts a value matching the pattern", () => {
        expect(messageOf(patternCell, "01234567890")).toBeNull();
    });

    it("does not apply the pattern to an empty value", () => {
        expect(messageOf(patternCell, "")).toBeNull();
    });
});

describe("countMdSchema required and nullable cells", () => {
    it("uses the required error of the cell for a missing value", () => {
        const cell = stringCell({ isRequiredErr: err("r", "პირადი ნომერი შევსებული უნდა იყოს") });

        expect(messageOf(cell, undefined)).toBe("პირადი ნომერი შევსებული უნდა იყოს");
    });

    it("accepts a missing value when the cell is not required", () => {
        expect(messageOf(stringCell({}), undefined)).toBeNull();
    });

    it("accepts null when the cell is nullable", () => {
        expect(messageOf(stringCell({ isNullable: true }), null)).toBeNull();
    });

    it("refuses null when the cell is not nullable", () => {
        expect(messageOf(stringCell({}), null)).not.toBeNull();
    });
});
