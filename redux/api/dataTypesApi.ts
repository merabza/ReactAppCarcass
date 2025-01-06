//datatypesApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { jwtBaseQuery } from "./jwtBaseQuery";
import { setAlertApiLoadError } from "../slices/alertSlice";
import {
    setDataTypes,
    setGrid,
    setMultipleGrids,
} from "../slices/dataTypesSlice";
import { DataTypeFfModel } from "../types/dataTypesTypes";
import { ISetGridAction, ISetMultipleGrids } from "../types/rightsTypes";
import { setWorkingOnLoad } from "../slices/masterdataSlice";
import { buildErrorMessage } from "../types/errorTypes";

export const dataTypesApi = createApi({
    reducerPath: "dataTypesApi",
    baseQuery: jwtBaseQuery,
    endpoints: (builder) => ({
        //////////////////////////////////////////////////////
        getDataTypes: builder.query<DataTypeFfModel[], void>({
            query() {
                return {
                    url: `/datatypes/getdatatypes`,
                };
            },
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const queryResult = await queryFulfilled;
                    const { data } = queryResult;
                    dispatch(setDataTypes(data));
                } catch (error) {
                    dispatch(setAlertApiLoadError(buildErrorMessage(error)));
                }
            },
        }),
        //////////////////////////////////////////////////////
        getGridModel: builder.query<string, string>({
            query(gridName) {
                return {
                    url: `/datatypes/getgridmodel/${gridName}`,
                };
            },
            async onQueryStarted(gridName, { dispatch, queryFulfilled }) {
                try {
                    dispatch(setWorkingOnLoad(true));
                    const queryResult = await queryFulfilled;
                    const { data } = queryResult;
                    // console.log("dataTypesApi getGridModel data", data);
                    // console.log("dataTypesApi getGridModel gridName", gridName);
                    dispatch(
                        setGrid({ gridName, gridData: data } as ISetGridAction)
                    );
                } catch (error) {
                    dispatch(setAlertApiLoadError(buildErrorMessage(error)));
                }
            },
        }),
        //////////////////////////////////////////////////////
        getMultipleGridRules: builder.query<
            { [key: string]: string },
            string[]
        >({
            query(realyNeedGrids) {
                return {
                    url:
                        `/datatypes/getmultiplegridrules/?` +
                        realyNeedGrids
                            .map((gridName) => `grids=${gridName}`)
                            .join("&"),
                };
            },
            async onQueryStarted(realyNeedGrids, { dispatch, queryFulfilled }) {
                try {
                    dispatch(setWorkingOnLoad(true));
                    const queryResult = await queryFulfilled;
                    const { data } = queryResult;
                    // console.log("dataTypesApi getMultipleGridRules data", data);
                    dispatch(
                        setMultipleGrids({
                            realyNeedGrids,
                            gridsData: data,
                        } as ISetMultipleGrids)
                    );
                } catch (error) {
                    dispatch(setAlertApiLoadError(buildErrorMessage(error)));
                }
            },
        }),
        //////////////////////////////////////////////////////
    }),
});

export const {
    useLazyGetDataTypesQuery,
    useLazyGetGridModelQuery,
    useLazyGetMultipleGridRulesQuery,
} = dataTypesApi;
