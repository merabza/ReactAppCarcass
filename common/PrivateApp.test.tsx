//PrivateApp.test.tsx

import { configureStore } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PrivateApp from "./PrivateApp";
import { browserNavigation } from "./authMode";
import { userRightsApi } from "../redux/api/userRightsApi";
import alertReducer from "../redux/slices/alertSlice";
import appParametersReducer from "../redux/slices/appParametersSlice";
import navMenuReducer from "../redux/slices/navMenuSlice";
import userReducer from "../redux/slices/userSlice";
import type { IBffUser } from "../redux/types/authenticationTypes";

const bffUser: IBffUser = {
    userId: 3,
    userName: "testuser",
    email: "test.user@example.com",
    firstName: "სატესტო",
    lastName: "მომხმარებელი",
    roleName: "Editor",
    appClaims: [],
    logoutToken: "antiforgery-token",
    logoutFormFieldName: "__RequestVerificationToken",
};

function createStore() {
    return configureStore({
        reducer: {
            [userRightsApi.reducerPath]: userRightsApi.reducer,
            alertState: alertReducer,
            appParametersState: appParametersReducer,
            navMenuState: navMenuReducer,
            userState: userReducer,
        },
        preloadedState: { appParametersState: { appName: "test", baseUrl: `${window.location.origin}/api/v1` } },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }).concat(userRightsApi.middleware),
    });
}

//გლობალური fetch-ის ჩანაცვლება: ყოველი მოთხოვნა ინახება და პასუხს reply აბრუნებს
function stubFetch(reply: (request: Request, index: number) => Response): Request[] {
    const requests: Request[] = [];
    vi.stubGlobal(
        "fetch",
        vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
            const request = input instanceof Request ? input : new Request(input, init);
            requests.push(request);
            return reply(request, requests.length - 1);
        })
    );
    return requests;
}

function json(status: number, body: unknown): Response {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function renderPrivateApp(store: ReturnType<typeof createStore>, path: string) {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route path="/" element={<PrivateApp />}>
                        <Route index element={<div>home page</div>} />
                        <Route path="units" element={<div>units page</div>} />
                    </Route>
                    <Route path="/login" element={<div>login page</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
}

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
});

describe("PrivateApp in the Sso mode", () => {
    beforeEach(() => {
        vi.stubEnv("VITE_AUTH_MODE", "sso");
    });

    it("takes the user from /bff/user and shows the page", async () => {
        const requests = stubFetch(() => json(200, bffUser));
        const store = createStore();

        renderPrivateApp(store, "/");

        expect(await screen.findByText("home page")).toBeInTheDocument();
        expect(requests).toHaveLength(1);
        expect(requests[0].url).toBe(`${window.location.origin}/bff/user`);
        expect(requests[0].headers.get("X-CSRF")).toBe("1");
        expect(requests[0].headers.get("authorization")).toBeNull();
        expect(store.getState().userState.user?.userName).toBe("testuser");
        expect(localStorage.getItem("user")).toBeNull();
    });

    it("goes to /bff/login with the current page when there is no session", async () => {
        const replace = vi.spyOn(browserNavigation, "replace").mockImplementation(() => {});
        stubFetch(() => new Response(null, { status: 401 }));
        window.history.pushState({}, "", "/units?unit=5");

        renderPrivateApp(createStore(), "/units");

        await waitFor(() => expect(replace).toHaveBeenCalledWith("/bff/login?returnUrl=%2Funits%3Funit%3D5"));
        expect(screen.getByText("მოიცადე...")).toBeInTheDocument();
        expect(screen.queryByText("units page")).not.toBeInTheDocument();
    });

    it("shows an error with a retry instead of a redirect when the host fails", async () => {
        const replace = vi.spyOn(browserNavigation, "replace").mockImplementation(() => {});
        const requests = stubFetch((_request, index) =>
            index === 0 ? new Response(null, { status: 502 }) : json(200, bffUser)
        );

        renderPrivateApp(createStore(), "/");

        expect(await screen.findByText(/მომხმარებლის მონაცემები ვერ ჩაიტვირთა/)).toBeInTheDocument();
        expect(replace).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole("button", { name: "თავიდან ცდა" }));

        expect(await screen.findByText("home page")).toBeInTheDocument();
        expect(requests).toHaveLength(2);
    });
});

describe("PrivateApp in the Local mode", () => {
    it("sends a visitor without a stored user to /login, as before", async () => {
        vi.stubEnv("VITE_AUTH_MODE", "local");
        const requests = stubFetch(() => json(200, bffUser));

        renderPrivateApp(createStore(), "/");

        expect(await screen.findByText("login page")).toBeInTheDocument();
        expect(requests).toHaveLength(0);
    });
});
