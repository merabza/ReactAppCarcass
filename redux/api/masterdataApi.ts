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
  setDeleteFailure,
  setDeleteMasterDataRecord,
  setDeletingKey,
  setMdWorkingOnLoadingLookupTablesList,
  setMdWorkingOnLoadingTablesList,
  setMultipleTableData,
  setMultipleLookupTableData,
  setTableRowData,
  setUpdatedMasterDataRecord,
  setWorkingOnLoad,
  setWorkingOnSave,
  setMasterDataRecord,
  clearTablesFromRepoAfterCrudOperations,
} from "../slices/masterdataSlice";
import { RootState } from "../../../redux/store";
import { buildErrorMessage } from "../types/errorTypes";
import { IFilterSortRequest, IRowsData } from "../../grid/GridViewTypes";
import { GridModel, IntegerCell } from "../types/gridTypes";

export interface IGetTableRowsDataParameters {
  tableName: string;
  filterSortRequest: IFilterSortRequest;
}

function IsGridWithSortId(
  gridRules: {
    [key: string]: GridModel;
  },
  tableName: string
): boolean {
  if (!(tableName in gridRules)) return false;
  const gridModel = gridRules[tableName];
  // console.log("IsGridWithSortId gridModel=", gridModel);
  const index = gridModel.cells.findIndex((fc) => {
    if (fc.typeName !== "Integer") return false;
    const IntegerCol = fc as IntegerCell;
    return IntegerCol.isSortId;
  });
  // console.log("IsGridWithSortId index=", index);
  return index > -1;
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
          // console.log("masterdataApi getTableRowsData data=", data);
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
        dispatch(setWorkingOnLoad(true));
        dispatch(
          setMdWorkingOnLoadingTablesList({
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
          setMdWorkingOnLoadingTablesList({
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
        dispatch(setWorkingOnLoad(true));
        dispatch(
          setMdWorkingOnLoadingLookupTablesList({
            tableNamesList: realyNeedLookupTables,
            switchOn: true,
          } as ISetMdWorkingOnLoadingTablesListAction)
        );
        try {
          const queryResult = await queryFulfilled;
          const { data } = queryResult;
          // console.log(
          //   "masterdataApi getLookupTables realyNeedTables=",
          //   realyNeedLookupTables
          // );
          // console.log(
          //   "masterdataApi getLookupTables queryResult=",
          //   queryResult
          // );
          dispatch(
            setMultipleLookupTableData({
              realyNeedLookupTables,
              tablesData: data.srv,
            } as ISetMultipleLookupTablesData)
          );
        } catch (error) {
          // console.log("masterdataApi getLookupTables error=", error);
          dispatch(setAlertApiLoadError(buildErrorMessage(error)));
        }
        dispatch(
          setMdWorkingOnLoadingLookupTablesList({
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
          dispatch(setWorkingOnSave(true));
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

          // const gridRules = (getState() as RootState).dataTypesState.gridRules;
          // if (IsGridWithSortId(gridRules, tableName)) {
          //   console.log("IsGridWithSortId on add");
          //   dispatch(clearTablesFromRepo([tableName]));
          // }

          dispatch(clearTablesFromRepoAfterCrudOperations());

          const idValue = data.entry[idFielName];
          const returnPageName = (getState() as RootState).masterDataState
            .returnPageName;
          const realReturnPageName = returnPageName ? returnPageName : "mdList";
          navigate(`/${realReturnPageName}/${tableName}/${idValue}`);
        } catch (error) {
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
        dispatch(setWorkingOnSave(false));
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
          dispatch(setWorkingOnSave(true));
          await queryFulfilled;
          dispatch(
            setUpdatedMasterDataRecord({
              tableName,
              idFielName,
              id,
              mdItem,
            } as ISetUpdatedMasterDataRecordAction)
          );

          // const gridRules = (getState() as RootState).dataTypesState.gridRules;
          // if (IsGridWithSortId(gridRules, tableName)) {
          //   console.log("IsGridWithSortId on update");
          //   dispatch(clearTablesFromRepo([tableName]));
          // }

          dispatch(clearTablesFromRepoAfterCrudOperations());

          const returnPageName = (getState() as RootState).masterDataState
            .returnPageName;
          const realReturnPageName = returnPageName ? returnPageName : "mdList";
          navigate(`/${realReturnPageName}/${tableName}/${id}`);
        } catch (error) {
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
        dispatch(setWorkingOnSave(false));
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
        { dispatch, getState, queryFulfilled }
      ) {
        try {
          dispatch(setDeleteFailure(false));
          dispatch(setDeletingKey(tableName + id.toString()));
          await queryFulfilled;
          dispatch(
            setDeleteMasterDataRecord({
              tableName,
              idFielName,
              id,
            } as ISetDeleteMasterDataRecordAction)
          );
          dispatch(setDeleteFailure(false));

          // const gridRules = (getState() as RootState).dataTypesState.gridRules;
          // if (IsGridWithSortId(gridRules, tableName)) {
          //   console.log("IsGridWithSortId on delete");
          //   dispatch(clearTablesFromRepo([tableName]));
          // }

          dispatch(clearTablesFromRepoAfterCrudOperations());

          const returnPageName = (getState() as RootState).masterDataState
            .returnPageName;
          const realReturnPageName = returnPageName ? returnPageName : "mdList";

          navigate(`/${realReturnPageName}/${tableName}`);
        } catch (error) {
          dispatch(setDeleteFailure(true));
          dispatch(setAlertApiMutationError(buildErrorMessage(error)));
        }
        dispatch(setDeletingKey(null));
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
