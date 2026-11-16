//ltgApps.ts

import { useEffect, useState } from "react";
import { isSsoMode, ssoPageUrl } from "./authMode";

//LTG-ის აპი sso.ltg.ge-ის სიიდან (GET /apps, merabza/SsoLtgGe#22, sso-design.md D32)
export interface ILtgApp {
    name: string;
    url: string;
}

const appsPage = "apps";

//სია ერთხელ მოდის და გვერდის სიცოცხლის განმავლობაში ინახება (მენიუ და საწყისი გვერდი ერთ მოთხოვნას იყენებს)
let cachedApps: Promise<ILtgApp[]> | null = null;

//მხოლოდ ტესტებისთვის
export function resetLtgAppsCache(): void {
    cachedApps = null;
}

//სხვა LTG აპები: მხოლოდ Sso რეჟიმში და VITE_SSO_URL-ით, მიმდინარე აპის გარეშე. მოთხოვნა cookie-სა და X-CSRF-ის
//გარეშეა (სია საჯაროა); შეცდომისას სია ცარიელია
export function loadLtgApps(): Promise<ILtgApp[]> {
    const url = isSsoMode() ? ssoPageUrl(appsPage) : null;
    if (url === null) return Promise.resolve([]);
    cachedApps ??= fetch(url, { credentials: "omit" })
        .then(async (response) => (response.ok ? otherApps(await response.json()) : []))
        .catch(() => []);
    return cachedApps;
}

export function useLtgApps(): ILtgApp[] {
    const [apps, setApps] = useState<ILtgApp[]>([]);

    useEffect(() => {
        let active = true;
        loadLtgApps().then((loaded) => {
            if (active) setApps(loaded);
        });
        return () => {
            active = false;
        };
    }, []);

    return apps;
}

//მხოლოდ სწორი ჩანაწერები http(s) მისამართით; მიმდინარე აპი (იგივე origin) სიაში არ ჩანს
function otherApps(data: unknown): ILtgApp[] {
    if (!Array.isArray(data)) return [];
    return data.filter((item: unknown): item is ILtgApp => {
        if (typeof item !== "object" || item === null) return false;
        const { name, url } = item as { name?: unknown; url?: unknown };
        if (typeof name !== "string" || name === "" || typeof url !== "string") return false;
        try {
            const parsed = new URL(url);
            return (
                (parsed.protocol === "https:" || parsed.protocol === "http:") &&
                parsed.origin !== window.location.origin
            );
        } catch {
            return false;
        }
    });
}
