//OneDateBoxControl.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import moment from "moment";
import { describe, expect, it, vi } from "vitest";

import OneDateBoxControl from "./OneDateBoxControl";

type RenderOptions = {
    controlId?: string;
    value: string;
    showDate: boolean;
    showTime: boolean;
    error?: string | null;
};

// the server sends dates as ISO strings and TimeOnly values as "HH:mm:ss", the form keeps them as they came
function renderControl({ controlId = "startDate", value, showDate, showTime, error = null }: RenderOptions) {
    const onChangeValue = vi.fn();
    const getError = vi.fn(() => error);
    render(
        <OneDateBoxControl
            controlId={controlId}
            label="დასაწყისი"
            value={value as unknown as Date}
            showDate={showDate}
            showTime={showTime}
            getError={getError}
            onChangeValue={onChangeValue}
        />
    );
    const input = screen.getByLabelText("დასაწყისი") as HTMLInputElement;
    return { input, onChangeValue, getError };
}

describe("OneDateBoxControl", () => {
    it("shows a date-only value in a date input", () => {
        const { input } = renderControl({ value: "2026-09-15T00:00:00", showDate: true, showTime: false });

        expect(input.getAttribute("type")).toBe("date");
        expect(input).toHaveValue("2026-09-15");
    });

    it("shows a TimeOnly value in a time input as HH:mm", () => {
        const { input } = renderControl({ value: "08:30:00", showDate: false, showTime: true });

        expect(input.getAttribute("type")).toBe("time");
        expect(input).toHaveValue("08:30");
    });

    it("shows a date-time value of a time-only cell as its time", () => {
        const { input } = renderControl({ value: "2026-09-15T14:45:00", showDate: false, showTime: true });

        expect(input).toHaveValue("14:45");
    });

    it("shows a date-and-time value with both parts", () => {
        const { input } = renderControl({ value: "2026-09-15T14:45:30", showDate: true, showTime: true });

        expect(input.getAttribute("type")).toBe("datetime");
        expect(input).toHaveValue("2026-09-15T14:45:30");
    });

    it("shows the value in moment's default format when neither part is shown", () => {
        const { input } = renderControl({ value: "2026-09-15T14:45:30", showDate: false, showTime: false });

        expect(input.getAttribute("type")).toBe("");
        expect(input).toHaveValue(moment("2026-09-15T14:45:30").format());
    });

    it("asks for the error of its own field", () => {
        const { getError } = renderControl({ value: "2026-09-15T00:00:00", showDate: true, showTime: false });

        expect(getError).toHaveBeenCalledWith("startDate");
    });

    it("marks the input invalid and shows the error", () => {
        const { input } = renderControl({
            value: "2026-09-15T00:00:00",
            showDate: true,
            showTime: false,
            error: "დასაწყისი შევსებული უნდა იყოს",
        });

        expect(input).toHaveClass("is-invalid");
        expect(screen.getByText("დასაწყისი შევსებული უნდა იყოს")).toBeInTheDocument();
    });

    it("does not mark the input invalid without an error", () => {
        const { input } = renderControl({ value: "2026-09-15T00:00:00", showDate: true, showTime: false });

        expect(input).not.toHaveClass("is-invalid");
    });

    it("reports a new date under its field name", () => {
        const { input, onChangeValue } = renderControl({
            value: "2026-09-15T00:00:00",
            showDate: true,
            showTime: false,
        });

        fireEvent.change(input, { target: { value: "2026-10-01" } });

        expect(onChangeValue).toHaveBeenCalledWith("startDate", "2026-10-01");
    });

    it("reports a new time under its field name", () => {
        const { input, onChangeValue } = renderControl({
            controlId: "lstTime",
            value: "08:30:00",
            showDate: false,
            showTime: true,
        });

        fireEvent.change(input, { target: { value: "09:15" } });

        expect(onChangeValue).toHaveBeenCalledWith("lstTime", "09:15");
    });
});
