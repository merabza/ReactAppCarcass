//LtgAppLinks.test.tsx

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LtgAppLinks from "./LtgAppLinks";
import { loadLtgApps, resetLtgAppsCache } from "./ltgApps";

const ssoUrl = "https://sso.example/";
const apps = [
    { name: "app.errata.ge", url: "https://errata.example/" },
    { name: "app.grammar.ge", url: "https://grammar.example/" },
];

function stubFetch(reply: () => Promise<Response>) {
    const fetch = vi.fn(reply);
    vi.stubGlobal("fetch", fetch);
    return fetch;
}

function json(body: unknown, status = 200): Promise<Response> {
    return Promise.resolve(
        new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
    );
}

beforeEach(() => {
    resetLtgAppsCache();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe("loadLtgApps", () => {
    beforeEach(() => {
        vi.stubEnv("VITE_AUTH_MODE", "sso");
        vi.stubEnv("VITE_SSO_URL", ssoUrl);
    });

    it("reads /apps of sso without cookies and only once", async () => {
        const fetch = stubFetch(() => json(apps));

        expect(await loadLtgApps()).toEqual(apps);
        expect(await loadLtgApps()).toEqual(apps);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${ssoUrl}apps`, { credentials: "omit" });
    });

    it("drops the current app (same origin) and entries that are not http(s) links", async () => {
        stubFetch(() =>
            json([
                ...apps,
                { name: "this app", url: `${window.location.origin}/` },
                { name: "script", url: "javascript:alert(1)" },
                { name: "", url: "https://empty.example/" },
                { name: "no url" },
                "text",
            ])
        );

        expect(await loadLtgApps()).toEqual(apps);
    });

    it.each([
        ["an error status", () => json(apps, 500)],
        ["a network error", () => Promise.reject(new TypeError("Failed to fetch"))],
        ["something that is not a list", () => json({ apps })],
    ])("is empty on %s", async (_, reply) => {
        stubFetch(reply);

        expect(await loadLtgApps()).toEqual([]);
    });

    it("does not ask sso without VITE_SSO_URL", async () => {
        vi.stubEnv("VITE_SSO_URL", "");
        const fetch = stubFetch(() => json(apps));

        expect(await loadLtgApps()).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });
});

describe("LtgAppLinks", () => {
    it("shows the other apps as links in the same tab in the Sso mode", async () => {
        vi.stubEnv("VITE_AUTH_MODE", "sso");
        vi.stubEnv("VITE_SSO_URL", ssoUrl);
        stubFetch(() => json(apps));

        render(<LtgAppLinks />);

        const errata = await screen.findByRole("link", { name: "app.errata.ge" });
        expect(errata).toHaveAttribute("href", "https://errata.example/");
        expect(errata).not.toHaveAttribute("target");
        expect(screen.getByRole("link", { name: "app.grammar.ge" })).toHaveAttribute(
            "href",
            "https://grammar.example/"
        );
        expect(screen.getByRole("heading", { name: "LTG-ის სხვა აპები" })).toBeInTheDocument();
    });

    it("shows nothing in the Local mode and does not ask sso", async () => {
        vi.stubEnv("VITE_AUTH_MODE", "local");
        vi.stubEnv("VITE_SSO_URL", ssoUrl);
        const fetch = stubFetch(() => json(apps));

        const { container } = render(<LtgAppLinks />);

        await waitFor(() => expect(container).toBeEmptyDOMElement());
        expect(fetch).not.toHaveBeenCalled();
    });
});
