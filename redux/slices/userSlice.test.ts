//userSlice.test.ts

import { afterEach, describe, expect, it, vi } from "vitest";

import type { IAppUser, IBffUser, IPendingLogin } from "../types/authenticationTypes";

const bffUser: IBffUser = {
    userId: 7,
    userName: "testuser",
    email: "test.user@example.com",
    firstName: "სატესტო",
    lastName: "მომხმარებელი",
    roleName: "Admin, Editor",
    appClaims: ["SaveSamples"],
    logoutToken: "antiforgery-token",
    logoutFormFieldName: "__RequestVerificationToken",
};

//userSlice-ის საწყისი მდგომარეობა მოდულის ჩატვირთვისას იქმნება, ამიტომ ყოველი ტესტი მას რეჟიმის მითითების შემდეგ
//თავიდან ტვირთავს
async function loadUserSlice(mode: "local" | "sso") {
    vi.stubEnv("VITE_AUTH_MODE", mode);
    vi.resetModules();
    return await import("./userSlice");
}

afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
});

describe("userSlice in the Sso mode", () => {
    it("removes the tokens of the Local mode from localStorage at start", async () => {
        localStorage.setItem("user", JSON.stringify({ userName: "testuser", token: "old-access", refreshToken: "old" }));
        localStorage.setItem("pendingLogin", JSON.stringify({ token: "pending" }));

        const { default: reducer } = await loadUserSlice("sso");
        const state = reducer(undefined, { type: "@@test/init" });

        expect(state.user).toBeNull();
        expect(state.pendingLogin).toBeNull();
        expect(localStorage.getItem("user")).toBeNull();
        expect(localStorage.getItem("pendingLogin")).toBeNull();
    });

    it("keeps the user of /bff/user only in memory, without a token", async () => {
        const { default: reducer, setSsoUser } = await loadUserSlice("sso");

        const state = reducer(undefined, setSsoUser(bffUser));

        expect(state.user).toEqual({
            userId: 7,
            userName: "testuser",
            email: "test.user@example.com",
            firstName: "სატესტო",
            lastName: "მომხმარებელი",
            roleName: "Admin, Editor",
            appClaims: ["SaveSamples"],
            sequentialNumber: 0,
            token: "",
        });
        expect(state.isUserValid).toBe(true);
        expect(state.userValidationChecked).toBe(true);
        expect(state.ssoLogoutForm).toEqual({ fieldName: "__RequestVerificationToken", token: "antiforgery-token" });
        expect(localStorage.length).toBe(1); //მხოლოდ ჩანართის მთვლელი (lastTwId)
        expect(localStorage.getItem("user")).toBeNull();
    });

    it("does not store a user with a token either", async () => {
        const { default: reducer, setUser, setPendingLogin } = await loadUserSlice("sso");

        const state = reducer(undefined, setUser({ userName: "testuser", token: "access" } as IAppUser));
        reducer(state, setPendingLogin({ token: "pending" } as IPendingLogin));

        expect(localStorage.getItem("user")).toBeNull();
        expect(localStorage.getItem("pendingLogin")).toBeNull();
    });

    it("has no logout form when /bff/user did not send its token", async () => {
        const { default: reducer, setSsoUser } = await loadUserSlice("sso");

        const state = reducer(undefined, setSsoUser({ ...bffUser, logoutToken: null }));

        expect(state.ssoLogoutForm).toBeNull();
    });

    it("forgets the user and the logout form on logout", async () => {
        const { default: reducer, setSsoUser, logout } = await loadUserSlice("sso");

        const state = reducer(reducer(undefined, setSsoUser(bffUser)), logout());

        expect(state.user).toBeNull();
        expect(state.ssoLogoutForm).toBeNull();
    });
});

describe("userSlice in the Local mode", () => {
    it("restores the stored user at start, as before", async () => {
        localStorage.setItem("user", JSON.stringify({ userName: "testuser", token: "access" }));

        const { default: reducer } = await loadUserSlice("local");
        const state = reducer(undefined, { type: "@@test/init" });

        expect(state.user).toEqual({ userName: "testuser", token: "access" });
        expect(state.ssoLogoutForm).toBeNull();
    });

    it("stores the logged-in user in localStorage, as before", async () => {
        const { default: reducer, setUser } = await loadUserSlice("local");

        reducer(undefined, setUser({ userName: "testuser", token: "access" } as IAppUser));

        expect(JSON.parse(localStorage.getItem("user")!)).toEqual({ userName: "testuser", token: "access" });
    });
});
