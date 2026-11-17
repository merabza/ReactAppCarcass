//GridPagenation.test.tsx

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import GridPagenation from "./GridPagenation";

// ღილაკები: «, ‹, ›, » (ამ თანმიმდევრობით)
const firstButton = 0;
const previousButton = 1;
const nextButton = 2;
const lastButton = 3;

function clickButton(buttonIndex: number, offset: number, allRowsCount: number, rowsCountPerPage = 10) {
    const onChange = vi.fn();
    render(
        <GridPagenation
            offset={offset}
            rowsCountPerPage={rowsCountPerPage}
            allRowsCount={allRowsCount}
            onChange={onChange}
        />
    );
    fireEvent.click(screen.getAllByRole("button")[buttonIndex]);
    return onChange;
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
});
