//pageTitle.test.tsx

import { configureStore } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import type { FC } from "react";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";

import appParametersReducer, { type IAppParametersState } from "../redux/slices/appParametersSlice";
import type { IMenuItmModel } from "../redux/types/userRightsTypes";
import { testBaseUrl } from "../../testUtils/testStore";
import { findPageName, makePageTitle, PageTitleContext, usePageTitle, usePageTitleOverride } from "./pageTitle";

function menuItem(menLinkKey: string, menName: string, menValue: string | null = null): IMenuItmModel {
    return {
        menId: 1,
        menKey: menName,
        menName,
        menValue,
        menGroupId: 1,
        sortId: 0,
        menLinkKey,
        menIconName: null,
        create: false,
        update: false,
        delete: false,
        confirm: false,
    };
}

const flatMenu = [
    menuItem("mdList", "ენები", "languages"),
    menuItem("mdList", "ერთეულები", "units"),
    menuItem("units", "ლექსემები"),
    menuItem("Rights", "უფლებების მართვა"),
];

describe("findPageName", () => {
    it("names the home page", () => {
        expect(findPageName("/", flatMenu)).toBe("საწყისი გვერდი");
    });

    it("takes the menu item's name by its link key, ignoring case", () => {
        expect(findPageName("/units", flatMenu)).toBe("ლექსემები");
        expect(findPageName("/Units/", flatMenu)).toBe("ლექსემები");
    });

    it("takes the masterdata list's name by its table, also for its edit page", () => {
        expect(findPageName("/mdList/units", flatMenu)).toBe("ერთეულები");
        expect(findPageName("/mdItemEdit/languages/5", flatMenu)).toBe("ენები");
        expect(findPageName("/mdList/unknownTable", flatMenu)).toBeNull();
    });

    it("prefers the menu to the app's and the carcass' titles", () => {
        expect(findPageName("/Rights/rView", flatMenu)).toBe("უფლებების მართვა");
        expect(findPageName("/units", flatMenu, { units: "სხვა" })).toBe("ლექსემები");
    });

    it("uses the app's titles and then the carcass' titles", () => {
        expect(findPageName("/unitEdit/7", flatMenu, { unitedit: "ლექსემის რედაქტირება" })).toBe(
            "ლექსემის რედაქტირება"
        );
        expect(findPageName("/profile", null)).toBe("პროფილი");
        expect(findPageName("/Rights", null)).toBe("უფლებები");
    });

    it("returns null for an unknown page", () => {
        expect(findPageName("/somethingElse", flatMenu)).toBeNull();
    });
});

describe("makePageTitle", () => {
    it("joins the page and the app", () => {
        expect(makePageTitle("ლექსემები", "შეცდომების ლექსიკონი")).toBe("ლექსემები · შეცდომების ლექსიკონი");
        expect(makePageTitle(null, "შეცდომების ლექსიკონი")).toBe("შეცდომების ლექსიკონი");
    });
});

const TitledPage: FC<{ pageName: string | null }> = ({ pageName }) => {
    usePageTitle(pageName);
    return null;
};

function renderTitledPage(appParameters: IAppParametersState, pageName: string | null) {
    const store = configureStore({
        reducer: { appParametersState: appParametersReducer },
        preloadedState: { appParametersState: appParameters },
    });
    render(
        <Provider store={store}>
            <TitledPage pageName={pageName} />
        </Provider>
    );
}

describe("usePageTitle", () => {
    it("uses the app's short name", () => {
        renderTitledPage({ appName: "გრძელი სახელი", appShortName: "მოკლე", baseUrl: testBaseUrl }, "შესვლა");
        expect(document.title).toBe("შესვლა · მოკლე");
    });

    it("falls back to the app name without a short name", () => {
        renderTitledPage({ appName: "გრძელი სახელი", baseUrl: testBaseUrl }, null);
        expect(document.title).toBe("გრძელი სახელი");
    });
});

const OverridingPage: FC = () => {
    usePageTitleOverride("გვერდი არ არსებობს");
    return null;
};

describe("usePageTitleOverride", () => {
    it("sets the page name and clears it when the page goes away", () => {
        const setPageTitle = vi.fn();
        const { unmount } = render(
            <PageTitleContext.Provider value={setPageTitle}>
                <OverridingPage />
            </PageTitleContext.Provider>
        );
        expect(setPageTitle).toHaveBeenLastCalledWith("გვერდი არ არსებობს");
        unmount();
        expect(setPageTitle).toHaveBeenLastCalledWith(null);
    });
});
