//navMenuSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IMainMenuModel, IMenuItmModel } from "../types/userRightsTypes";

interface INavMenuState {
  active: boolean;
  mainMenu: IMainMenuModel | null;
  flatMenu: IMenuItmModel[] | null;
  isMenuLoading: boolean;
}

const initialState: INavMenuState = {
  active: false,
  mainMenu: null,
  flatMenu: null,
  isMenuLoading: false,
};

export const navMenuSlice = createSlice({
  initialState,
  name: "navMenuSlice",
  reducers: {
    toggleactive: (state) => {
      state.active = !state.active;
    },
    toggleexp: (state, action: PayloadAction<number>) => {
      const submenuindex = action.payload;
      if (state.mainMenu !== null)
        state.mainMenu.menuGroups.map((mengitem, index) => {
          if (submenuindex === index) {
            mengitem.expanded = !mengitem.expanded;
          }
          return mengitem;
        });
    },
    setNavMenu: (state, action: PayloadAction<IMainMenuModel>) => {
      state.mainMenu = action.payload;
      state.flatMenu = action.payload.menuGroups?.reduce<IMenuItmModel[]>(
        (flat, grp) => flat.concat(grp.menu),
        []
      );
    },
    setMenuLoading: (state, action: PayloadAction<boolean>) => {
      state.isMenuLoading = action.payload;
    },
  },
});

export default navMenuSlice.reducer;

export const { toggleactive, toggleexp, setNavMenu, setMenuLoading } =
  navMenuSlice.actions;
