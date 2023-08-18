//useMasterDataLists.ts

import { useCallback } from "react";
import {
  useLazyGetDataTypesQuery,
  useLazyGetGridModelQuery,
} from "../../redux/api/dataTypesApi";
import { useLazyGetTablesQuery } from "../../redux/api/masterdataApi";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  SetItemEditorTables,
  SetMdWorkingOnLoadingListData,
  SetWorkingOnLoad,
} from "../../redux/slices/masterdataSlice";
import { DeserializeGridModel, LookupCell } from "../../redux/types/gridTypes";
export type fnloadListData = (gridName: string, tableName: string) => void;

export function useMasterDataLists(): [fnloadListData] {
  const dispatch = useAppDispatch();
  const masterDataState = useAppSelector((state) => state.masterDataState);
  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const [getDataTypes] = useLazyGetDataTypesQuery();

  const [getGridModel] = useLazyGetGridModelQuery();

  const [getTables] = useLazyGetTablesQuery();

  const loadListData = useCallback(
    async (gridName: string, tableName: string) => {
      // console.log(
      //   "useMasterDataLists loadListData {gridName, tableName, masterDataState, masterDataState.mdWorkingOnLoadingListData, dataTypesState.dataTypes.length}=",
      //   {
      //     gridName,
      //     tableName,
      //     masterDataState,
      //     mdWorkingOnLoadingListData:
      //       masterDataState.mdWorkingOnLoadingListData,
      //     b: dataTypesState.dataTypes.length,
      //   }
      // );

      if (masterDataState.mdWorkingOnLoadingListData) return;

      dispatch(SetWorkingOnLoad(true));
      dispatch(SetMdWorkingOnLoadingListData(true));

      if (dataTypesState.dataTypes.length === 0) {
        await getDataTypes();
      }

      if (!(gridName in dataTypesState.gridsDatas)) {
        await getGridModel(gridName);
      }

      const requiredMdNames: Array<string> = [tableName];

      const { gridsDatas } = dataTypesState;

      if (gridName in gridsDatas) {
        const gridData = gridsDatas[gridName];
        if (gridData !== undefined) {
          const grid = DeserializeGridModel(gridData);
          grid?.cells.forEach((cell) => {
            if (cell.typeName === "Lookup") {
              const lookupCol = cell as LookupCell;
              if (lookupCol.dataMember)
                requiredMdNames.push(lookupCol.dataMember);
            }
          });
        }
      }

      dispatch(SetItemEditorTables(requiredMdNames));

      const realyNeedTables = requiredMdNames.filter(
        (tableName) => !(tableName in masterDataState.mdRepo)
      );

      if (!realyNeedTables || realyNeedTables.length < 1) {
        dispatch(SetMdWorkingOnLoadingListData(false));
        dispatch(SetWorkingOnLoad(false));
        return;
      }

      await getTables(realyNeedTables);
      dispatch(SetMdWorkingOnLoadingListData(false));
      dispatch(SetWorkingOnLoad(false));
    },
    [
      dataTypesState,
      dispatch,
      getDataTypes,
      getGridModel,
      getTables,
      masterDataState,
    ]
  );

  return [loadListData];
}
