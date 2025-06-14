//useClearTablesFromRepo.ts

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
    clearTablesFromRepo,
    setMdWorkingOnClearingTables,
    setWorkingOnLoad,
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

    const clearTables = useCallback(
        async (
            tableNamesForClear: null | string[],
            tableNamesForLoad: null | string[]
        ) => {
            if (masterDataState.mdWorkingOnClearingTables) return;

            dispatch(setMdWorkingOnClearingTables(true));

            dispatch(clearTablesFromRepo(tableNamesForClear));

            if (tableNamesForLoad) checkLoadMdTables(tableNamesForLoad);

            dispatch(setMdWorkingOnClearingTables(false));
            dispatch(setWorkingOnLoad(false));
        },
        [masterDataState.mdWorkingOnClearingTables]
    );

    return [clearTables];
}
