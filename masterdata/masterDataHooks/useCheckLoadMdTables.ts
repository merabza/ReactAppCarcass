//useCheckLoadMdTables.ts

import { useCallback } from "react";
import { useLazyGetDataTypesQuery } from "../../redux/api/dataTypesApi";
import { useLazyGetTablesQuery } from "../../redux/api/masterdataApi";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setWorkingOnLoad } from "../../redux/slices/masterdataSlice";

export type fnCheckLoadMdTables = (tableNames: null | string[]) => void;

export function useCheckLoadMdTables(): [fnCheckLoadMdTables] {
    const dispatch = useAppDispatch();
    const masterDataState = useAppSelector((state) => state.masterDataState);
    const [getDataTypes] = useLazyGetDataTypesQuery();
    const [getTables] = useLazyGetTablesQuery();
    const dataTypesState = useAppSelector((state) => state.dataTypesState);

    const checkLoadMdTables = useCallback(
        async (tableNames: null | string[]) => {
            if (!tableNames || tableNames.length === 0) return;

            const realyNeedTables = tableNames.filter(
                (tableName) =>
                    !(tableName in masterDataState.mdataRepo) &&
                    !masterDataState.mdWorkingOnLoadingTables[tableName]
            );

            if (realyNeedTables.length === 0) return;

            if (dataTypesState.dataTypes.length === 0) {
                await getDataTypes();
            }

            await getTables(realyNeedTables);

            dispatch(setWorkingOnLoad(false));
        },
        [
            dataTypesState.dataTypes.length,
            masterDataState.mdWorkingOnLoadingTables,
        ]
    );

    return [checkLoadMdTables];
}
