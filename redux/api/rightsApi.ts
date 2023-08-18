//rightsApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import {
  clearChanges,
  setChecks,
  setChildren,
  setParents,
} from "../slices/rightsSlice";
import { jwtBaseQuery } from "./jwtBaseQuery";
import {
  setAlertApiLoadError,
  setAlertApiMutationError,
} from "../slices/alertSlice";
import {
  DataTypeModel,
  ISetChecksAction,
  ISetChildrenTreeAction,
  ISetParentsTreeAction,
  RightsChangeModel,
  RightsViewKind,
  TypeDataModel,
} from "../types/rightsTypes";
import { buildErrorMessage } from "../types/errorTypes";

export interface IChildrenTreeDataParameters {
  dtKey: string;
  rViewId: RightsViewKind;
}

export interface IHalfChecksParameters {
  dtKey: string;
  parentTypeId: number;
  key: string;
  rViewId: RightsViewKind;
}

export const rightsApi = createApi({
  reducerPath: "rightsApi",
  baseQuery: jwtBaseQuery,
  endpoints: (builder) => ({
    //////////////////////////////////////////////////////
    getParentsTreeData: builder.query<DataTypeModel[], RightsViewKind>({
      query(rViewId) {
        return {
          url: `/rights/getparentstreedata/${rViewId}`,
        };
      },
      async onQueryStarted(rViewId, { dispatch, queryFulfilled }) {
        try {
          const queryResult = await queryFulfilled;
          // console.log(
          //   "userRightsApi getParentsTreeData queryResult=",
          //   queryResult
          // );
          const { data } = queryResult;
          // console.log("rightsApi getParentsTreeData data=", data);
          dispatch(setParents({ rViewId, data } as ISetParentsTreeAction));
        } catch (error) {
          dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    getChildrenTreeData: builder.query<
      DataTypeModel[],
      IChildrenTreeDataParameters
    >({
      query({ dtKey, rViewId }) {
        return {
          url: `/rights/getchildrentreedata/${dtKey}/${rViewId}`,
        };
      },
      async onQueryStarted({ dtKey, rViewId }, { dispatch, queryFulfilled }) {
        try {
          const queryResult = await queryFulfilled;
          // console.log(
          //   "userRightsApi getChildrenTreeData queryResult=",
          //   queryResult
          // );
          const { data } = queryResult;
          dispatch(
            setChildren({ dtKey, rViewId, data } as ISetChildrenTreeAction)
          );
        } catch (error) {
          dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    getHalfChecks: builder.query<TypeDataModel[], IHalfChecksParameters>({
      query({ parentTypeId, key, rViewId }) {
        return {
          url: `/rights/halfchecks/${parentTypeId}/${key}/${rViewId}`,
        };
      },
      async onQueryStarted(
        { dtKey, key, rViewId },
        { dispatch, queryFulfilled }
      ) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setChecks({ rViewId, dtKey, key, data } as ISetChecksAction)
          );
        } catch (error) {
          dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    saveData: builder.mutation<boolean, RightsChangeModel[]>({
      query(saveDataRequest) {
        return {
          url: "/rights/savedata",
          method: "POST",
          body: saveDataRequest,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearChanges());
        } catch (error) {
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    optimize: builder.mutation<boolean, void>({
      query() {
        return {
          url: "/rights/optimize",
          method: "POST",
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearChanges());
        } catch (error) {
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
      },
    }),
  }),
});

export const {
  useLazyGetParentsTreeDataQuery,
  useLazyGetChildrenTreeDataQuery,
  useLazyGetHalfChecksQuery,
  useSaveDataMutation,
  useOptimizeMutation,
} = rightsApi;
