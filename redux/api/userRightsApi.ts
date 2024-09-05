//userRightsApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";

import { jwtBaseQuery } from "./jwtBaseQuery";
import { setMenuLoading, setNavMenu } from "../slices/navMenuSlice";
import {
  setChangingPassword,
  setCheckingUser,
  setIsCurrentUserValid,
  setPasswordChanged,
  setUser,
} from "../slices/userSlice";
import {
  setAlertApiLoadError,
  setAlertApiMutationError,
} from "../slices/alertSlice";
import { RootState } from "../../../redux/store";
import { IAppUser } from "../types/authenticationTypes";
import {
  IdeleteCurrentUserParameters,
  IMainMenuModel,
} from "../types/userRightsTypes";
import { buildErrorMessage } from "../types/errorTypes";
//import { redirect } from "react-router-dom";

export interface IChangeProfileModel {
  userid: number;
  userName: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface IChangePasswordModel {
  userid: number;
  userName: string;
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export const userRightsApi = createApi({
  reducerPath: "userRightsApi",
  baseQuery: jwtBaseQuery,
  endpoints: (builder) => ({
    //////////////////////////////////////////////////////
    getMainMenu: builder.query<IMainMenuModel, void>({
      query() {
        return {
          url: "userrights/getmainmenu",
        };
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          dispatch(setMenuLoading(true));
          const { data } = await queryFulfilled;
          dispatch(setNavMenu(data));
        } catch (error) {
          dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
        dispatch(setMenuLoading(false));
      },
    }),
    //////////////////////////////////////////////////////
    isCurrentUserValid: builder.query<void, void>({
      query() {
        return {
          url: "userrights/iscurrentuservalid",
        };
      },
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          // console.log(
          //   "userRightsApi isCurrentUserValid onQueryStarted start setCheckingUser=true setIsCurrentUserValid=false"
          // );
          dispatch(setCheckingUser(true));
          // dispatch(setIsCurrentUserValid(false));
          // console.log("userRightsApi isCurrentUserValid onQueryStarted await queryFulfilled");
          await queryFulfilled;
          // console.log(
          //   "userRightsApi isCurrentUserValid onQueryStarted finish setIsCurrentUserValid=true setCheckingUser=false"
          // );
          dispatch(setIsCurrentUserValid(true));
        } catch (error) {
          // console.log(
          //   "userRightsApi isCurrentUserValid onQueryStarted catched error setIsCurrentUserValid=false setCheckingUser=false error=",
          //   error
          // );
          dispatch(setIsCurrentUserValid(false));
          //აქ შეცდომის დაფიქირება არ არის საჭირო
          // dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    changeProfile: builder.mutation<void, IChangeProfileModel>({
      query(changeProfileRequest) {
        return {
          url: "/userrights/changeprofile",
          method: "PUT",
          body: changeProfileRequest,
        };
      },
      async onQueryStarted(
        changeProfileRequest,
        { dispatch, getState, queryFulfilled }
      ) {
        // console.log("authenticationApi login onQueryStarted started")
        try {
          await queryFulfilled;
          const user = (getState() as RootState).userState.user;
          if (user) {
            const newUser = { ...user, ...changeProfileRequest } as IAppUser;
            // console.log("authenticationApi changeProfile onQueryStarted user=", newUser);
            dispatch(setUser(newUser));
          }
        } catch (error) {
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    changePassword: builder.mutation<void, IChangePasswordModel>({
      query(changePasswordRequest) {
        return {
          url: "/userrights/changePassword",
          method: "PUT",
          body: changePasswordRequest,
        };
      },
      async onQueryStarted(
        _changePasswordRequest,
        { dispatch, queryFulfilled }
      ) {
        // console.log("authenticationApi login onQueryStarted started")
        try {
          dispatch(setChangingPassword(true));
          dispatch(setPasswordChanged(false));
          await queryFulfilled;
          dispatch(setChangingPassword(false));
          dispatch(setPasswordChanged(true));
        } catch (error) {
          dispatch(setChangingPassword(false));
          dispatch(setPasswordChanged(false));
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    deleteCurrentUser: builder.mutation<void, IdeleteCurrentUserParameters>({
      query({ userName }) {
        return {
          url: `/userrights/deletecurrentuser/${userName}`,
          method: "DELETE",
        };
      },
      async onQueryStarted({ navigate }, { dispatch, queryFulfilled }) {
        // console.log("authenticationApi login onQueryStarted started")
        try {
          await queryFulfilled;
          navigate("/login");
        } catch (error) {
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
  }),
});

export const {
  useGetMainMenuQuery,
  useLazyIsCurrentUserValidQuery,
  useChangeProfileMutation,
  useChangePasswordMutation,
  useDeleteCurrentUserMutation,
} = userRightsApi;
