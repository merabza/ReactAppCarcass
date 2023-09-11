//userSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NzInt } from "../../common/myFunctions";
import { IAppUser } from "../types/authenticationTypes";

interface IUserState {
  userValidationChecked: boolean;
  loggingIn: boolean;
  registering: boolean;
  deletingRegistation: boolean;
  changingPassword: boolean;
  passwordChanged: boolean;
  changingProfile: boolean;
  user: IAppUser | null;
  tabWindowId: number;
}

const userItem = localStorage.getItem("user");
const localStorageuser = userItem ? JSON.parse(userItem) : null;
const lastTwId = NzInt(localStorage.getItem("lastTwId")) + 1;
localStorage.setItem("lastTwId", lastTwId.toString());

const initialState: IUserState = {
  userValidationChecked: false,
  loggingIn: false,
  registering: false,
  deletingRegistation: false,
  changingPassword: false,
  passwordChanged: false,
  changingProfile: false,
  user: localStorageuser,
  tabWindowId: lastTwId,
};

export const userSlice = createSlice({
  initialState,
  name: "userSlice",
  reducers: {
    logout: (state) => {
      localStorage.removeItem("user");
      state.userValidationChecked = true;
      state.loggingIn = false;
      state.user = null;
    },
    setUser: (state, action: PayloadAction<IAppUser>) => {
      var usr = action.payload;
      state.user = action.payload;
      if (usr && usr.token) {
        localStorage.setItem("user", JSON.stringify(usr));
      }
    },
    setIsCurrentUserValid: (state, action: PayloadAction<boolean>) => {
      const isUserValid = action.payload;
      state.userValidationChecked = isUserValid;
      if (!isUserValid) state.user = null;
    },
    setPasswordChanged: (state, action: PayloadAction<boolean>) => {
      state.passwordChanged = action.payload;
    },
    setChangingPassword: (state, action: PayloadAction<boolean>) => {
      state.changingPassword = action.payload;
    },
  },
});

export default userSlice.reducer;

export const {
  logout,
  setUser,
  setIsCurrentUserValid,
  setPasswordChanged,
  setChangingPassword,
} = userSlice.actions;
