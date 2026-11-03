//authenticationApi.ts

import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";

import type { RootState } from "../../../redux/store";
import { setUser, setloggingIn, setPendingLogin } from "../slices/userSlice";
import { type IAppUser, toPendingLogin } from "../types/authenticationTypes";
import { buildErrorMessage } from "../types/errorTypes";
import { setAlertApiMutationError } from "../slices/alertSlice";

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

export interface IConfirmEmailRequest {
    pendingToken: string;
    code: string;
}

export interface IConfirmEmailLinkRequest {
    userId: number;
    token: string;
    pendingToken: string | null;
}

export interface IResendCodeRequest {
    pendingToken: string;
}

export interface IChangeRequiredPasswordRequest {
    pendingToken: string;
    code: string | null;
    newPassword: string;
    newPasswordConfirm: string;
}

export interface IRefreshTokenRequest {
    refreshToken: string;
}

export interface ILogoutRequest {
    refreshToken: string;
}

export interface IForgotPasswordRequest {
    userNameOrEmail: string;
}

export interface IResetPasswordRequest {
    userId: number | null;
    token: string | null;
    userNameOrEmail: string | null;
    code: string | null;
    newPassword: string;
    newPasswordConfirm: string;
}

const rawBaseQuery = (baseUrl: string) =>
    fetchBaseQuery({
        baseUrl,
    });

export const dynamicBaseQuery: BaseQueryFn<
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

//სერვერის პასუხი ავტორიზაციაზე, რეგისტრაციაზე და დადასტურების ნაბიჯებზე ერთნაირად მუშავდება:
//  nextStep === "None" -> სრული ავტორიზაცია, მომხმარებელი ინახება
//  nextStep === "EmailConfirmedLoginRequired" -> ელფოსტა სხვა ბრაუზერიდან დადასტურდა, ავტორიზაცია თავიდან
//  სხვა -> დროებითი ტოკენი ინახება და გვერდი მომდევნო ნაბიჯზე გადადის
export function applyLoginResponse(
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
    data: IAppUser
) {
    if (!data.nextStep || data.nextStep === "None") {
        dispatch(setUser(data));
        return;
    }
    if (data.nextStep === "EmailConfirmedLoginRequired") {
        dispatch(setPendingLogin(null));
        return;
    }
    dispatch(setPendingLogin(toPendingLogin(data)));
}

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

            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                // console.log("authenticationApi login onQueryStarted started");
                try {
                    dispatch(setloggingIn(true));
                    const { data } = await queryFulfilled;
                    // console.log("authenticationApi login onQueryStarted data=", data);
                    applyLoginResponse(dispatch, data);
                } catch (error) {
                    //console.log("authenticationApi login catched error=", error);
                    dispatch(setAlertApiMutationError(buildErrorMessage(error)));
                    dispatch(setUser(null));
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
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    dispatch(setloggingIn(true));
                    const { data } = await queryFulfilled;
                    applyLoginResponse(dispatch, data);
                } catch (error) {
                    dispatch(setAlertApiMutationError(buildErrorMessage(error)));
                    dispatch(setUser(null));
                }
            },
        }),
        //////////////////////////////////////////////////////
        confirmEmail: builder.mutation<IAppUser, IConfirmEmailRequest>({
            query(request) {
                return {
                    url: "/authentication/confirmemail",
                    method: "POST",
                    body: request,
                };
            },
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    applyLoginResponse(dispatch, data);
                } catch (error) {
                    dispatch(setAlertApiMutationError(buildErrorMessage(error)));
                }
            },
        }),
        //////////////////////////////////////////////////////
        confirmEmailLink: builder.mutation<IAppUser, IConfirmEmailLinkRequest>({
            query(request) {
                return {
                    url: "/authentication/confirmemaillink",
                    method: "POST",
                    body: request,
                };
            },
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    applyLoginResponse(dispatch, data);
                } catch (error) {
                    dispatch(setAlertApiMutationError(buildErrorMessage(error)));
                }
            },
        }),
        //////////////////////////////////////////////////////
        resendCode: builder.mutation<void, IResendCodeRequest>({
            query(request) {
                return {
                    url: "/authentication/resendcode",
                    method: "POST",
                    body: request,
                };
            },
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    dispatch(setAlertApiMutationError(buildErrorMessage(error)));
                }
            },
        }),
        //////////////////////////////////////////////////////
        changeRequiredPassword: builder.mutation<IAppUser, IChangeRequiredPasswordRequest>({
            query(request) {
                return {
                    url: "/authentication/changerequiredpassword",
                    method: "POST",
                    body: request,
                };
            },
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    applyLoginResponse(dispatch, data);
                } catch (error) {
                    dispatch(setAlertApiMutationError(buildErrorMessage(error)));
                }
            },
        }),
        //////////////////////////////////////////////////////
        logout: builder.mutation<void, ILogoutRequest>({
            query(request) {
                return {
                    url: "/authentication/logout",
                    method: "POST",
                    body: request,
                };
            },
        }),
        //////////////////////////////////////////////////////
        forgotPassword: builder.mutation<void, IForgotPasswordRequest>({
            query(request) {
                return {
                    url: "/authentication/forgotpassword",
                    method: "POST",
                    body: request,
                };
            },
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (error) {
                    dispatch(setAlertApiMutationError(buildErrorMessage(error)));
                }
            },
        }),
        //////////////////////////////////////////////////////
        resetPassword: builder.mutation<IAppUser, IResetPasswordRequest>({
            query(request) {
                return {
                    url: "/authentication/resetpassword",
                    method: "POST",
                    body: request,
                };
            },
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    applyLoginResponse(dispatch, data);
                } catch (error) {
                    dispatch(setAlertApiMutationError(buildErrorMessage(error)));
                }
            },
        }),
    }),
});

export const {
    useLoginMutation,
    useRegistrationMutation,
    useConfirmEmailMutation,
    useConfirmEmailLinkMutation,
    useResendCodeMutation,
    useChangeRequiredPasswordMutation,
    useLogoutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = authenticationApi;
