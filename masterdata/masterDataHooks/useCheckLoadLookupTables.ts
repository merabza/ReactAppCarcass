//useCheckLoadLookupTables.ts

import { useCallback } from "react";
import { useLazyGetLookupTablesQuery } from "../../redux/api/masterdataApi";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setWorkingOnLoad } from "../../redux/slices/masterdataSlice";

export type fnCheckLoadLookupTables = (tableNames: null | string[]) => void;

export function useCheckLoadLookupTables(): [fnCheckLoadLookupTables, boolean] {
    const dispatch = useAppDispatch();
    const masterDataState = useAppSelector((state) => state.masterDataState);
    const [getLookupTables, { isLoading: loadingLookupTables }] =
        useLazyGetLookupTablesQuery();

    const checkLoadLookupTables = useCallback(
        async (tableNames: null | string[]) => {
            if (!tableNames || tableNames.length === 0) return;

            const realyNeedTables = tableNames.filter(
                (tableName) =>
                    !(tableName in masterDataState.mdLookupRepo) &&
                    !masterDataState.mdWorkingOnLoadingLookupTables[tableName]
            );

            if (realyNeedTables.length === 0) return;

            await getLookupTables(realyNeedTables);

            dispatch(setWorkingOnLoad(false));
        },
        [masterDataState.mdWorkingOnLoadingLookupTables]
    );

    return [checkLoadLookupTables, loadingLookupTables];
}
