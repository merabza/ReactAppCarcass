//useCheckLoadMultipleListData.ts

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  useLazyGetDataTypesQuery,
  useLazyGetMultipleGridRulesQuery,
} from "../../redux/api/dataTypesApi";
import { DeserializeGridModel, LookupCell } from "../../redux/types/gridTypes";
import {
  SetItemEditorTables,
  SetMdWorkingOnLoadingListData,
} from "../../redux/slices/masterdataSlice";
import { useCheckLoadMdTables } from "./useCheckLoadMdTables";

export type fnLoadMultipleListData = (
  gridNames: string[],
  listTableNames: null | string[],
  additionalTableNames: null | string[]
) => void;

export function useCheckLoadMultipleListData(): [fnLoadMultipleListData] {
  const dispatch = useAppDispatch();
  const [checkLoadMdTables] = useCheckLoadMdTables();

  const masterDataState = useAppSelector((state) => state.masterDataState);
  const dataTypesState = useAppSelector((state) => state.dataTypesState);
  const [getDataTypes] = useLazyGetDataTypesQuery();
  const [getMultipleGridRules] = useLazyGetMultipleGridRulesQuery();

  function isGridNameIngridRules(gridName: string) {
    return gridName in dataTypesState.gridsDatas;
  }

  const loadMultipleListData = useCallback(
    async (
      gridNames: string[],
      listTableNames: null | string[],
      additionalTableNames: null | string[]
    ) => {
      // console.log("loadMultipleListData params > ", {
      //   gridNames,
      //   listTableNames,
      //   additionalTableNames,
      // });

      if (masterDataState.mdWorkingOnLoadingListData) return;

      dispatch(SetMdWorkingOnLoadingListData(true));

      if (dataTypesState.dataTypes.length === 0) {
        await getDataTypes();
      }

      const realyNeedGrids = gridNames.filter(
        (gridName) => !isGridNameIngridRules(gridName)
      );
      if (realyNeedGrids.length === 0) {
        dispatch(SetMdWorkingOnLoadingListData(false));
        return;
      }

      // console.log("loadMultipleListData realyNeedGrids = ", realyNeedGrids);

      await getMultipleGridRules(realyNeedGrids);

      const requiredMdNames = [];
      if (listTableNames) requiredMdNames.push(...listTableNames);
      if (additionalTableNames) requiredMdNames.push(...additionalTableNames);

      // console.log("loadMultipleListData requiredMdNames = ", requiredMdNames);

      const { gridsDatas } = dataTypesState;

      // console.log("loadMultipleListData gridsDatas = ", gridsDatas);

      gridNames.forEach((gridName) => {
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
      });

      // console.log(
      //   "loadMultipleListData final requiredMdNames=",
      //   requiredMdNames
      // );

      const distinctMdNames = Array.from(new Set(requiredMdNames));

      // console.log("loadMultipleListData distinctMdNames=", distinctMdNames);

      dispatch(SetItemEditorTables(distinctMdNames));

      checkLoadMdTables(distinctMdNames);

      dispatch(SetMdWorkingOnLoadingListData(false));
    },
    [dataTypesState.gridsDatas, masterDataState.mdWorkingOnLoadingListData]
  );
  return [loadMultipleListData];
}
