//jwtBaseQuery.ts

import type {
    BaseQueryApi,
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../redux/store";
import { logout, setUser } from "../slices/userSlice";
import type { IAppUser } from "../types/authenticationTypes";
import { csrfHeaderName, csrfHeaderValue, isSsoMode, redirectToBffLogin } from "../../common/authMode";

const rawBaseQuery = (baseUrl: string, token: string) =>
    fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            headers.set("authorization", `Bearer ${token}`);
            return headers;
        },
    });

//Sso რეჟიმი (D17): ტოკენი ბრაუზერში არ არის. მოთხოვნას ამავე origin-ის HttpOnly cookie და CSRF-ის header ახლავს
const ssoBaseQuery = (baseUrl: string) =>
    fetchBaseQuery({
        baseUrl,
        credentials: "same-origin",
        prepareHeaders: (headers) => {
            headers.set(csrfHeaderName, csrfHeaderValue);
            return headers;
        },
    });

//ერთდროულად მხოლოდ ერთი განახლება მიდის: პარალელურად ჩავარდნილი მოთხოვნები ერთსა და იმავე შედეგს ელოდებიან
let refreshPromise: Promise<boolean> | null = null;

//წვდომის ტოკენის ვადა გავიდა: განახლების ტოკენით ახალი ტოკენების მიღება.
//წარმატებისას ახალი მომხმარებლის ობიექტი ინახება და true ბრუნდება
function refreshTokens(api: BaseQueryApi, baseUrl: string): Promise<boolean> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const user = (api.getState() as RootState).userState.user;
            if (!user || !user.refreshToken) return false;
            const result = await fetchBaseQuery({ baseUrl })(
                {
                    url: "/authentication/refresh",
                    method: "POST",
                    body: { refreshToken: user.refreshToken },
                },
                api,
                {}
            );
            if (result.error || !result.data) return false;
            api.dispatch(setUser(result.data as IAppUser));
            return true;
        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

export const jwtBaseQuery: BaseQueryFn<
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

    //Sso რეჟიმში 401 ნიშნავს, რომ აპის სესია აღარ არის: ბრაუზერი შესვლაზე გადადის და შემდეგ ამავე გვერდზე ბრუნდება.
    //წვდომის ტოკენს ჰოსტი თვითონ ანახლებს, ამიტომ აქ განახლება არ არის
    if (isSsoMode()) {
        const ssoResult = await ssoBaseQuery(baseUrl)(args, api, extraOptions);
        if (ssoResult.error && ssoResult.error.status === 401) redirectToBffLogin();
        return ssoResult;
    }

    // By default, if we have a token in the store, let's use that for authenticated requests
    const user = (api.getState() as RootState).userState.user;

    if (!user || !user.token) {
        return {
            error: {
                status: 401,
                statusText: "Bad Request",
                data: "unautorized",
            },
        };
    }

    let result = await rawBaseQuery(baseUrl, user.token)(args, api, extraOptions);

    //401 ნიშნავს, რომ წვდომის ტოკენი ვადაგასულია (ან გაუქმებული): ვცდილობთ განახლებას და მოთხოვნას ვიმეორებთ.
    //თუ განახლება ვერ მოხერხდა, მომხმარებელი სისტემიდან გადის და ავტორიზაციის გვერდზე ხვდება
    if (result.error && result.error.status === 401) {
        const refreshed = await refreshTokens(api, baseUrl);
        const newToken = (api.getState() as RootState).userState.user?.token;
        if (refreshed && newToken) {
            result = await rawBaseQuery(baseUrl, newToken)(args, api, extraOptions);
        } else {
            api.dispatch(logout());
        }
    }

    return result;
};
