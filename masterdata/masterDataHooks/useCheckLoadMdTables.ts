//useCheckLoadMdTables.ts

import { useCallback } from "react";
import { useLazyGetDataTypesQuery } from "../../redux/api/dataTypesApi";
import { useLazyGetTablesQuery } from "../../redux/api/masterdataApi";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  SetMdWorkingOnLoadingTables,
  SetWorkingOnLoad,
} from "../../redux/slices/masterdataSlice";

export type fnCheckLoadMdTables = (tableNames: null | string[]) => void;

export function useCheckLoadMdTables(): [fnCheckLoadMdTables] {
  const dispatch = useAppDispatch();
  const masterDataState = useAppSelector((state) => state.masterDataState);
  const [getDataTypes] = useLazyGetDataTypesQuery();
  const [getTables] = useLazyGetTablesQuery();
  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const checkLoadMdTables = useCallback(
    async (tableNames: null | string[]) => {
      if (masterDataState.mdWorkingOnLoadingTables) return;

      dispatch(SetMdWorkingOnLoadingTables(true));

      if (dataTypesState.dataTypes.length === 0) {
        await getDataTypes();
      }

      if (tableNames) await getTables(tableNames);
      dispatch(SetMdWorkingOnLoadingTables(false));
      dispatch(SetWorkingOnLoad(false));
    },
    [dataTypesState.dataTypes.length, masterDataState.mdWorkingOnLoadingTables]
  );

  return [checkLoadMdTables];
}
