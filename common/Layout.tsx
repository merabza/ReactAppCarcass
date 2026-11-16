//Layout.tsx

import NavMenu from "../menu/NavMenu";
import TopNavMenu from "../../TopNavMenu";
import { useAppSelector } from "../redux/hooks";
import { findPageName, PageTitleContext, usePageTitle } from "./pageTitle";

// import "@fortawesome/fontawesome-free/css/solid.css";
// import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "bootstrap/dist/css/bootstrap.css";
import "./Layout.css";
import { Outlet, useLocation } from "react-router-dom";
import { type FC, useState } from "react";

interface LayoutProps {
    //აპის საკუთარი გვერდების სათაურები, რომლებიც მენიუში არ არის: მისამართის პირველი ნაწილი → სახელი
    pageTitles?: Record<string, string>;
}

const Layout: FC<LayoutProps> = ({ pageTitles }) => {
    const active = useAppSelector((state) => state.navMenuState.active);
    const flatMenu = useAppSelector((state) => state.navMenuState.flatMenu);
    const { pathname } = useLocation();
    const [pageTitleOverride, setPageTitleOverride] = useState<string | null>(null);

    usePageTitle(pageTitleOverride ?? findPageName(pathname, flatMenu, pageTitles));

    return (
        <div className="wrapper">
            <NavMenu />
            <div id="layout-content" className={active ? "active" : undefined}>
                <TopNavMenu />
                <div className="content-wrapper">
                    <PageTitleContext.Provider value={setPageTitleOverride}>
                        <Outlet />
                    </PageTitleContext.Provider>
                </div>
            </div>
        </div>
    );
};

export default Layout;
