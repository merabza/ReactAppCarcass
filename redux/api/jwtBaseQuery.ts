//jwtBaseQuery.ts

import type {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../../../redux/store";

const rawBaseQuery = (baseUrl: string, token: string) =>
    fetchBaseQuery({
        baseUrl,
        prepareHeaders: (headers) => {
            headers.set("authorization", `Bearer ${token}`);
            return headers;
        },
    });

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

    return rawBaseQuery(baseUrl, user.token)(args, api, extraOptions);
};
