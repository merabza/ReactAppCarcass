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
export type fnloadListData = (
  tableName: string,
  loadListDataExceptThisTable?: boolean
) => void;

export function useMasterDataLists(): [fnloadListData] {
  const dispatch = useAppDispatch();
  const masterDataState = useAppSelector((state) => state.masterDataState);
  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const [getDataTypes] = useLazyGetDataTypesQuery();

  const [getGridModel] = useLazyGetGridModelQuery();

  const [getTables] = useLazyGetTablesQuery();

  const loadListData = useCallback(
    async (tableName: string, loadListDataExceptThisTable?: boolean) => {
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

      if (!(tableName in dataTypesState.gridsDatas)) {
        await getGridModel(tableName);
      }

      const requiredMdNames: Array<string> = loadListDataExceptThisTable
        ? []
        : [tableName];

      const { gridsDatas } = dataTypesState;
      // console.log("useMasterDataLists loadListData gridsDatas=", gridsDatas);
      if (tableName in gridsDatas) {
        const gridData = gridsDatas[tableName];
        if (gridData !== undefined) {
          const grid = DeserializeGridModel(gridData);
          grid?.cells.forEach((cell) => {
            if (cell.typeName === "Lookup") {
              const lookupCol = cell as LookupCell;
              // console.log(
              //   "useMasterDataLists loadListData lookupCol=",
              //   lookupCol
              // );
              if (lookupCol.dataMember)
                requiredMdNames.push(lookupCol.dataMember);
            }
          });
        }
      }

      dispatch(SetItemEditorTables(requiredMdNames));

      const realyNeedTables = requiredMdNames.filter(
        (tableName) =>
          !(tableName in masterDataState.mdRepo) &&
          !masterDataState.mdWorkingOnLoadingTables[tableName]
      );

      if (
        realyNeedTables.length === 0 &&
        !Object.values(masterDataState.mdWorkingOnLoadingTables).some(
          (s: boolean) => s
        )
      ) {
        dispatch(SetMdWorkingOnLoadingListData(false));
        dispatch(SetWorkingOnLoad(false));
        return;
      }

      // console.log(
      //   "useMasterDataLists loadListData realyNeedTables=",
      //   realyNeedTables
      // );
      await getTables(realyNeedTables);
      // console.log("useMasterDataLists loadListData getTables Finished");
      dispatch(SetMdWorkingOnLoadingListData(false));
      dispatch(SetWorkingOnLoad(false));
    },
    [
      dataTypesState,
      // dispatch,
      // getDataTypes,
      // getGridModel,
      // getTables,
      masterDataState,
    ]
  );

  return [loadListData];
}
