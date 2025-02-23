//alertSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Err } from "../types/errorTypes";

interface IAlertState {
  alert: { [key: string]: Err[] };
}

export enum EAlertKind {
  ApiLoad,
  ApiMutation,
  ClientRunTime,
  Validdation,
}

const initialState: IAlertState = {
  alert: {} as { [key: string]: Err[] },
};

export interface IAlertData {
  errors: Err[];
  alertKind: EAlertKind;
}

export const alertSlice = createSlice({
  initialState,
  name: "alertSlice",
  reducers: {
    setAlert: (state, action: PayloadAction<IAlertData>) => {
      const { errors, alertKind } = action.payload;
      if (!(EAlertKind[alertKind] in state.alert)) {
        state.alert[EAlertKind[alertKind]] = errors;
      } else {
        state.alert[EAlertKind[alertKind]] =
          state.alert[EAlertKind[alertKind]].concat(errors);
      }
    },

    setAlertApiLoadError: (state, action: PayloadAction<Err[]>) => {
      const errors = action.payload;
      // console.log("setAlertApiLoadError errors=", errors);
      const alertKind = EAlertKind.ApiLoad;
      if (!(EAlertKind[alertKind] in state.alert)) {
        // console.log("setAlertApiLoadError first set errors=", errors);
        state.alert[EAlertKind[alertKind]] = errors;
      } else {
        const newErrors = state.alert[EAlertKind[alertKind]].concat(errors);
        // console.log("setAlertApiLoadError newErrors=", newErrors);

        state.alert[EAlertKind[alertKind]] = newErrors;
      }
    },

    setAlertApiMutationError: (state, action: PayloadAction<Err[]>) => {
      const errors = action.payload;
      const alert = state.alert;
      const alertKind = EAlertKind.ApiMutation;
      if (!(EAlertKind[alertKind] in alert)) {
        alert[EAlertKind[alertKind]] = errors;
      } else {
        const existedErrors = alert[EAlertKind[alertKind]];
        const newErrors = errors.filter(
          (e: { errorCode: string; }) => !existedErrors.find((ee) => ee.errorCode == e.errorCode)
        );
        state.alert[EAlertKind[alertKind]] =
          alert[EAlertKind[alertKind]].concat(newErrors);
      }
    },

    setAlertClientRunTimeError: (state, action: PayloadAction<Err>) => {
      const err = action.payload;
      const alert = state.alert;
      const alertKind = EAlertKind.ClientRunTime;
      if (!(EAlertKind[alertKind] in alert)) {
        alert[EAlertKind[alertKind]] = [err];
      } else {
        alert[EAlertKind[alertKind]].push(err);
      }
    },

    clearAlert: (state, action: PayloadAction<EAlertKind>) => {
      const alertKind = action.payload;
      // console.log("clearAlert 1 EAlertKind[alertKind]=", EAlertKind[alertKind]);
      // console.log("clearAlert alert=", state.alert);
      if (EAlertKind[alertKind] in state.alert) {
        // console.log(
        //   "clearAlert 2 EAlertKind[alertKind]=",
        //   EAlertKind[alertKind]
        // );
        state.alert[EAlertKind[alertKind]] = [] as Err[];
      }
    },

    clearAllAlerts: (state) => {
      state.alert = {} as { [key: string]: Err[] };
    },
  },
});

export default alertSlice.reducer;

export const {
  setAlert,
  clearAlert,
  clearAllAlerts,
  setAlertApiLoadError,
  setAlertApiMutationError,
  setAlertClientRunTimeError,
} = alertSlice.actions;
