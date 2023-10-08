//PrivateApp.tsx

import { FC, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useLazyIsCurrentUserValidQuery } from "../redux/api/userRightsApi";
import { useAppSelector } from "../redux/hooks";
import WaitPage from "./WaitPage";

const PrivateApp: FC = () => {
  // console.log("PrivateApp Start");

  const { userValidationChecked, user, CheckingUser } = useAppSelector(
    (state) => state.userState
  );
  // console.log("PrivateApp Start { userValidationChecked, user } = ", { userValidationChecked, user });

  const navigate = useNavigate();
  const publicPathces = ["/login", "/registration"];

  const [IsCurrentUserValid] = useLazyIsCurrentUserValidQuery();

  const location = useLocation();

  useEffect(() => {
    // console.log(
    //   "PrivateApp useEffect {CheckingUser, userValidationChecked, user}=",
    //   { CheckingUser, userValidationChecked, user }
    // );

    if (CheckingUser) return;

    if (!userValidationChecked && user) {
      IsCurrentUserValid();
      return;
    }

    if (!user) {
      // console.log(
      //   "PrivateApp useEffect window.location.pathname=",
      //   window.location.pathname
      // );
      if (window.location.pathname !== "/login") {
        // console.log(
        //   "PrivateApp useEffect navigate login",
        //   window.location.pathname
        // );
        navigate("/login", {
          state: { from: window.location.pathname },
        });
      }
    }
  }, [CheckingUser, userValidationChecked, user]);

  if (publicPathces.includes(location.pathname)) {
    // console.log("PrivateApp location=", location);
    // console.log("PrivateApp location.pathname=", location.pathname);
    // console.log("PrivateApp return div");
    return <div />;
  }

  if (!userValidationChecked && user) {
    // console.log("PrivateApp return WaitPage");
    return <WaitPage />;
  }

  if (userValidationChecked && user) {
    // console.log("PrivateApp return children");
    return (
      <div>
        <Outlet />
      </div>
    );
  }

  return <div></div>;
};

export default PrivateApp;
