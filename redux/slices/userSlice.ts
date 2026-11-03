//userSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { NzInt } from "../../common/myFunctions";
import type { IAppUser, IPendingLogin } from "../types/authenticationTypes";

interface IUserState {
    isUserValid: boolean;
    userValidationChecked: boolean;
    CheckingUser: boolean;
    loggingIn: boolean;
    registering: boolean;
    deletingRegistation: boolean;
    changingPassword: boolean;
    // passwordChanged: boolean;
    changingProfile: boolean;
    user: IAppUser | null;
    //დაუსრულებელი ავტორიზაცია (ელფოსტის დადასტურება, ან პაროლის ცვლილება ელოდება).
    //localStorage-ში ინახება, რომ ელფოსტიდან გახსნილმა ბმულმა ახალ ტაბშიც იპოვოს
    pendingLogin: IPendingLogin | null;
    tabWindowId: number;
}

const userItem = localStorage.getItem("user");
const localStorageuser = userItem ? JSON.parse(userItem) : null;
const pendingLoginItem = localStorage.getItem("pendingLogin");
const localStoragePendingLogin = pendingLoginItem ? JSON.parse(pendingLoginItem) : null;
const lastTwId = NzInt(localStorage.getItem("lastTwId")) + 1;
localStorage.setItem("lastTwId", lastTwId.toString());

const initialState: IUserState = {
    isUserValid: false,
    userValidationChecked: false,
    CheckingUser: false,
    loggingIn: false,
    registering: false,
    deletingRegistation: false,
    changingPassword: false,
    // passwordChanged: false,
    changingProfile: false,
    user: localStorageuser,
    pendingLogin: localStoragePendingLogin,
    tabWindowId: lastTwId,
};

export const userSlice = createSlice({
    initialState,
    name: "userSlice",
    reducers: {
        logout: (state) => {
            localStorage.removeItem("user");
            localStorage.removeItem("pendingLogin");
            state.CheckingUser = false;
            state.isUserValid = false;
            state.loggingIn = false;
            state.user = null;
            state.pendingLogin = null;
            state.userValidationChecked = true;
        },
        setUser: (state, action: PayloadAction<IAppUser | null>) => {
            var usr = action.payload;
            state.user = action.payload;
            state.userValidationChecked = true;
            if (usr && usr.token) {
                localStorage.setItem("user", JSON.stringify(usr));
                localStorage.removeItem("pendingLogin");
                state.pendingLogin = null;
                state.isUserValid = true;
            }
            state.CheckingUser = false;
            state.loggingIn = false;
        },
        setPendingLogin: (state, action: PayloadAction<IPendingLogin | null>) => {
            const pending = action.payload;
            state.pendingLogin = pending;
            if (pending) localStorage.setItem("pendingLogin", JSON.stringify(pending));
            else localStorage.removeItem("pendingLogin");
            localStorage.removeItem("user");
            state.user = null;
            state.isUserValid = false;
            state.userValidationChecked = true;
            state.CheckingUser = false;
            state.loggingIn = false;
        },
        setIsCurrentUserValid: (state, action: PayloadAction<boolean>) => {
            const isUserValid = action.payload;
            state.isUserValid = isUserValid;
            if (!isUserValid) state.user = null;
            state.CheckingUser = false;
            state.userValidationChecked = true;
        },
        setCheckingUser: (state, action: PayloadAction<boolean>) => {
            state.CheckingUser = action.payload;
        },
        setloggingIn: (state, action: PayloadAction<boolean>) => {
            state.loggingIn = action.payload;
        },
        // setUserValid: (state, action: PayloadAction<boolean>) => {
        //   state.isUserValid = action.payload;
        //   state.userValidationChecked = true;
        // },
        // setPasswordChanged: (state, action: PayloadAction<boolean>) => {
        //     state.passwordChanged = action.payload;
        // },
        setChangingPassword: (state, action: PayloadAction<boolean>) => {
            state.changingPassword = action.payload;
        },
    },
});

export default userSlice.reducer;

export const {
    logout,
    setUser,
    setPendingLogin,
    setloggingIn,
    setCheckingUser,
    setIsCurrentUserValid,
    // setPasswordChanged,
    setChangingPassword,
} = userSlice.actions;
