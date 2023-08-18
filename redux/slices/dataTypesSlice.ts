//dataTypesSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IDictionary } from "../../common/types";
import { DataTypeFfModel } from "../types/dataTypesTypes";
import { ISetGridAction, ISetMultipleGrids } from "../types/rightsTypes";

export interface IDataTypesState {
  dataTypes: Array<DataTypeFfModel>;
  gridsDatas: IDictionary;
}

const initialState: IDataTypesState = {
  dataTypes: [] as DataTypeFfModel[],
  gridsDatas: {} as IDictionary,
};

export const dataTypesSlice = createSlice({
  initialState,
  name: "dataTypesSlice",
  reducers: {
    setDataTypes: (state, action: PayloadAction<DataTypeFfModel[]>) => {
      state.dataTypes = action.payload;
    },
    setGrid: (state, action: PayloadAction<ISetGridAction>) => {
      const { gridName, gridData } = action.payload;
      if (gridData != null) state.gridsDatas[gridName] = gridData;
    },
    setMultipleGrids: (state, action: PayloadAction<ISetMultipleGrids>) => {
      // console.log(
      //   "dataTypesSlice setMultipleGrids action.payload = ",
      //   action.payload
      // );
      const { realyNeedGrids, gridsData } = action.payload;
      // console.log("dataTypesSlice setMultipleGrids gridsData = ", gridsData);
      // console.log(
      //   "dataTypesSlice setMultipleGrids realyNeedGrids = ",
      //   realyNeedGrids
      // );

      realyNeedGrids.forEach((gridName) => {
        if (!(gridName in gridsData)) return;
        const gridData = gridsData[gridName];
        if (gridData === undefined) return;

        state.gridsDatas[gridName] = gridData;
      });
    },
  },
});

export default dataTypesSlice.reducer;

export const { setDataTypes, setGrid, setMultipleGrids } =
  dataTypesSlice.actions;
