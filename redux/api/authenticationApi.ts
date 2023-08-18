//authenticationApi.ts

import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { RootState } from "../../../redux/store";
import { setAlertApiMutationError } from "../slices/alertSlice";
import { setIsCurrentUserValid, setUser } from "../slices/userSlice";
import { IAppUser } from "../types/authenticationTypes";
import { buildErrorMessage } from "../types/errorTypes";

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IRegistrationRequest {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  userName: string | null;
  password: string | null;
  confirmPassword: string | null;
}

const rawBaseQuery = (baseUrl: string) =>
  fetchBaseQuery({
    baseUrl,
  });

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseUrl = (api.getState() as RootState).appParametersState.baseUrl;
  // gracefully handle scenarios where data to generate the URL is missing
  if (!baseUrl) {
    return {
      error: {
        status: 400,
        statusText: "Bad Request",
        data: "No baseUrl specified",
      },
    };
  }
  return rawBaseQuery(baseUrl)(args, api, extraOptions);
};

export const authenticationApi = createApi({
  baseQuery: dynamicBaseQuery,

  endpoints: (builder) => ({
    //////////////////////////////////////////////////////
    login: builder.mutation<IAppUser, ILoginRequest>({
      query(loginRequest) {
        return {
          url: "/authentication/login",
          method: "POST",
          body: loginRequest,
        };
      },

      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        // console.log("authenticationApi login onQueryStarted started")
        try {
          const { data } = await queryFulfilled;
          // console.log("authenticationApi login onQueryStarted data=", data);
          dispatch(setUser(data));
          dispatch(setIsCurrentUserValid(true));
        } catch (error) {
          // console.log("authenticationApi login catched error");
          dispatch(setIsCurrentUserValid(true));
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    registration: builder.mutation<IAppUser, IRegistrationRequest>({
      query(loginRequest) {
        return {
          url: "/authentication/registration",
          method: "POST",
          body: loginRequest,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setUser(data));
          dispatch(setIsCurrentUserValid(true));
        } catch (error) {
          dispatch(setIsCurrentUserValid(true));
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegistrationMutation } = authenticationApi;
