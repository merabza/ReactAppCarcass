//masterdataSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ILookupDataRepo,
  IMasterDataRepo,
  ITableNameAndMasterDataRecord,
  ISetDeleteMasterDataRecordAction,
  ISetItemEditorTablesAction,
  ISetMdWorkingOnLoadingOneTableAction,
  ISetMdWorkingOnLoadingTablesListAction,
  ISetMultipleLookupTablesData,
  ISetMultipleTablesData,
  ISetUpdatedMasterDataRecordAction,
} from "../types/masterdataTypes";
import { IRowsData } from "../../grid/GridViewTypes";

export interface IMasterDataState {
  returnPageName: string | null;
  mdWorkingOnSave: boolean;
  mdWorkingOnLoad: boolean;
  mdLookupRepo: ILookupDataRepo;
  mdataRepo: IMasterDataRepo;
  mdWorkingOnLoadingListData: boolean;
  mdRecordForEdit: { [key: string]: any };
  mdWorkingOnLoadingTables: { [key: string]: boolean };
  mdWorkingOnLoadingLookupTables: { [key: string]: boolean };
  mdWorkingOnClearingTables: boolean;
  deletingKey: string | null; //წაშლისას გამოიყენება deletingKey იმისათვის, რომ ცნობილი იყოს კონკრეტულად რომელი ჩანაწერი იშლება
  deleteFailure: boolean;
  itemEditorTables: { [key: string]: Array<string> };
  itemEditorLookupTables: { [key: string]: Array<string> };
  tableRowData: { [key: string]: IRowsData };
  tablesForClearAfterCrudOperations: Array<string>;
}

const initialState: IMasterDataState = {
  returnPageName: null,
  mdWorkingOnSave: false,
  mdWorkingOnLoad: false,
  mdLookupRepo: {} as ILookupDataRepo,
  mdataRepo: {} as IMasterDataRepo,
  mdWorkingOnLoadingListData: false,
  mdRecordForEdit: {} as { [key: string]: any },
  mdWorkingOnLoadingTables: {} as { [key: string]: boolean },
  mdWorkingOnLoadingLookupTables: {} as { [key: string]: boolean },
  mdWorkingOnClearingTables: false,
  deletingKey: null, //წაშლისას გამოიყენება deletingKey იმისათვის, რომ ცნობილი იყოს კონკრეტულად რომელი ჩანაწერი იშლება
  deleteFailure: false,
  itemEditorTables: {} as { [key: string]: Array<string> },
  itemEditorLookupTables: {} as { [key: string]: Array<string> },
  tableRowData: {} as { [key: string]: IRowsData },
  tablesForClearAfterCrudOperations: [] as Array<string>,
};

export const masterdataSlice = createSlice({
  initialState,
  name: "masterdataSlice",
  reducers: {
    /////////////////////////////////////
    setMultipleTableData: (
      state,
      action: PayloadAction<ISetMultipleTablesData>
    ) => {
      const { realyNeedTables, tablesData } = action.payload;
      // console.log(
      //   "masterdataSlice setMultipleTableData { realyNeedTables, tablesData }=",
      //   {
      //     realyNeedTables,
      //     tablesData,
      //   }
      // );
      realyNeedTables.forEach((tableName) => {
        if (!tablesData[tableName]) return;
        const tableDate = tablesData[tableName];
        if (tableDate === undefined) return;
        state.mdataRepo[tableName] = tableDate;
      });
    },
    /////////////////////////////////////
    setMultipleLookupTableData: (
      state,
      action: PayloadAction<ISetMultipleLookupTablesData>
    ) => {
      const { realyNeedLookupTables, tablesData } = action.payload;
      // console.log(
      //   "masterdataSlice setMultipleTableData { realyNeedTables, tablesData }=",
      //   {
      //     realyNeedTables,
      //     tablesData,
      //   }
      // );
      realyNeedLookupTables.forEach((tableName) => {
        if (!tablesData[tableName]) return;
        const tableDate = tablesData[tableName];
        if (tableDate === undefined) return;
        state.mdLookupRepo[tableName] = tableDate;
      });
    },
    /////////////////////////////////////
    setTableRowData: (
      state,
      action: PayloadAction<{
        tableName: string;
        data: IRowsData;
      }>
    ) => {
      const { tableName, data } = action.payload;
      state.tableRowData[tableName] = data;
    },
    /////////////////////////////////////
    setMasterDataRecord: (
      state,
      action: PayloadAction<ITableNameAndMasterDataRecord>
    ) => {
      const { tableName, mdItem } = action.payload;
      state.mdRecordForEdit[tableName] = mdItem;
    },
    /////////////////////////////////////
    setAddedMasterDataRecord: (
      state,
      action: PayloadAction<ITableNameAndMasterDataRecord>
    ) => {
      const { tableName, mdItem } = action.payload;
      if (tableName in state.tableRowData) delete state.tableRowData[tableName];
      if (tableName in state.mdLookupRepo) delete state.mdLookupRepo[tableName];
    },
    /////////////////////////////////////
    setUpdatedMasterDataRecord: (
      state,
      action: PayloadAction<ISetUpdatedMasterDataRecordAction>
    ) => {
      const { tableName, idFielName, mdItem } = action.payload;
      const tableDate = state.tableRowData[tableName];
      if (tableDate) {
        const existingMdItemIndex = tableDate.rows.findIndex(
          (mdItm) => mdItm[idFielName] === mdItem[idFielName]
        );
        if (existingMdItemIndex) {
          tableDate.rows.splice(existingMdItemIndex, 1, mdItem);
        }
      }
      if (tableName in state.mdLookupRepo) delete state.mdLookupRepo[tableName];
    },
    /////////////////////////////////////
    setDeleteMasterDataRecord: (
      state,
      action: PayloadAction<ISetDeleteMasterDataRecordAction>
    ) => {
      const { tableName, idFielName, id } = action.payload;
      const tableDate = state.tableRowData[tableName];
      if (tableDate) {
        const existingMdItemIndex = tableDate.rows.findIndex(
          (mdItm) => mdItm[idFielName] === id
        );
        if (existingMdItemIndex) {
          tableDate.rows.splice(existingMdItemIndex, 1);
        }
      }
      if (tableName in state.mdLookupRepo) delete state.mdLookupRepo[tableName];
    },
    /////////////////////////////////////
    setMdWorkingOnLoadingListData: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnLoadingListData = action.payload;
    },
    /////////////////////////////////////
    setMdWorkingOnLoadingOneTable: (
      state,
      action: PayloadAction<ISetMdWorkingOnLoadingOneTableAction>
    ) => {
      const { tableName, switchOn } = action.payload;
      state.mdWorkingOnLoadingTables[tableName] = switchOn;
    },
    /////////////////////////////////////
    setMdWorkingOnLoadingOneLookupTable: (
      state,
      action: PayloadAction<ISetMdWorkingOnLoadingOneTableAction>
    ) => {
      const { tableName, switchOn } = action.payload;
      state.mdWorkingOnLoadingLookupTables[tableName] = switchOn;
    },
    /////////////////////////////////////
    setMdWorkingOnLoadingTablesList: (
      state,
      action: PayloadAction<ISetMdWorkingOnLoadingTablesListAction>
    ) => {
      const { tableNamesList, switchOn } = action.payload;
      tableNamesList.forEach(
        (tableName) => (state.mdWorkingOnLoadingTables[tableName] = switchOn)
      );
    },
    /////////////////////////////////////
    setMdWorkingOnLoadingLookupTablesList: (
      state,
      action: PayloadAction<ISetMdWorkingOnLoadingTablesListAction>
    ) => {
      const { tableNamesList, switchOn } = action.payload;
      tableNamesList.forEach(
        (tableName) =>
          (state.mdWorkingOnLoadingLookupTables[tableName] = switchOn)
      );
    },
    /////////////////////////////////////
    setMdWorkingOnClearingTables: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnClearingTables = action.payload;
    },
    /////////////////////////////////////
    setItemEditorTables: (
      state,
      action: PayloadAction<ISetItemEditorTablesAction>
    ) => {
      // console.log(
      //   "masterdataSlice setItemEditorTables action.payload=",
      //   action.payload
      // );
      const { tableNamesList, editTableName } = action.payload;
      state.itemEditorTables[editTableName] = tableNamesList;
      // console.log(
      //   "masterdataSlice setItemEditorTables state.itemEditorTables=",
      //   state.itemEditorTables
      // );
    },
    /////////////////////////////////////
    setItemEditorLookupTables: (
      state,
      action: PayloadAction<ISetItemEditorTablesAction>
    ) => {
      // console.log(
      //   "masterdataSlice setItemEditorLookupTables action.payload=",
      //   action.payload
      // );
      const { tableNamesList, editTableName } = action.payload;
      state.itemEditorLookupTables[editTableName] = tableNamesList;
      // console.log(
      //   "masterdataSlice setItemEditorLookupTables state.itemEditorLookupTables=",
      //   state.itemEditorLookupTables
      // );
    },
    /////////////////////////////////////
    saveReturnPageName: (state, action: PayloadAction<string>) => {
      state.returnPageName = action.payload;
    },
    /////////////////////////////////////
    setDeletingKey: (state, action: PayloadAction<string | null>) => {
      state.deletingKey = action.payload;
    },
    /////////////////////////////////////
    setWorkingOnSave: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnSave = action.payload;
    },
    /////////////////////////////////////
    setWorkingOnLoad: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnLoad = action.payload;
    },
    /////////////////////////////////////
    setDeleteFailure: (state, action: PayloadAction<boolean>) => {
      state.deleteFailure = action.payload;
    },
    /////////////////////////////////////
    clearTablesFromRepo: (state, action: PayloadAction<null | string[]>) => {
      const mdRepo = state.mdLookupRepo;
      const tableNames = action.payload;
      if (tableNames && Array.isArray(tableNames))
        tableNames.forEach((tn) => {
          if (tn in mdRepo) delete mdRepo[tn];
        });
    },
    /////////////////////////////////////
    clearTablesFromRepoAfterCrudOperations: (state) => {
      const mdataRepo = state.mdataRepo;
      const tableNames = state.tablesForClearAfterCrudOperations;
      if (tableNames && Array.isArray(tableNames))
        tableNames.forEach((tn) => {
          if (tn in mdataRepo) delete mdataRepo[tn];
        });
      state.tablesForClearAfterCrudOperations = [] as Array<string>;
    },
    /////////////////////////////////////
    setTablesForClearAfterCrudOperations: (
      state,
      action: PayloadAction<string[]>
    ) => {
      const tableNames = action.payload;
      tableNames.forEach((tableName) =>
        state.tablesForClearAfterCrudOperations.push(tableName)
      );
    },
    /////////////////////////////////////
    clearTablesForClearAfterCrudOperations: (state) => {
      state.tablesForClearAfterCrudOperations = [] as Array<string>;
    },
    /////////////////////////////////////
    // ClearTableFromRepoIfTableIsWithSortId: (state, action: PayloadAction<string>) => {
    //   const mdRepo = state.mdLookupRepo;
    //   const tableName = action.payload;
    //   const reduxStore = store.getState();
    //   const gridRules = state.dataTypesState.gridRules[tableName];

    //   if (tableName in mdRepo) delete mdRepo[tableName];
    // },
    /////////////////////////////////////
  },
});

export default masterdataSlice.reducer;

export const {
  setMultipleTableData,
  setMultipleLookupTableData,
  setAddedMasterDataRecord,
  setUpdatedMasterDataRecord,
  setDeleteMasterDataRecord,
  setMdWorkingOnLoadingListData,
  setMdWorkingOnLoadingOneTable,
  setMdWorkingOnLoadingOneLookupTable,
  setMdWorkingOnLoadingTablesList,
  setMdWorkingOnLoadingLookupTablesList,
  setMdWorkingOnClearingTables,
  setItemEditorTables,
  setItemEditorLookupTables,
  saveReturnPageName,
  setDeletingKey,
  setWorkingOnSave,
  setWorkingOnLoad,
  setDeleteFailure,
  clearTablesFromRepo,
  setTableRowData,
  setMasterDataRecord,
  clearTablesFromRepoAfterCrudOperations,
  setTablesForClearAfterCrudOperations,
  clearTablesForClearAfterCrudOperations,
} = masterdataSlice.actions;
