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
  IGetOneMdRecordParameters,
  IMasterDataMutationParameters,
  IMdLookupTablesDataCommandResponse,
  IMdTablesDataCommandResponse,
  ITableNameAndMasterDataRecord,
  ISetDeleteMasterDataRecordAction,
  ISetMdWorkingOnLoadingTablesListAction,
  ISetMultipleLookupTablesData,
  ISetMultipleTablesData,
  ISetUpdatedMasterDataRecordAction,
} from "../types/masterdataTypes";
import {
  setAddedMasterDataRecord,
  SetDeleteFailure,
  setDeleteMasterDataRecord,
  SetDeletingKey,
  SetMdWorkingOnLoadingLookupTablesList,
  SetMdWorkingOnLoadingTablesList,
  setMultipleTableData,
  setMultipleLookupTableData,
  setTableRowData,
  setUpdatedMasterDataRecord,
  SetWorkingOnLoad,
  SetWorkingOnSave,
  setMasterDataRecord,
} from "../slices/masterdataSlice";
import { RootState } from "../../../redux/store";
import { buildErrorMessage } from "../types/errorTypes";
import { IFilterSortRequest, IRowsData } from "../../grid/GridViewTypes";

export interface IGetTableRowsDataParameters {
  tableName: string;
  filterSortRequest: IFilterSortRequest;
}

export const masterdataApi = createApi({
  reducerPath: "masterdataApi",
  baseQuery: jwtBaseQuery,
  endpoints: (builder) => ({
    //////////////////////////////////////////////////////
    getTableRowsData: builder.query<IRowsData, IGetTableRowsDataParameters>({
      query(args) {
        const { tableName, filterSortRequest } = args;
        return {
          url: `/masterdata/gettablerowsdata/${tableName}?filterSortRequest=${btoa(
            encodeURIComponent(JSON.stringify(filterSortRequest))
          )}`,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { tableName } = args;
          const { data } = await queryFulfilled;
          console.log("masterdataApi getTableRowsData data=", data);
          dispatch(setTableRowData({ tableName, data }));
        } catch (error) {
          dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
      },
    }),
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
        dispatch(SetWorkingOnLoad(true));
        dispatch(
          SetMdWorkingOnLoadingTablesList({
            tableNamesList: realyNeedTables,
            switchOn: true,
          } as ISetMdWorkingOnLoadingTablesListAction)
        );
        try {
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
        dispatch(
          SetMdWorkingOnLoadingTablesList({
            tableNamesList: realyNeedTables,
            switchOn: false,
          } as ISetMdWorkingOnLoadingTablesListAction)
        );
      },
    }),
    //////////////////////////////////////////////////////
    getLookupTables: builder.query<
      IMdLookupTablesDataCommandResponse,
      Array<string>
    >({
      query(realyNeedLookupTables) {
        return {
          url:
            `/masterdata/getlookuptables?` +
            realyNeedLookupTables
              .map((tablename) => `tables=${tablename}`)
              .join("&"),
        };
      },
      async onQueryStarted(
        realyNeedLookupTables,
        { dispatch, queryFulfilled }
      ) {
        dispatch(SetWorkingOnLoad(true));
        dispatch(
          SetMdWorkingOnLoadingLookupTablesList({
            tableNamesList: realyNeedLookupTables,
            switchOn: true,
          } as ISetMdWorkingOnLoadingTablesListAction)
        );
        try {
          const queryResult = await queryFulfilled;
          const { data } = queryResult;
          console.log(
            "masterdataApi getLookupTables realyNeedTables=",
            realyNeedLookupTables
          );
          console.log(
            "masterdataApi getLookupTables queryResult=",
            queryResult
          );
          dispatch(
            setMultipleLookupTableData({
              realyNeedLookupTables,
              tablesData: data.srv,
            } as ISetMultipleLookupTablesData)
          );
        } catch (error) {
          console.log("masterdataApi getLookupTables error=", error);
          dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
        dispatch(
          SetMdWorkingOnLoadingLookupTablesList({
            tableNamesList: realyNeedLookupTables,
            switchOn: false,
          } as ISetMdWorkingOnLoadingTablesListAction)
        );
      },
    }),
    //////////////////////////////////////////////////////
    getOneMdRecord: builder.query<any, IGetOneMdRecordParameters>({
      query({ tableName, id }) {
        return {
          url: `/masterdata/${tableName}/${id}`,
        };
      },
      async onQueryStarted({ tableName, id }, { dispatch, queryFulfilled }) {
        try {
          const queryResult = await queryFulfilled;
          const { data } = queryResult;
          dispatch(
            setMasterDataRecord({
              tableName,
              mdItem: data.entry,
            } as ITableNameAndMasterDataRecord)
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
        { tableName, idFielName, navigate },
        { dispatch, getState, queryFulfilled }
      ) {
        try {
          dispatch(SetWorkingOnSave(true));
          const queryResult = await queryFulfilled;
          const { data } = queryResult;
          //console.log("masterdataApi addMasterDataRecord data=", data);
          dispatch(
            setAddedMasterDataRecord({
              tableName,
              mdItem: data.entry,
            } as ITableNameAndMasterDataRecord)
          );
          // console.log(
          //   "masterdataApi addMasterDataRecord idFielName=",
          //   idFielName
          // );

          const idValue = data.entry[idFielName];
          const returnPageName = (getState() as RootState).masterDataState
            .returnPageName;
          const realReturnPageName = returnPageName ? returnPageName : "mdList";
          navigate(`/${realReturnPageName}/${tableName}/${idValue}`);
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
      query({ tableName, mdItem, id }) {
        return {
          url: `/masterdata/${tableName}/${id}`,
          method: "PUT",
          body: mdItem,
        };
      },
      async onQueryStarted(
        { tableName, idFielName, id, mdItem, navigate },
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
          navigate(`/${realReturnPageName}/${tableName}/${id}`);
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
        { tableName, idFielName, id, navigate },
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
          navigate(`/mdList/${tableName}`);
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
  useLazyGetLookupTablesQuery,
  useLazyGetTableRowsDataQuery,
  useLazyGetOneMdRecordQuery,
  useAddMasterDataRecordMutation,
  useUpdateMasterDataRecordMutation,
  useDeleteMasterDataRecordMutation,
} = masterdataApi;
