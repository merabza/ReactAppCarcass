//jwtBaseQuery.test.ts

import { configureStore } from "@reduxjs/toolkit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { userRightsApi } from "./userRightsApi";
import alertReducer from "../slices/alertSlice";
import appParametersReducer from "../slices/appParametersSlice";
import navMenuReducer from "../slices/navMenuSlice";
import userReducer, { setUser } from "../slices/userSlice";
import type { IAppUser } from "../types/authenticationTypes";
import { browserNavigation } from "../../common/authMode";

const baseUrl = `${window.location.origin}/api/v1`;
const emptyMenu = { menuGroups: [] };

function createStore() {
    return configureStore({
        reducer: {
            [userRightsApi.reducerPath]: userRightsApi.reducer,
            alertState: alertReducer,
            appParametersState: appParametersReducer,
            navMenuState: navMenuReducer,
            userState: userReducer,
        },
        preloadedState: { appParametersState: { appName: "test", baseUrl } },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }).concat(userRightsApi.middleware),
    });
}

//გლობალური fetch-ის ჩანაცვლება: ყოველი მოთხოვნა ინახება და პასუხს reply აბრუნებს
function stubFetch(reply: (request: Request) => Response): Request[] {
    const requests: Request[] = [];
    vi.stubGlobal(
        "fetch",
        vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
            const request = input instanceof Request ? input : new Request(input, init);
            requests.push(request);
            return reply(request);
        })
    );
    return requests;
}

function json(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
});

describe("jwtBaseQuery in the Sso mode", () => {
    beforeEach(() => {
        vi.stubEnv("VITE_AUTH_MODE", "sso");
    });

    it("sends the CSRF header and no Authorization, also without a user in the store", async () => {
        const requests = stubFetch(() => json(200, emptyMenu));
        const store = createStore();

        const result = await store.dispatch(userRightsApi.endpoints.getMainMenu.initiate());

        expect(result.isSuccess).toBe(true);
        expect(requests).toHaveLength(1);
        expect(requests[0].url).toBe(`${baseUrl}/userrights/getmainmenu`);
        expect(requests[0].headers.get("X-CSRF")).toBe("1");
        expect(requests[0].headers.get("authorization")).toBeNull();
        expect(requests[0].credentials).toBe("same-origin");
    });

    it("goes to /bff/login with the current page on 401 and does not refresh", async () => {
        const replace = vi.spyOn(browserNavigation, "replace").mockImplementation(() => {});
        const requests = stubFetch(() => new Response(null, { status: 401 }));
        window.history.pushState({}, "", "/units?unit=5");
        const store = createStore();

        const result = await store.dispatch(userRightsApi.endpoints.getMainMenu.initiate());

        expect(result.isError).toBe(true);
        expect(replace).toHaveBeenCalledWith("/bff/login?returnUrl=%2Funits%3Funit%3D5");
        expect(requests.map((request) => request.url)).toEqual([`${baseUrl}/userrights/getmainmenu`]);
    });

    it("does not leave the page on other errors", async () => {
        const replace = vi.spyOn(browserNavigation, "replace").mockImplementation(() => {});
        stubFetch(() => new Response(null, { status: 403 }));
        const store = createStore();

        const result = await store.dispatch(userRightsApi.endpoints.getMainMenu.initiate());

        expect(result.isError).toBe(true);
        expect(replace).not.toHaveBeenCalled();
    });
});

describe("jwtBaseQuery in the Local mode", () => {
    beforeEach(() => {
        vi.stubEnv("VITE_AUTH_MODE", "local");
    });

    it("sends the Bearer token and no CSRF header", async () => {
        const requests = stubFetch(() => json(200, emptyMenu));
        const store = createStore();
        store.dispatch(setUser({ token: "access-1" } as IAppUser));

        await store.dispatch(userRightsApi.endpoints.getMainMenu.initiate());

        expect(requests[0].headers.get("authorization")).toBe("Bearer access-1");
        expect(requests[0].headers.get("X-CSRF")).toBeNull();
    });

    it("answers 401 without a request when nobody is logged in", async () => {
        const requests = stubFetch(() => json(200, emptyMenu));
        const store = createStore();

        const result = await store.dispatch(userRightsApi.endpoints.getMainMenu.initiate());

        expect(result.isError).toBe(true);
        expect(requests).toHaveLength(0);
    });

    it("refreshes the token on 401 and repeats the request, as before", async () => {
        const replace = vi.spyOn(browserNavigation, "replace").mockImplementation(() => {});
        const requests = stubFetch((request) => {
            if (request.url.endsWith("/authentication/refresh"))
                return json(200, { token: "access-2", refreshToken: "refresh-2" });
            return request.headers.get("authorization") === "Bearer access-2"
                ? json(200, emptyMenu)
                : new Response(null, { status: 401 });
        });
        const store = createStore();
        store.dispatch(setUser({ token: "access-1", refreshToken: "refresh-1" } as IAppUser));

        const result = await store.dispatch(userRightsApi.endpoints.getMainMenu.initiate());

        expect(result.isSuccess).toBe(true);
        expect(requests.map((request) => request.url)).toEqual([
            `${baseUrl}/userrights/getmainmenu`,
            `${baseUrl}/authentication/refresh`,
            `${baseUrl}/userrights/getmainmenu`,
        ]);
        expect(store.getState().userState.user?.token).toBe("access-2");
        expect(replace).not.toHaveBeenCalled();
    });
});
