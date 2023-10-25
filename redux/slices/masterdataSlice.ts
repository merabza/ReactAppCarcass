//masterdataSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IMasterDataRepo,
  ISetAddedMasterDataRecordAction,
  ISetDeleteMasterDataRecordAction,
  ISetMdWorkingOnLoadingOneTableAction,
  ISetMdWorkingOnLoadingTablesListAction,
  ISetMultipleTablesData,
  ISetUpdatedMasterDataRecordAction,
} from "../types/masterdataTypes";
import { IRowsData } from "../../grid/GridViewTypes";

export interface IMasterDataState {
  returnPageName: string | null;
  mdWorkingOnSave: boolean;
  mdWorkingOnLoad: boolean;
  mdRepo: IMasterDataRepo;
  mdWorkingOnLoadingListData: boolean;
  mdWorkingOnLoadingTables: { [key: string]: boolean };
  mdWorkingOnClearingTables: boolean;
  deletingKey: string | null; //წაშლისას გამოიყენება deletingKey იმისათვის, რომ ცნობილი იყოს კონკრეტულად რომელი ჩანაწერი იშლება
  deleteFailure: boolean;
  itemEditorTables: Array<string>;
  tableRowData: { [key: string]: IRowsData };
}

const initialState: IMasterDataState = {
  returnPageName: null,
  mdWorkingOnSave: false,
  mdWorkingOnLoad: false,
  mdRepo: {} as IMasterDataRepo,
  mdWorkingOnLoadingListData: false,
  mdWorkingOnLoadingTables: {} as { [key: string]: boolean },
  mdWorkingOnClearingTables: false,
  deletingKey: null, //წაშლისას გამოიყენება deletingKey იმისათვის, რომ ცნობილი იყოს კონკრეტულად რომელი ჩანაწერი იშლება
  deleteFailure: false,
  itemEditorTables: new Array<string>(),
  tableRowData: {} as { [key: string]: IRowsData },
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
        state.mdRepo[tableName] = tableDate;
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
    setAddedMasterDataRecord: (
      state,
      action: PayloadAction<ISetAddedMasterDataRecordAction>
    ) => {
      const { tableName, mdItem } = action.payload;
      const tableDate = state.mdRepo[tableName]
        ? state.mdRepo[tableName]
        : ([] as any[]);
      tableDate?.push(mdItem);
    },
    /////////////////////////////////////
    setUpdatedMasterDataRecord: (
      state,
      action: PayloadAction<ISetUpdatedMasterDataRecordAction>
    ) => {
      const { tableName, idFielName, mdItem } = action.payload;
      const tableDate = state.mdRepo[tableName]
        ? state.mdRepo[tableName]
        : ([] as any[]);
      if (tableDate === undefined) return;
      const existingMdItemIndex = tableDate.findIndex(
        (mdItm) => mdItm[idFielName] === mdItem[idFielName]
      );
      if (existingMdItemIndex === undefined) {
        tableDate.push(mdItem);
      } else {
        tableDate.splice(existingMdItemIndex, 1, mdItem);
      }
    },
    /////////////////////////////////////
    setDeleteMasterDataRecord: (
      state,
      action: PayloadAction<ISetDeleteMasterDataRecordAction>
    ) => {
      const { tableName, idFielName, id } = action.payload;
      const tableDate = state.mdRepo[tableName]
        ? state.mdRepo[tableName]
        : new Array<any>();
      if (tableDate === undefined) return;
      const existingMdItemIndex = tableDate.findIndex(
        (mdItm) => mdItm[idFielName] === id
      );
      if (existingMdItemIndex !== undefined) {
        tableDate.splice(existingMdItemIndex, 1);
      }
    },
    /////////////////////////////////////
    SetMdWorkingOnLoadingListData: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnLoadingListData = action.payload;
    },
    /////////////////////////////////////
    SetMdWorkingOnLoadingOneTable: (
      state,
      action: PayloadAction<ISetMdWorkingOnLoadingOneTableAction>
    ) => {
      const { tableName, switchOn } = action.payload;
      state.mdWorkingOnLoadingTables[tableName] = switchOn;
    },
    /////////////////////////////////////
    SetMdWorkingOnLoadingTablesList: (
      state,
      action: PayloadAction<ISetMdWorkingOnLoadingTablesListAction>
    ) => {
      const { tableNamesList, switchOn } = action.payload;
      tableNamesList.forEach(
        (tableName) => (state.mdWorkingOnLoadingTables[tableName] = switchOn)
      );
    },
    /////////////////////////////////////
    SetMdWorkingOnClearingTables: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnClearingTables = action.payload;
    },
    /////////////////////////////////////
    SetItemEditorTables: (state, action: PayloadAction<Array<string>>) => {
      state.itemEditorTables = action.payload;
    },
    /////////////////////////////////////
    saveReturnPageName: (state, action: PayloadAction<string>) => {
      state.returnPageName = action.payload;
    },
    /////////////////////////////////////
    SetDeletingKey: (state, action: PayloadAction<string | null>) => {
      state.deletingKey = action.payload;
    },
    /////////////////////////////////////
    SetWorkingOnSave: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnSave = action.payload;
    },
    /////////////////////////////////////
    SetWorkingOnLoad: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnLoad = action.payload;
    },
    /////////////////////////////////////
    SetDeleteFailure: (state, action: PayloadAction<boolean>) => {
      state.deleteFailure = action.payload;
    },
    /////////////////////////////////////
    ClearTablesFromRepo: (state, action: PayloadAction<null | string[]>) => {
      const mdRepo = state.mdRepo;
      const tableNames = action.payload;
      if (tableNames && Array.isArray(tableNames))
        tableNames.forEach((tn) => {
          if (tn in mdRepo) delete mdRepo[tn];
        });
    },
  },
});

export default masterdataSlice.reducer;

export const {
  setMultipleTableData,
  setAddedMasterDataRecord,
  setUpdatedMasterDataRecord,
  setDeleteMasterDataRecord,
  SetMdWorkingOnLoadingListData,
  SetMdWorkingOnLoadingOneTable,
  SetMdWorkingOnLoadingTablesList,
  SetMdWorkingOnClearingTables,
  SetItemEditorTables,
  saveReturnPageName,
  SetDeletingKey,
  SetWorkingOnSave,
  SetWorkingOnLoad,
  SetDeleteFailure,
  ClearTablesFromRepo,
  setTableRowData,
} = masterdataSlice.actions;
