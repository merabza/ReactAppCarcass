//Profile.test.tsx

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import Profile from "./Profile";
import ProfileTopNavMenu from "./ProfileTopNavMenu";
import { userRightsApi } from "../redux/api/userRightsApi";
import alertReducer from "../redux/slices/alertSlice";
import appParametersReducer from "../redux/slices/appParametersSlice";
import navMenuReducer from "../redux/slices/navMenuSlice";
import userReducer, { setSsoUser, setUser } from "../redux/slices/userSlice";
import type { IAppUser } from "../redux/types/authenticationTypes";

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

function renderWithStore(store: ReturnType<typeof createStore>, element: ReactElement) {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/profile"]}>{element}</MemoryRouter>
        </Provider>
    );
}

function ssoStore() {
    const store = createStore();
    store.dispatch(
        setSsoUser({
            userId: 3,
            userName: "testuser",
            email: "test.user@example.com",
            firstName: "სატესტო",
            lastName: "ტესტერაძე",
            roleName: "Admin, Editor",
            appClaims: [],
            logoutToken: "antiforgery-token",
            logoutFormFieldName: "__RequestVerificationToken",
        })
    );
    return store;
}

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("Profile in the Sso mode", () => {
    it("shows the data and the link to the account on sso, without a form", () => {
        vi.stubEnv("VITE_AUTH_MODE", "sso");
        vi.stubEnv("VITE_SSO_URL", "http://localhost:5090/");

        renderWithStore(ssoStore(), <Profile />);

        expect(screen.getByText("testuser")).toBeInTheDocument();
        expect(screen.getByText("test.user@example.com")).toBeInTheDocument();
        expect(screen.getByText("სატესტო")).toBeInTheDocument();
        expect(screen.getByText("ტესტერაძე")).toBeInTheDocument();
        expect(screen.getByText("Admin, Editor")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "ანგარიშის მართვა sso.ltg.ge-ზე" })).toHaveAttribute(
            "href",
            "http://localhost:5090/account/profile"
        );
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("tells that the sso address is missing", () => {
        vi.stubEnv("VITE_AUTH_MODE", "sso");
        vi.stubEnv("VITE_SSO_URL", "");

        renderWithStore(ssoStore(), <Profile />);

        expect(screen.getByText("sso.ltg.ge-ის მისამართი (VITE_SSO_URL) მითითებული არ არის")).toBeInTheDocument();
    });

    it("has no password and delete buttons in the top bar", () => {
        vi.stubEnv("VITE_AUTH_MODE", "sso");

        const { container } = renderWithStore(ssoStore(), <ProfileTopNavMenu />);

        expect(container).toBeEmptyDOMElement();
    });
});

describe("Profile in the Local mode", () => {
    it("edits the names and has the password and delete buttons, as before", () => {
        vi.stubEnv("VITE_AUTH_MODE", "local");
        const store = createStore();
        store.dispatch(
            setUser({ userId: 3, userName: "testuser", firstName: "სატესტო", lastName: "ტესტერაძე", token: "t" } as IAppUser)
        );

        renderWithStore(
            store,
            <>
                <ProfileTopNavMenu />
                <Profile />
            </>
        );

        expect(screen.getAllByRole("textbox")).toHaveLength(2);
        expect(screen.getByRole("button", { name: /პაროლის შეცვლა/ })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /ანგარიშის წაშლა/ })).toBeInTheDocument();
        expect(screen.queryByText("ანგარიშის მართვა sso.ltg.ge-ზე")).not.toBeInTheDocument();
    });
});
