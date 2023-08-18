//Layout.tsx

import NavMenu from "../menu/NavMenu";
import TopNavMenu from "../../TopNavMenu";
import { useAppSelector } from "../redux/hooks";

import "@fortawesome/fontawesome-free/css/solid.css";
import "@fortawesome/fontawesome-free/css/fontawesome.css";
import "bootstrap/dist/css/bootstrap.css";
import "./Layout.css";
import { Outlet } from "react-router-dom";
import { FC } from "react";

const Layout: FC = () => {
  const active = useAppSelector((state) => state.navMenuState.active);

  return (
    <div className="wrapper">
      <NavMenu />
      <div id="content" className={active ? "active" : undefined}>
        <TopNavMenu />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
