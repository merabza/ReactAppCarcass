//NavMenu.tsx

import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";

import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useGetMainMenuQuery } from "../redux/api/userRightsApi";
import { toggleexp } from "../redux/slices/navMenuSlice";
import { IMenuGroupModel } from "../redux/types/userRightsTypes";
import { FC } from "react";

//იდეა წამოღებულია https://bootstrapious.com/p/bootstrap-sidebar

const NavMenu: FC = () => {
  // console.log("NavMenu Starts");
  const appName = useAppSelector((state) => state.appParametersState.appName);
  const navMenuState = useAppSelector((state) => state.navMenuState);
  const user = useAppSelector((state) => state.userState.user);
  const dispatch = useAppDispatch();

  const active = useAppSelector((state) => state.navMenuState.active);
  // console.log("NavMenu active=", active);

  useGetMainMenuQuery();

  return (
    <nav id="sidebar" className={active ? "active" : undefined}>
      <div className="sidebar-header">
        <h5>
          <Link to={"/"}>{appName}</Link>
        </h5>
      </div>
      <ul className="list-unstyled components">
        <li>
          <Link to="/profile">
            <FontAwesomeIcon icon="user" />{" "}
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </Link>
        </li>
        <li>
          <Link to="/">
            <FontAwesomeIcon icon="home" /> საწყისი გვერდი
          </Link>
        </li>

        {navMenuState.mainMenu &&
          navMenuState.mainMenu.menuGroups.length > 0 &&
          navMenuState.mainMenu.menuGroups.map((item, index) => {
            if (item.menu && item.menu.length > 0) {
              if (item.hidden) {
                return GetMenuList(item);
              } else {
                return (
                  <li key={item.mengKey}>
                    <Link
                      to="#"
                      data-toggle="collapse"
                      aria-expanded={item.expanded ? "true" : "false"}
                      className={
                        "dropdown-toggle" + (item.expanded ? "" : " collapsed")
                      }
                      onClick={() => dispatch(toggleexp(index))}
                    >
                      {item.mengName}
                    </Link>
                    <ul
                      className={
                        "list-unstyled collapse" +
                        (item.expanded ? " show" : "")
                      }
                      id={item.mengKey}
                    >
                      {GetMenuList(item)}
                    </ul>
                  </li>
                );
              }
            }
            return <div />;
          })}

        <li>
          <Link to="/login">
            <FontAwesomeIcon icon="sign-out-alt" /> გასასვლელი
          </Link>
        </li>
      </ul>
    </nav>
  );
};

function GetMenuList(item: IMenuGroupModel) {
  return item.menu.map((menuItem) => (
    <li key={menuItem.menKey}>
      <Link
        to={`/${menuItem.menLinkKey}${
          menuItem.menValue ? `/${menuItem.menValue}` : ""
        }`}
      >
        {!!menuItem.menIconName && (
          <FontAwesomeIcon icon={menuItem.menIconName as IconName} />
        )}{" "}
        {menuItem.menName}
      </Link>
    </li>
  ));
}

export default NavMenu;
