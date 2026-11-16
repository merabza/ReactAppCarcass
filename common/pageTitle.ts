//pageTitle.ts

import { createContext, useContext, useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import type { IMenuItmModel } from "../redux/types/userRightsTypes";

//ჩარჩოს გვერდები, რომლებიც მენიუში შეიძლება არ იყოს
const carcassPageTitles: Record<string, string> = {
    profile: "პროფილი",
    rights: "უფლებები",
};

//ბრაუზერის ტაბის სათაური: „გვერდი · აპის მოკლე სახელი“
export function makePageTitle(pageName: string | null, appTitle: string): string {
    return pageName ? `${pageName} · ${appTitle}` : appTitle;
}

//გვერდის სახელი მისამართის მიხედვით: ჯერ მენიუს ელემენტის menName, შემდეგ აპის pageTitles, ბოლოს ჩარჩოს გვერდები.
//mdItemEdit/<ცხრილი> იმავე სახელს იღებს, რასაც mdList/<ცხრილი>
export function findPageName(
    pathname: string,
    flatMenu: IMenuItmModel[] | null,
    pageTitles?: Record<string, string>
): string | null {
    const [first = "", second] = pathname.split("/").filter((part) => part !== "");
    if (first === "") {
        return "საწყისი გვერდი";
    }
    const key = first.toLowerCase();
    const linkKey = key === "mditemedit" ? "mdlist" : key;
    const items = (flatMenu ?? []).filter((m) => m.menLinkKey.toLowerCase() === linkKey);
    const item =
        items.find((m) => m.menValue !== null && m.menValue === second) ??
        (linkKey === "mdlist" ? undefined : (items.find((m) => !m.menValue) ?? items[0]));
    if (item) {
        return item.menName;
    }
    const appTitle = Object.entries(pageTitles ?? {}).find(([k]) => k.toLowerCase() === key);
    return appTitle?.[1] ?? carcassPageTitles[key] ?? null;
}

//ტაბის სათაურს ცვლის; აპის სახელად appShortName-ს იყენებს, თუ ის არ არის — appName-ს
export function usePageTitle(pageName: string | null): void {
    const { appName, appShortName } = useAppSelector((state) => state.appParametersState);
    const title = makePageTitle(pageName, appShortName || appName);
    useEffect(() => {
        document.title = title;
    }, [title]);
}

//Layout-ის შიგნით გვერდს შეუძლია მენიუდან აღებული სახელი თავისით შეცვალოს (მაგ. 404)
export const PageTitleContext = createContext<(pageName: string | null) => void>(() => undefined);

export function usePageTitleOverride(pageName: string): void {
    const setPageTitle = useContext(PageTitleContext);
    useEffect(() => {
        setPageTitle(pageName);
        return () => setPageTitle(null);
    }, [setPageTitle, pageName]);
}
