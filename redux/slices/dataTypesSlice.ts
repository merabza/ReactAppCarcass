//dataTypesSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IDictionary } from "../../common/types";
import { DataTypeFfModel } from "../types/dataTypesTypes";
import { ISetGridAction, ISetMultipleGrids } from "../types/rightsTypes";
import { DeserializeGridModel, GridModel } from "../types/gridTypes";

export interface IDataTypesState {
  dataTypes: Array<DataTypeFfModel>;
  gridsDatas: IDictionary;
  gridRules: { [key: string]: GridModel };
  dataTypesByTableNames: { [key: string]: DataTypeFfModel };
}

const initialState: IDataTypesState = {
  dataTypes: [] as DataTypeFfModel[],
  gridsDatas: {} as IDictionary,
  gridRules: {} as { [key: string]: GridModel },
  dataTypesByTableNames: {} as { [key: string]: DataTypeFfModel },
};

export const dataTypesSlice = createSlice({
  initialState,
  name: "dataTypesSlice",
  reducers: {
    setDataTypes: (state, action: PayloadAction<DataTypeFfModel[]>) => {
      const dataTypes = action.payload;
      state.dataTypes = dataTypes;
      dataTypes.forEach((dt) => {
        state.dataTypesByTableNames[dt.dtTable] = dt;
      });
    },
    setGrid: (state, action: PayloadAction<ISetGridAction>) => {
      const { gridName, gridData } = action.payload;
      console.log("dataTypesSlice setDataTypes { gridName, gridData } =", {
        gridName,
        gridData,
      });
      if (gridData === null) return;
      state.gridsDatas[gridName] = gridData;
      const gridRules = gridData ? DeserializeGridModel(gridData) : null;
      console.log("dataTypesSlice setDataTypes gridRules =", gridRules);
      if (gridRules) state.gridRules[gridName] = gridRules;
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
        const gridRules = gridData ? DeserializeGridModel(gridData) : null;
        if (gridRules) state.gridRules[gridName] = gridRules;
      });
    },
  },
});

export default dataTypesSlice.reducer;

export const { setDataTypes, setGrid, setMultipleGrids } =
  dataTypesSlice.actions;
