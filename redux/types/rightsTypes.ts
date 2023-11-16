//rightsTypes.ts

//ეს არის ნიმუში, როგორ შეიძლება ენამის ჩანაცვლება
// const AuthMethod = {
//   Push: "Push",
//   sms: "SMS",
//   voice: "Voice"
// } as const

// export type AuthMethod = typeof AuthMethod[keyof typeof AuthMethod];

export enum RightsViewKind {
  normalView = 0,
  reverseView = 1,
}

export interface DataTypeModel {
  dtId: number;
  dtKey: string;
  dtName: string;
  dtTable: string;
  dtParentDataTypeId: number | null;
  returnValues: ReturnValueModel[];
}

export interface ReturnValueModel {
  value: number;
  key: string | null;
  name: string | null;
  parentId: number | null;
}

export interface TypeDataModel {
  dtId: number;
  dKey: string;
}

export interface RightsChangeModel {
  parent: TypeDataModel | null;
  child: TypeDataModel | null;
  checked: boolean;
}

export interface IAddRightAction {
  dtId: number;
  oneRight: RightsChangeModel;
  curParentDtKey: string | null | undefined;
  curRViewId: RightsViewKind | null;
}

export interface ISetParentsTreeAction {
  rViewId: RightsViewKind;
  data: DataTypeModel[];
}

export interface ISetChildrenTreeAction {
  dtKey: string;
  rViewId: RightsViewKind;
  data: DataTypeModel[];
}

export interface ISetChecksAction {
  rViewId: RightsViewKind;
  dtKey: string;
  key: string;
  data: TypeDataModel[];
}

export type IParentsRightsDictionary = {
  [rViewId in RightsViewKind]: DataTypeModel[];
};

export interface ISetGridAction {
  gridName: string;
  gridData: string;
}

export interface ISetMultipleGrids {
  realyNeedGrids: string[];
  gridsData: { [key: string]: string };
}
