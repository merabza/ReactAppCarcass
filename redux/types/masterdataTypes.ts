//masterdataTypes.ts

import { NavigateFunction } from "react-router-dom";

export interface IMasterDataMutationParameters {
  tableName: string;
  idFielName: string;
  id: number;
  mdItem: any;
  navigate: NavigateFunction;
}

export interface IdeleteMasterDataRecordParameters {
  tableName: string;
  idFielName: string;
  id: number;
  navigate: NavigateFunction;
}

export interface ISetMultipleTablesData {
  realyNeedTables: string[];
  tablesData: IMasterDataRepo;
}

export interface IAdddMasterDataParameters {
  tableName: string;
  idFielName: string;
  mdItem: any;
  navigate: NavigateFunction;
}

export interface ISetAddedMasterDataRecordAction {
  tableName: string;
  mdItem: any;
}

export interface ISetUpdatedMasterDataRecordAction {
  tableName: string;
  idFielName: string;
  id: number;
  mdItem: any;
}

export interface ISetDeleteMasterDataRecordAction {
  tableName: string;
  idFielName: string;
  id: number;
}

export interface ISetMdWorkingOnLoadingOneTableAction {
  tableName: string;
  switchOn: boolean;
}

export interface ISetMdWorkingOnLoadingTablesListAction {
  tableNamesList: Array<string>;
  switchOn: boolean;
}

export interface IMasterDataRepo {
  [key: string]: any[];
}

export interface IMdTablesDataCommandResponse {
  entities: { [key: string]: any[] };
}
