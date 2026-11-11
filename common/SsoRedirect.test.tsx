//SsoRedirect.test.tsx

import { render, screen } from "@testing-library/react";
import type { FC } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { browserNavigation } from "./authMode";
import ChangeRequiredPasswordPage from "./ChangeRequiredPasswordPage";
import ConfirmEmailPage from "./ConfirmEmailPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegistrationPage";
import ResetPasswordPage from "./ResetPasswordPage";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
});

//Sso რეჟიმში აპის შესვლისა და პაროლის მარშრუტები თავიანთ გვერდს აღარ ხატავს: ბრაუზერი sso-ზე გადადის
describe("the sign-in and password pages in the Sso mode", () => {
    beforeEach(() => {
        vi.stubEnv("VITE_AUTH_MODE", "sso");
        vi.stubEnv("VITE_SSO_URL", "http://localhost:5090/");
    });

    const pages: [string, FC, string][] = [
        ["/login", LoginPage, "/bff/login?returnUrl=%2F"],
        ["/registration", RegistrationPage, "http://localhost:5090/account/register"],
        ["/confirm-email", ConfirmEmailPage, "http://localhost:5090/account/confirm-email"],
        [
            "/change-required-password",
            ChangeRequiredPasswordPage,
            "http://localhost:5090/account/change-required-password",
        ],
        ["/forgot-password", ForgotPasswordPage, "http://localhost:5090/account/forgot-password"],
        ["/reset-password", ResetPasswordPage, "http://localhost:5090/account/reset-password"],
    ];

    it.each(pages)("%s goes to %s", (_route, Page, target) => {
        const replace = vi.spyOn(browserNavigation, "replace").mockImplementation(() => {});

        render(<Page />);

        expect(replace).toHaveBeenCalledWith(target);
        expect(screen.getByText(/გადამისამართება/)).toBeInTheDocument();
    });

    it("tells that the sso address is missing instead of going nowhere", () => {
        vi.stubEnv("VITE_SSO_URL", "");
        const replace = vi.spyOn(browserNavigation, "replace").mockImplementation(() => {});

        render(<RegistrationPage />);

        expect(screen.getByText("sso.ltg.ge-ის მისამართი (VITE_SSO_URL) მითითებული არ არის")).toBeInTheDocument();
        expect(replace).not.toHaveBeenCalled();
    });
});
