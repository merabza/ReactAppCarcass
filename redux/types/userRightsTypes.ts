//userRightsTypes.ts

export interface IMenuItmModel {
  menId: number;
  menKey: string;
  menName: string;
  menValue: string | null;
  menGroupId: number;
  sortId: number;
  menLinkKey: string;
  menIconName: string | null;
  create: boolean;
  update: boolean;
  delete: boolean;
  confirm: boolean;
}

export interface IMenuGroupModel {
  mengId: number;
  mengKey: string;
  mengName: string;
  sortId: number;
  mengIconName: string | null;
  hidden: boolean;
  expanded: boolean;
  menu: IMenuItmModel[];
}

export interface IMainMenuModel {
  menuGroups: IMenuGroupModel[];
}

export interface IdeleteCurrentUserParameters {
  userName: string;
}
