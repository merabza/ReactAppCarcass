//errorTypes.test.ts

import { describe, expect, it } from "vitest";

import { buildErrorMessage } from "./errorTypes";

const serverError = { errorCode: "ServerSideError", errorMessage: "სერვერის შეცდომა" };
const tooManyRequests = {
    errorCode: "TooManyRequests",
    errorMessage: "ძალიან ბევრი მოთხოვნა. სცადეთ ერთი წუთის შემდეგ",
};

// buildErrorMessage turns every failed RTK Query call into the Err[] the alerts show. The carcass rate limiter
// answers 429 with an empty body, which used to fall through to the generic server error
describe("buildErrorMessage", () => {
    it("explains an empty 429 from the onQueryStarted envelope", () => {
        expect(buildErrorMessage({ error: { status: 429, data: null } })).toEqual([tooManyRequests]);
    });

    it("explains an empty 429 from unwrap()", () => {
        expect(buildErrorMessage({ status: 429, data: null })).toEqual([tooManyRequests]);
    });

    it("explains a 429 whose body could not be parsed", () => {
        const parsingError = {
            status: "PARSING_ERROR",
            originalStatus: 429,
            data: "Too Many Requests",
            error: "SyntaxError: Unexpected token",
        };

        expect(buildErrorMessage({ error: parsingError })).toEqual([tooManyRequests]);
    });

    it("keeps the server's own message when a 429 carries one", () => {
        const problem = { title: "RateLimited", status: 429, detail: "სცადეთ მოგვიანებით" };

        expect(buildErrorMessage({ error: { status: 429, data: problem } })).toEqual([
            { errorCode: "RateLimited", errorMessage: "სცადეთ მოგვიანებით" },
        ]);
    });

    it.each([401, 403, 500])("still shows the generic server error for an empty %i", (status) => {
        expect(buildErrorMessage({ error: { status, data: null } })).toEqual([serverError]);
    });

    it("still shows the generic server error for a network failure", () => {
        const fetchError = { status: "FETCH_ERROR", error: "TypeError: Failed to fetch" };

        expect(buildErrorMessage({ error: fetchError })).toEqual([serverError]);
    });

    it("appends the additional error after the 429 message", () => {
        const extra = { errorCode: "Extra", errorMessage: "დამატებითი" };

        expect(buildErrorMessage({ error: { status: 429, data: null } }, extra)).toEqual([tooManyRequests, extra]);
    });
});
