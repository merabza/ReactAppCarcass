//masterdataSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  IMasterDataRepo,
  ISetAddedMasterDataRecordAction,
  ISetDeleteMasterDataRecordAction,
  ISetMultipleTablesData,
  ISetUpdatedMasterDataRecordAction,
} from "../types/masterdataTypes";

export interface IMasterDataState {
  returnPageName: string | null;
  mdWorkingOnSave: boolean;
  mdWorkingOnLoad: boolean;
  mdRepo: IMasterDataRepo;
  mdWorkingOnLoadingListData: boolean;
  mdWorkingOnLoadingTables: boolean;
  mdWorkingOnClearingTables: boolean;
  deletingKey: string | null; //წაშლისას გამოიყენება deletingKey იმისათვის, რომ ცნობილი იყოს კონკრეტულად რომელი ჩანაწერი იშლება
  deleteFailure: boolean;
  itemEditorTables: Array<string>;
}

const initialState: IMasterDataState = {
  returnPageName: null,
  mdWorkingOnSave: false,
  mdWorkingOnLoad: false,
  mdRepo: {} as IMasterDataRepo,
  mdWorkingOnLoadingListData: false,
  mdWorkingOnLoadingTables: false,
  mdWorkingOnClearingTables: false,
  deletingKey: null, //წაშლისას გამოიყენება deletingKey იმისათვის, რომ ცნობილი იყოს კონკრეტულად რომელი ჩანაწერი იშლება
  deleteFailure: false,
  itemEditorTables: new Array<string>(),
};

export const masterdataSlice = createSlice({
  initialState,
  name: "masterdataSlice",
  reducers: {
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

    SetMdWorkingOnLoadingListData: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnLoadingListData = action.payload;
    },

    SetMdWorkingOnLoadingTables: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnLoadingTables = action.payload;
    },

    SetMdWorkingOnClearingTables: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnClearingTables = action.payload;
    },

    SetItemEditorTables: (state, action: PayloadAction<Array<string>>) => {
      state.itemEditorTables = action.payload;
    },

    saveReturnPageName: (state, action: PayloadAction<string>) => {
      state.returnPageName = action.payload;
    },

    SetDeletingKey: (state, action: PayloadAction<string | null>) => {
      state.deletingKey = action.payload;
    },

    SetWorkingOnSave: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnSave = action.payload;
    },

    SetWorkingOnLoad: (state, action: PayloadAction<boolean>) => {
      state.mdWorkingOnLoad = action.payload;
    },

    SetDeleteFailure: (state, action: PayloadAction<boolean>) => {
      state.deleteFailure = action.payload;
    },

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
  SetMdWorkingOnLoadingTables,
  SetMdWorkingOnClearingTables,
  SetItemEditorTables,
  saveReturnPageName,
  SetDeletingKey,
  SetWorkingOnSave,
  SetWorkingOnLoad,
  SetDeleteFailure,
  ClearTablesFromRepo,
} = masterdataSlice.actions;
