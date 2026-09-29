//GetDisplayValue.test.ts

import { describe, expect, it } from "vitest";

import { GetDisplayValue, ToTimeMoment } from "./GetDisplayValue";
import type { IMasterDataState } from "../redux/slices/masterdataSlice";
import type { DateCell } from "../redux/types/gridTypes";

const masterData = {} as IMasterDataState;

function dateCell(showDate: boolean, showTime: boolean): DateCell {
    return {
        typeName: "Date",
        fieldName: "lstTime",
        caption: "დრო",
        visible: true,
        isRequiredErr: null,
        isNullable: null,
        def: null,
        showDate,
        showTime,
    };
}

describe("ToTimeMoment", () => {
    it("parses a HH:mm:ss string as a time of day", () => {
        expect(ToTimeMoment("08:30:00").format("HH:mm")).toBe("08:30");
    });

    it("parses a HH:mm string as a time of day", () => {
        expect(ToTimeMoment("21:05").format("HH:mm")).toBe("21:05");
    });

    it("parses a date-time string as a date", () => {
        expect(ToTimeMoment("2026-09-15T14:45:00").format("YYYY-MM-DD HH:mm")).toBe(
            "2026-09-15 14:45"
        );
    });
});

describe("GetDisplayValue Date cell", () => {
    it("shows a TimeOnly value of a time-only cell as HH:mm", () => {
        expect(
            GetDisplayValue(masterData, { lstTime: "08:00:00" }, dateCell(false, true))
        ).toBe("08:00");
    });

    it("shows a date-time value of a time-only cell as HH:mm", () => {
        expect(
            GetDisplayValue(
                masterData,
                { lstTime: "2026-09-15T14:45:00" },
                dateCell(false, true)
            )
        ).toBe("14:45");
    });

    it("shows a date-only value with the date format", () => {
        expect(
            GetDisplayValue(
                masterData,
                { lstTime: "2026-09-15T00:00:00" },
                dateCell(true, false)
            )
        ).toBe("15-Sep-2026 ");
    });

    it("returns the raw value when neither date nor time is shown", () => {
        expect(
            GetDisplayValue(masterData, { lstTime: "x" }, dateCell(false, false))
        ).toBe("x");
    });
});
