//mdSchemaFunctions.test.ts

import { describe, expect, it } from "vitest";

import { IsTimeOnlyCell, countMdSchema } from "./mdSchemaFunctions";
import type {
    Cell,
    DateCell,
    GridErr,
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

function errorOf(cell: Cell, value: unknown): string | null {
    const schema = countMdSchema({ cells: [cell] });
    try {
        schema.validateSyncAt(cell.fieldName, { [cell.fieldName]: value });
        return null;
    } catch (e) {
        return (e as Error).message;
    }
}

describe("IsTimeOnlyCell", () => {
    it("is true when only time is shown (showDate omitted from JSON)", () => {
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
});

describe("countMdSchema Number cell", () => {
    it("accepts a decimal value", () => {
        expect(errorOf(numberCell({}), 12.5)).toBeNull();
    });

    it("accepts a decimal typed as a string", () => {
        expect(errorOf(numberCell({}), "12.75")).toBeNull();
    });

    it("rejects a non-number", () => {
        expect(errorOf(numberCell({}), "abc")).not.toBeNull();
    });

    it("rejects zero when positive is required", () => {
        const cell = numberCell({
            isPositiveErr: err("p", "დადებითი უნდა იყოს"),
        });
        expect(errorOf(cell, 0)).toBe("დადებითი უნდა იყოს");
    });

    it("uses the required error for a missing value", () => {
        const cell = numberCell({
            isRequiredErr: err("r", "ხელფასი შევსებული უნდა იყოს"),
        });
        expect(errorOf(cell, undefined)).toBe("ხელფასი შევსებული უნდა იყოს");
    });
});

describe("countMdSchema Date cell", () => {
    it("accepts a time string for a time-only cell", () => {
        expect(errorOf(dateCell({ showDate: false }), "08:30")).toBeNull();
    });

    it("accepts a date string for a date cell", () => {
        expect(errorOf(dateCell({}), "2026-09-15T00:00:00")).toBeNull();
    });

    it("rejects a time string for a date cell", () => {
        expect(errorOf(dateCell({}), "08:30")).not.toBeNull();
    });
});

describe("countMdSchema String cell", () => {
    const minCell = stringCell({
        minLenRule: { val: 11, error: err("s", "ძალიან მოკლეა") },
    });
    const patternCell = stringCell({
        patternRule: { val: "^[0-9]{11}$", error: err("f", "არასწორი ფორმატი") },
    });

    it("rejects a value shorter than the minimum", () => {
        expect(errorOf(minCell, "1234")).toBe("ძალიან მოკლეა");
    });

    it("accepts a value of the minimum length", () => {
        expect(errorOf(minCell, "12345678901")).toBeNull();
    });

    it("does not apply the minimum to an empty value", () => {
        expect(errorOf(minCell, "")).toBeNull();
    });

    it("rejects a value not matching the pattern", () => {
        expect(errorOf(patternCell, "1234567890a")).toBe("არასწორი ფორმატი");
    });

    it("accepts a value matching the pattern", () => {
        expect(errorOf(patternCell, "01234567890")).toBeNull();
    });

    it("does not apply the pattern to an empty value", () => {
        expect(errorOf(patternCell, "")).toBeNull();
    });

    it("keeps the max length rule", () => {
        const cell = stringCell({
            maxLenRule: { val: 3, error: err("m", "ძალიან გრძელია") },
        });
        expect(errorOf(cell, "abcd")).toBe("ძალიან გრძელია");
    });
});
