//rightsSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  createOneRight,
  funAddOneRightAndChildren,
} from "../../rights/RightFormFunctions";

import {
  DataTypeModel,
  IAddRightAction,
  IParentsRightsDictionary,
  ISetChecksAction,
  ISetChildrenTreeAction,
  ISetParentsTreeAction,
  RightsChangeModel,
  RightsViewKind,
  TypeDataModel,
} from "../types/rightsTypes";

export interface IRightsState {
  drParentsRepo: IParentsRightsDictionary;
  drChildrenRepo: { [key: string]: DataTypeModel[] }[];
  drChecksRepo: {
    [key: string]: { [key: string]: TypeDataModel[] };
  }[];
  changedRights: RightsChangeModel[];
  drWorkingOnRefresh: boolean;
  selectedChildDataType: DataTypeModel | null;
  searchText: string | undefined;
  drWithCodes: boolean;
  drLinear: boolean;
}

interface turnAllParameters {
  selectedChildDataType: DataTypeModel;
  curRViewId: RightsViewKind | null;
  curKey: string | null | undefined;
  curParentDtKey: string | null | undefined;
  turnOn: boolean;
}

const initialState: IRightsState = {
  drParentsRepo: {} as IParentsRightsDictionary,
  drChildrenRepo: [] as { [key: string]: DataTypeModel[] }[],
  drChecksRepo: {} as {
    [key: string]: { [key: string]: TypeDataModel[] };
  }[],
  changedRights: [] as RightsChangeModel[],
  drWorkingOnRefresh: false,
  selectedChildDataType: null,
  searchText: undefined,
  drWithCodes: false,
  drLinear: false,
};

function fnAddRight(state: IRightsState, oneRight: RightsChangeModel) {
  const findedRightIndex = state.changedRights.findIndex(
    (f) =>
      f.parent !== null &&
      oneRight.parent !== null &&
      f.child !== null &&
      oneRight.child !== null &&
      f.parent.dtId === oneRight.parent.dtId &&
      f.parent.dKey === oneRight.parent.dKey &&
      f.child.dtId === oneRight.child.dtId &&
      f.child.dKey === oneRight.child.dKey
  );

  // console.log("addRight findedRightIndex=", findedRightIndex);
  // console.log("addRight oneRight=", oneRight);
  if (findedRightIndex === -1) {
    state.changedRights.push(oneRight);
  } else {
    state.changedRights[findedRightIndex].checked = oneRight.checked;
  }
}

export const rightsSlice = createSlice({
  initialState,
  name: "rightsSlice",
  reducers: {
    setParents: (state, action: PayloadAction<ISetParentsTreeAction>) => {
      state.drParentsRepo[action.payload.rViewId] = action.payload.data;
    },

    setChildren: (state, action: PayloadAction<ISetChildrenTreeAction>) => {
      // console.log("rightsSlice setChildren action.payload=", action.payload);
      try {
        state.drChildrenRepo[action.payload.rViewId] = {} as {
          [key: string]: DataTypeModel[];
        };
        state.drChildrenRepo[action.payload.rViewId][action.payload.dtKey] =
          action.payload.data;
      } catch (error) {
        // console.log("userRightsApi login catched error");
        // console.log("rightsSlice setChildren error=", error);
      }

      // console.log(
      //   "rightsSlice setChildren state.drChildrenRepo=",
      //   state.drChildrenRepo
      // );
    },

    setChecks: (state, action: PayloadAction<ISetChecksAction>) => {
      // console.log("rightsSlice setChecks action.payload=", action.payload);
      try {
        state.drChecksRepo[action.payload.rViewId] = {} as {
          [key: string]: { [key: string]: TypeDataModel[] };
        };
        state.drChecksRepo[action.payload.rViewId][action.payload.dtKey] =
          {} as {
            [key: string]: TypeDataModel[];
          };
        state.drChecksRepo[action.payload.rViewId][action.payload.dtKey][
          action.payload.key
        ] = action.payload.data;
      } catch (error) {
        // console.log("userRightsApi login catched error");
        // console.log("rightsSlice setChecks error=", error);
      }

      // console.log(
      //   "rightsSlice setChecks state.drChecksRepo=",
      //   state.drChecksRepo
      // );
    },

    clearChanges: (state) => {
      state.drChecksRepo = {} as {
        [key: string]: { [key: string]: TypeDataModel[] };
      }[];
      state.changedRights = [] as RightsChangeModel[];
    },

    clearForRefresh: (state) => {
      // console.log("rightsSlice clearForRefresh");
      state.drParentsRepo = {} as IParentsRightsDictionary;
      state.drChildrenRepo = {} as { [key: string]: DataTypeModel[] }[];
      state.drChecksRepo = {} as {
        [key: string]: { [key: string]: TypeDataModel[] };
      }[];
      state.changedRights = [] as RightsChangeModel[];
      state.drWorkingOnRefresh = true;
    },

    finishRefresh: (state) => {
      state.drWorkingOnRefresh = false;
    },

    setSelectedChildDataType: (
      state,
      action: PayloadAction<DataTypeModel | null>
    ) => {
      state.selectedChildDataType = action.payload;
    },

    setSearchText: (state, action: PayloadAction<string | undefined>) => {
      state.searchText = action.payload;
    },

    switchWithCodes: (state, action: PayloadAction<boolean>) => {
      state.drWithCodes = action.payload;
    },

    switchLinear: (state, action: PayloadAction<boolean>) => {
      state.drLinear = action.payload;
    },

    addRight: (state, action: PayloadAction<IAddRightAction>) => {
      const { dataType, oneRight, curParentDtKey, curRViewId } = action.payload;

      fnAddRight(state, oneRight);

      funAddOneRightAndChildren(
        state,
        dataType,
        oneRight,
        curParentDtKey,
        curRViewId
      );
    },

    turnAll: (state, action: PayloadAction<turnAllParameters>) => {
      const {
        selectedChildDataType,
        curRViewId,
        curParentDtKey,
        curKey,
        turnOn,
      } = action.payload;

      const { drParentsRepo } = state;

      selectedChildDataType.returnValues.forEach((item) => {
        const oneRight = createOneRight(
          selectedChildDataType,
          item,
          curRViewId,
          curKey,
          drParentsRepo,
          curParentDtKey
        );
        oneRight.checked = turnOn;
        fnAddRight(state, oneRight);
        funAddOneRightAndChildren(
          state,
          selectedChildDataType,
          oneRight,
          curParentDtKey,
          curRViewId
        );
      });
    },
  },
});

export default rightsSlice.reducer;

export const {
  setParents,
  setChildren,
  setChecks,
  clearChanges,
  clearForRefresh,
  finishRefresh,
  setSelectedChildDataType,
  setSearchText,
  switchWithCodes,
  switchLinear,
  addRight,
  turnAll,
} = rightsSlice.actions;
