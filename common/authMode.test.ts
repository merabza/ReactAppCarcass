//authMode.test.ts

import { afterEach, describe, expect, it, vi } from "vitest";

import {
    bffLoginUrl,
    bffUrl,
    browserNavigation,
    getAuthMode,
    isSsoMode,
    localPathOrRoot,
    redirectToBffLogin,
    ssoAccountPages,
    ssoPageUrl,
} from "./authMode";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
});

describe("getAuthMode", () => {
    it("is local when VITE_AUTH_MODE is not set", () => {
        vi.stubEnv("VITE_AUTH_MODE", undefined);

        expect(getAuthMode()).toBe("local");
        expect(isSsoMode()).toBe(false);
    });

    it.each(["sso", "SSO", " Sso "])("is sso for %j", (value) => {
        vi.stubEnv("VITE_AUTH_MODE", value);

        expect(getAuthMode()).toBe("sso");
        expect(isSsoMode()).toBe(true);
    });

    it.each(["local", "", "bff", "ssoo"])("is local for %j", (value) => {
        vi.stubEnv("VITE_AUTH_MODE", value);

        expect(getAuthMode()).toBe("local");
    });
});

describe("localPathOrRoot", () => {
    it.each(["/", "/units", "/units?x=1&y=%D0", "/mdList/ErrorTypes#top"])("keeps the local path %j", (path) => {
        expect(localPathOrRoot(path)).toBe(path);
    });

    //open redirect: სხვა საიტის მისამართი, protocol-relative გზა ან სამართავი სიმბოლო მთავარ გვერდზე იცვლება
    it.each([
        null,
        undefined,
        "",
        "units",
        "https://evil.example/",
        "//evil.example/",
        "/\\evil.example/",
        "/units\nSet-Cookie: x",
        "/units\u007f",
    ])("turns %j into the root", (path) => {
        expect(localPathOrRoot(path)).toBe("/");
    });
});

describe("bffLoginUrl", () => {
    it("encodes the local return path", () => {
        expect(bffLoginUrl("/units?x=1&y=2")).toBe("/bff/login?returnUrl=%2Funits%3Fx%3D1%26y%3D2");
    });

    it("returns to the root instead of another site", () => {
        expect(bffLoginUrl("//evil.example/")).toBe("/bff/login?returnUrl=%2F");
        expect(bffLoginUrl(undefined)).toBe("/bff/login?returnUrl=%2F");
    });
});

describe("bffUrl", () => {
    it("is on the origin of the page", () => {
        expect(bffUrl("/bff/user")).toBe(`${window.location.origin}/bff/user`);
    });
});

describe("ssoPageUrl", () => {
    it.each(["http://localhost:5090/", "http://localhost:5090"])("joins the sso address %j and the page", (sso) => {
        vi.stubEnv("VITE_SSO_URL", sso);

        expect(ssoPageUrl(ssoAccountPages.registration)).toBe("http://localhost:5090/account/register");
        expect(ssoPageUrl(ssoAccountPages.profile)).toBe("http://localhost:5090/account/profile");
    });

    it.each([undefined, "", "   ", "not an address"])("is null without a valid sso address (%j)", (sso) => {
        vi.stubEnv("VITE_SSO_URL", sso);

        expect(ssoPageUrl(ssoAccountPages.registration)).toBeNull();
    });
});

describe("redirectToBffLogin", () => {
    it("replaces the page with /bff/login and the current path as returnUrl", () => {
        const replace = vi.spyOn(browserNavigation, "replace").mockImplementation(() => {});
        window.history.pushState({}, "", "/examples?type=2");

        redirectToBffLogin();

        expect(replace).toHaveBeenCalledWith("/bff/login?returnUrl=%2Fexamples%3Ftype%3D2");
    });
});
