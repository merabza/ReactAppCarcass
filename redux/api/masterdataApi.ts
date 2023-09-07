//masterdataApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { jwtBaseQuery } from "./jwtBaseQuery";
import {
  setAlertApiLoadError,
  setAlertApiMutationError,
} from "../slices/alertSlice";
import {
  IAdddMasterDataParameters,
  IdeleteMasterDataRecordParameters,
  IMasterDataMutationParameters,
  IMdTablesDataCommandResponse,
  ISetAddedMasterDataRecordAction,
  ISetDeleteMasterDataRecordAction,
  ISetMultipleTablesData,
  ISetUpdatedMasterDataRecordAction,
} from "../types/masterdataTypes";
import {
  setAddedMasterDataRecord,
  setDeleteMasterDataRecord,
  SetDeletingKey,
  setMultipleTableData,
  setUpdatedMasterDataRecord,
  SetWorkingOnLoad,
  SetWorkingOnSave,
} from "../slices/masterdataSlice";
import { RootState } from "../../../redux/store";
import { buildErrorMessage } from "../types/errorTypes";
import { redirect } from "react-router-dom";

export const masterdataApi = createApi({
  reducerPath: "masterdataApi",
  baseQuery: jwtBaseQuery,
  endpoints: (builder) => ({
    //////////////////////////////////////////////////////
    getTables: builder.query<IMdTablesDataCommandResponse, Array<string>>({
      query(realyNeedTables) {
        return {
          url:
            `/masterdata/gettables?` +
            realyNeedTables.map((tablename) => `tables=${tablename}`).join("&"),
        };
      },
      async onQueryStarted(realyNeedTables, { dispatch, queryFulfilled }) {
        try {
          dispatch(SetWorkingOnLoad(true));
          const queryResult = await queryFulfilled;
          const { data } = queryResult;
          // console.log(
          //   "masterdataApi getTables realyNeedTables=",
          //   realyNeedTables
          // );
          // console.log("masterdataApi getTables queryResult=", queryResult);
          dispatch(
            setMultipleTableData({
              realyNeedTables,
              tablesData: data.entities,
            } as ISetMultipleTablesData)
          );
        } catch (error) {
          dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
      },
    }),
    //////////////////////////////////////////////////////
    addMasterDataRecord: builder.mutation<any, IAdddMasterDataParameters>({
      query({ tableName, mdItem }) {
        return {
          url: `/masterdata/${tableName}`,
          method: "POST",
          body: mdItem,
        };
      },
      async onQueryStarted(
        { tableName, idFielName },
        { dispatch, getState, queryFulfilled }
      ) {
        try {
          dispatch(SetWorkingOnSave(true));
          const queryResult = await queryFulfilled;
          const { data } = queryResult;
          dispatch(
            setAddedMasterDataRecord({
              tableName,
              mdItem: data,
            } as ISetAddedMasterDataRecordAction)
          );

          const idValue = data[idFielName];
          const returnPageName = (getState() as RootState).masterDataState
            .returnPageName;
          const realReturnPageName = returnPageName ? returnPageName : "mdList";
          redirect(`/${realReturnPageName}/${tableName}/${idValue}`);
        } catch (error) {
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
        dispatch(SetWorkingOnSave(false));
      },
    }),
    //////////////////////////////////////////////////////
    updateMasterDataRecord: builder.mutation<
      void,
      IMasterDataMutationParameters
    >({
      query({ tableName, id }) {
        return {
          url: `/masterdata/${tableName}/${id}`,
          method: "PUT",
        };
      },
      async onQueryStarted(
        { tableName, idFielName, id, mdItem },
        { dispatch, getState, queryFulfilled }
      ) {
        try {
          dispatch(SetWorkingOnSave(true));
          await queryFulfilled;
          dispatch(
            setUpdatedMasterDataRecord({
              tableName,
              idFielName,
              id,
              mdItem,
            } as ISetUpdatedMasterDataRecordAction)
          );
          const returnPageName = (getState() as RootState).masterDataState
            .returnPageName;
          const realReturnPageName = returnPageName ? returnPageName : "mdList";
          redirect(`/${realReturnPageName}/${tableName}/${id}`);
        } catch (error) {
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
        dispatch(SetWorkingOnSave(false));
      },
    }),
    //////////////////////////////////////////////////////
    deleteMasterDataRecord: builder.mutation<
      void,
      IdeleteMasterDataRecordParameters
    >({
      query({ tableName, id }) {
        return {
          url: `/masterdata/${tableName}/${id}`,
          method: "DELETE",
        };
      },
      async onQueryStarted(
        { tableName, idFielName, id },
        { dispatch, queryFulfilled }
      ) {
        try {
          dispatch(SetDeleteFailure(false));
          dispatch(SetDeletingKey(tableName + id.toString()));
          await queryFulfilled;
          dispatch(
            setDeleteMasterDataRecord({
              tableName,
              idFielName,
              id,
            } as ISetDeleteMasterDataRecordAction)
          );
          dispatch(SetDeleteFailure(false));
        } catch (error) {
          dispatch(SetDeleteFailure(true));
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
        dispatch(SetDeletingKey(null));
      },
    }),
    //////////////////////////////////////////////////////
  }),
});

export const {
  useLazyGetTablesQuery,
  useAddMasterDataRecordMutation,
  useUpdateMasterDataRecordMutation,
  useDeleteMasterDataRecordMutation,
} = masterdataApi;
function SetDeleteFailure(arg0: boolean): any {
  throw new Error("Function not implemented.");
}