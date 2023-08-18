//useClearTablesFromRepo.ts

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  ClearTablesFromRepo,
  SetMdWorkingOnClearingTables,
  SetWorkingOnLoad,
} from "../../redux/slices/masterdataSlice";
import { useCheckLoadMdTables } from "./useCheckLoadMdTables";

export type fnClearTablesFromRepo = (
  tableNamesForClear: null | string[],
  tableNamesForLoad: null | string[]
) => void;

export function useClearTablesFromRepo(): [fnClearTablesFromRepo] {
  const dispatch = useAppDispatch();
  const masterDataState = useAppSelector((state) => state.masterDataState);
  const [checkLoadMdTables] = useCheckLoadMdTables();

  const clearTablesFromRepo = useCallback(
    async (
      tableNamesForClear: null | string[],
      tableNamesForLoad: null | string[]
    ) => {
      if (masterDataState.mdWorkingOnClearingTables) return;

      dispatch(SetMdWorkingOnClearingTables(true));

      dispatch(ClearTablesFromRepo(tableNamesForClear));

      if (tableNamesForLoad) checkLoadMdTables(tableNamesForLoad);

      dispatch(SetMdWorkingOnClearingTables(false));
      dispatch(SetWorkingOnLoad(false));
    },
    [masterDataState.mdWorkingOnClearingTables]
  );

  return [clearTablesFromRepo];
}
