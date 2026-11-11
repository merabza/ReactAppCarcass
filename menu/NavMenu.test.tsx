//NavMenu.test.tsx

import { configureStore } from "@reduxjs/toolkit";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import NavMenu from "./NavMenu";
import { userRightsApi } from "../redux/api/userRightsApi";
import alertReducer from "../redux/slices/alertSlice";
import appParametersReducer from "../redux/slices/appParametersSlice";
import navMenuReducer from "../redux/slices/navMenuSlice";
import userReducer, { logout, setSsoUser, setUser } from "../redux/slices/userSlice";
import type { IAppUser } from "../redux/types/authenticationTypes";
import type { IMainMenuModel } from "../redux/types/userRightsTypes";
import { mockFetch, testBaseUrl } from "../../testUtils/testStore";

function mainMenu(...menKeys: string[]): IMainMenuModel {
    return {
        menuGroups: [
            {
                mengId: 1,
                mengKey: "Main",
                mengName: "Main",
                sortId: 0,
                mengIconName: null,
                hidden: true,
                expanded: false,
                menu: menKeys.map((menKey, index) => ({
                    menId: index + 1,
                    menKey,
                    menName: `menu ${menKey}`,
                    menValue: null,
                    menGroupId: 1,
                    sortId: index,
                    menLinkKey: menKey,
                    menIconName: null,
                    create: true,
                    update: true,
                    delete: true,
                    confirm: false,
                })),
            },
        ],
    };
}

function createStore() {
    return configureStore({
        reducer: {
            [userRightsApi.reducerPath]: userRightsApi.reducer,
            alertState: alertReducer,
            appParametersState: appParametersReducer,
            navMenuState: navMenuReducer,
            userState: userReducer,
        },
        preloadedState: { appParametersState: { appName: "test", baseUrl: testBaseUrl } },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }).concat(userRightsApi.middleware),
    });
}

function renderNavMenu(store: ReturnType<typeof createStore>) {
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <NavMenu />
            </MemoryRouter>
        </Provider>
    );
}

// the server answers with the menu of the user whose token the request carries
function mockMenuByToken(menus: { [token: string]: IMainMenuModel }) {
    return mockFetch((call) => ({ status: 200, body: menus[call.authorization!.replace("Bearer ", "")] }));
}

afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
});

describe("NavMenu", () => {
    it("shows the menu of the user who logged in", async () => {
        mockMenuByToken({ keti: mainMenu("ArticlesEditor") });
        const store = createStore();
        store.dispatch(setUser({ token: "keti" } as IAppUser));

        renderNavMenu(store);

        expect(await screen.findByText("menu ArticlesEditor")).toBeInTheDocument();
    });

    // the sidebar of Ling showed the whole Admin menu when keti logged in after an Admin in the same tab
    it("loads the menu again for the next user instead of keeping the previous one", async () => {
        const calls = mockMenuByToken({
            admin: mainMenu("Rights", "ArticlesEditor"),
            keti: mainMenu("ArticlesEditor"),
        });
        const store = createStore();
        store.dispatch(setUser({ token: "admin" } as IAppUser));
        const adminView = renderNavMenu(store);
        expect(await screen.findByText("menu Rights")).toBeInTheDocument();

        adminView.unmount();
        store.dispatch(logout());
        store.dispatch(setUser({ token: "keti" } as IAppUser));
        renderNavMenu(store);

        expect(await screen.findByText("menu ArticlesEditor")).toBeInTheDocument();
        expect(screen.queryByText("menu Rights")).not.toBeInTheDocument();
        expect(calls.map((call) => call.authorization)).toEqual(["Bearer admin", "Bearer keti"]);
        expect(store.getState().navMenuState.flatMenu?.map((item) => item.menKey)).toEqual(["ArticlesEditor"]);
    });

    it("forgets the menu on logout", async () => {
        mockMenuByToken({ admin: mainMenu("Rights") });
        const store = createStore();
        store.dispatch(setUser({ token: "admin" } as IAppUser));
        renderNavMenu(store);
        expect(await screen.findByText("menu Rights")).toBeInTheDocument();

        act(() => {
            store.dispatch(logout());
        });

        expect(store.getState().navMenuState.mainMenu).toBeNull();
        expect(store.getState().navMenuState.flatMenu).toBeNull();
        expect(screen.queryByText("menu Rights")).not.toBeInTheDocument();
    });
});

describe("NavMenu sign-out", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it("goes to /login in the Local mode, as before", async () => {
        vi.stubEnv("VITE_AUTH_MODE", "local");
        mockMenuByToken({ admin: mainMenu("Rights") });
        const store = createStore();
        store.dispatch(setUser({ token: "admin" } as IAppUser));

        renderNavMenu(store);

        expect(await screen.findByText("menu Rights")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "გასასვლელი" })).toHaveAttribute("href", "/login");
    });

    describe("in the Sso mode", () => {
        beforeEach(() => {
            vi.stubEnv("VITE_AUTH_MODE", "sso");
        });

        // გასვლა ფორმის POST-ია /bff/logout-ზე /bff/user-იდან მიღებული antiforgery ტოკენით
        it("posts the antiforgery token of /bff/user to /bff/logout", async () => {
            mockFetch(() => ({ status: 200, body: mainMenu("Rights") }));
            const submit = vi.spyOn(HTMLFormElement.prototype, "submit").mockImplementation(() => {});
            const store = createStore();
            store.dispatch(
                setSsoUser({
                    userId: 3,
                    userName: "testuser",
                    email: "test.user@example.com",
                    firstName: "სატესტო",
                    lastName: "მომხმარებელი",
                    roleName: "Admin",
                    appClaims: [],
                    logoutToken: "antiforgery-token",
                    logoutFormFieldName: "__RequestVerificationToken",
                })
            );

            renderNavMenu(store);

            expect(await screen.findByText("menu Rights")).toBeInTheDocument();
            expect(screen.getByText("სატესტო მომხმარებელი")).toBeInTheDocument();
            expect(screen.queryByRole("link", { name: "გასასვლელი" })).not.toBeInTheDocument();
            const signOut = screen.getByRole("button", { name: "გასასვლელი" });
            const form = signOut.closest("form")!;
            expect(form).toHaveAttribute("method", "post");
            expect(form).toHaveAttribute("action", "/bff/logout");
            const field = form.querySelector<HTMLInputElement>("input[type=hidden]")!;
            expect(field.name).toBe("__RequestVerificationToken");
            expect(field.value).toBe("antiforgery-token");

            await userEvent.click(signOut);

            expect(submit).toHaveBeenCalledTimes(1);
            expect(submit.mock.contexts[0]).toBe(form);
        });
    });
});
