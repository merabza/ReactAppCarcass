//GridPagenation.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import GridPagenation from "./GridPagenation";

// ღილაკები: «, ‹, ›, » (ამ თანმიმდევრობით)
const firstButton = 0;
const previousButton = 1;
const nextButton = 2;
const lastButton = 3;

function renderPagination(offset: number, allRowsCount: number, rowsCountPerPage = 10) {
    const onChange = vi.fn();
    render(
        <GridPagenation
            offset={offset}
            rowsCountPerPage={rowsCountPerPage}
            allRowsCount={allRowsCount}
            onChange={onChange}
        />
    );
    return onChange;
}

function clickButton(buttonIndex: number, offset: number, allRowsCount: number, rowsCountPerPage = 10) {
    const onChange = renderPagination(offset, allRowsCount, rowsCountPerPage);
    fireEvent.click(screen.getAllByRole("button")[buttonIndex]);
    return onChange;
}

function recordsText() {
    return screen.getByText((_, element) => element?.tagName === "SPAN" && element.textContent?.startsWith("ჩანაწერები") === true)
        .textContent;
}

describe("GridPagenation", () => {
    it("first page goes to offset 0", () => {
        expect(clickButton(firstButton, 20, 21)).toHaveBeenCalledWith(0, 10);
    });

    it.each([
        [21, 10, 20],
        [20, 10, 10],
        [11, 10, 10],
        [10, 10, 0],
        [1, 10, 0],
        [0, 10, 0],
        [26, 25, 25],
    ])("last page: %i rows by %i per page → offset %i", (allRowsCount, rowsCountPerPage, expected) => {
        expect(clickButton(lastButton, 0, allRowsCount, rowsCountPerPage)).toHaveBeenCalledWith(
            expected,
            rowsCountPerPage
        );
    });

    it.each([
        [20, 10],
        [10, 0],
        [0, 0],
        [5, 0],
    ])("previous page from offset %i → offset %i", (offset, expected) => {
        expect(clickButton(previousButton, offset, 21)).toHaveBeenCalledWith(expected, 10);
    });

    it.each([
        [0, 21, 10],
        [10, 21, 20],
        [20, 21, 20],
        [10, 20, 10],
        [0, 0, 0],
        [0, 5, 0],
        //ხელით აკრეფილი წანაცვლება ბოლოს იქით: წინ აღარ მიდის
        [40, 21, 40],
    ])("next page from offset %i of %i rows → offset %i", (offset, allRowsCount, expected) => {
        expect(clickButton(nextButton, offset, allRowsCount)).toHaveBeenCalledWith(expected, 10);
    });

    it.each([firstButton, previousButton, nextButton, lastButton])(
        "button %i prevents the default click action and calls onChange once",
        (buttonIndex) => {
            const onChange = renderPagination(10, 21);

            const notPrevented = fireEvent.click(screen.getAllByRole("button")[buttonIndex]);

            expect(notPrevented).toBe(false);
            expect(onChange).toHaveBeenCalledTimes(1);
        }
    );

    it("rows per page change keeps the offset and passes the new count", () => {
        const onChange = renderPagination(20, 76);

        fireEvent.change(screen.getByRole("combobox"), { target: { value: "25" } });

        expect(onChange).toHaveBeenCalledExactlyOnceWith(20, 25);
    });

    it("offers 10, 25, 50 and 100 rows per page", () => {
        renderPagination(0, 76);

        expect(screen.getAllByRole("option").map((o) => (o as HTMLOptionElement).value)).toEqual([
            "10",
            "25",
            "50",
            "100",
        ]);
    });

    it("typed offset is passed with the current rows per page", () => {
        const onChange = renderPagination(0, 76, 25);

        fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "30" } });

        expect(onChange).toHaveBeenCalledExactlyOnceWith(30, 25);
    });

    it("cleared offset keeps the current offset", () => {
        const onChange = renderPagination(20, 76);

        fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "" } });

        expect(onChange).toHaveBeenCalledExactlyOnceWith(20, 10);
    });

    it("shows the current offset in the offset field", () => {
        renderPagination(20, 76);

        expect(screen.getByRole("spinbutton")).toHaveValue(20);
    });

    it.each([
        [0, "40px"],
        [8, "40px"],
        [9, "49px"],
        [99, "58px"],
    ])("offset field for offset %i is %s wide", (offset, width) => {
        renderPagination(offset, 200);

        expect(screen.getByRole("spinbutton").style.width).toBe(width);
    });

    it.each([
        [0, 21, "ჩანაწერები: 1-10 სულ: 21 "],
        [20, 21, "ჩანაწერები: 21-21 სულ: 21 "],
        [10, 20, "ჩანაწერები: 11-20 სულ: 20 "],
        [70, 76, "ჩანაწერები: 71-76 სულ: 76 "],
    ])("offset %i of %i rows shows %s", (offset, allRowsCount, text) => {
        renderPagination(offset, allRowsCount);

        expect(recordsText()).toBe(text);
    });

    it("works without onChange", () => {
        render(<GridPagenation offset={10} rowsCountPerPage={10} allRowsCount={21} />);

        for (const button of screen.getAllByRole("button")) fireEvent.click(button);
        fireEvent.change(screen.getByRole("combobox"), { target: { value: "25" } });
        fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "30" } });

        expect(recordsText()).toBe("ჩანაწერები: 11-20 სულ: 21 ");
    });
});
