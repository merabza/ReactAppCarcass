//authMode.ts

//ავტორიზაციის რეჟიმი (VITE_AUTH_MODE):
//  local — აპის საკუთარი შესვლის გვერდები და JWT localStorage-ში (ნაგულისხმევი, ქცევა უცვლელია);
//  sso — შესვლა sso.ltg.ge-ით აპის ჰოსტის BFF-ის გავლით: ბრაუზერს მხოლოდ HttpOnly cookie აქვს, ტოკენები ჰოსტზეა
//  (merabza/SsoLtgGe#7, sso-design.md D17)
export type AuthMode = "local" | "sso";

export function getAuthMode(): AuthMode {
    const mode: unknown = import.meta.env.VITE_AUTH_MODE;
    return typeof mode === "string" && mode.trim().toLowerCase() === "sso" ? "sso" : "local";
}

export function isSsoMode(): boolean {
    return getAuthMode() === "sso";
}

//BFF-ის მისამართები აპის ჰოსტზე (BackendCarcassShared-ის BffRoutes)
export const bffLoginPath = "/bff/login";
export const bffLogoutPath = "/bff/logout";
export const bffUserPath = "/bff/user";

//cookie-ით ავტორიზებულ ყოველ /api/* და /bff/* მოთხოვნას ეს header სჭირდება: ის CORS-ის preflight-ს აიძულებს,
//ასე რომ სხვა საიტი მოთხოვნას ვერ გამოგზავნის
export const csrfHeaderName = "X-CSRF";
export const csrfHeaderValue = "1";

//sso.ltg.ge-ის გვერდები, რომლებზეც აპის შესვლისა და ანგარიშის მარშრუტები გადადის
export const ssoAccountPages = {
    registration: "account/register",
    confirmEmail: "account/confirm-email",
    changeRequiredPassword: "account/change-required-password",
    forgotPassword: "account/forgot-password",
    resetPassword: "account/reset-password",
    profile: "account/profile",
} as const;

//მხოლოდ ამავე საიტის გზა: "/x", მაგრამ არა "//host", "/\host" ან სრული მისამართი (open redirect-ის წინააღმდეგ).
//სხვა შემთხვევაში მთავარი გვერდი
export function localPathOrRoot(path: string | null | undefined): string {
    if (!path || path[0] !== "/") return "/";
    if (path.length > 1 && (path[1] === "/" || path[1] === "\\")) return "/";
    for (let i = 0; i < path.length; i++) {
        const code = path.charCodeAt(i);
        if (code < 0x20 || code === 0x7f) return "/";
    }
    return path;
}

//შესვლა sso.ltg.ge-ით: ჰოსტი ბრაუზერს sso-ზე აგზავნის და შესვლის შემდეგ returnUrl-ზე აბრუნებს
export function bffLoginUrl(returnUrl?: string | null): string {
    return `${bffLoginPath}?returnUrl=${encodeURIComponent(localPathOrRoot(returnUrl))}`;
}

//BFF-ის endpoint-ის სრული მისამართი: SPA და ჰოსტი ერთ origin-ზეა (dev-ში Vite-ის proxy-ით)
export function bffUrl(path: string): string {
    return new URL(path, window.location.origin).href;
}

//მიმდინარე გვერდის გზა query-ით, რომ შესვლის შემდეგ მომხმარებელი იქვე დაბრუნდეს
export function currentPath(): string {
    return window.location.pathname + window.location.search;
}

//sso.ltg.ge-ის გვერდის სრული მისამართი VITE_SSO_URL-იდან (მაგ. http://localhost:5090/, https://sso.ltg.ge/).
//თუ VITE_SSO_URL მითითებული არ არის, ან არავალიდურია, null
export function ssoPageUrl(page: string): string | null {
    const base: unknown = import.meta.env.VITE_SSO_URL;
    if (typeof base !== "string" || base.trim() === "") return null;
    try {
        const root = base.trim().endsWith("/") ? base.trim() : `${base.trim()}/`;
        return new URL(page, root).href;
    } catch {
        return null;
    }
}

//ბრაუზერის გადამისამართება (ცალკე ობიექტია, რომ ტესტებმა შეცვალონ). replace: გადამისამართება ისტორიაში
//ჩანაწერს არ ტოვებს, ასე რომ „უკან“ ღილაკი მომხმარებელს ისევ გადამისამართებაზე არ დააბრუნებს
export const browserNavigation = {
    replace(url: string): void {
        window.location.replace(url);
    },
};

//სესია არ არის (401): ბრაუზერი ჰოსტის /bff/login-ზე გადადის და შესვლის შემდეგ ამავე გვერდზე ბრუნდება
export function redirectToBffLogin(returnUrl: string = currentPath()): void {
    browserNavigation.replace(bffLoginUrl(returnUrl));
}
