//AppParametersSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { appParameters } from "../../../AppParameters";

export interface IAppParametersState {
    appName: string;
    baseUrl: string;
}

const initialState: IAppParametersState = appParameters;

export const AppParametersSlice = createSlice({
    initialState,
    name: "AppParametersSlice",
    reducers: {},
});

export default AppParametersSlice.reducer;
