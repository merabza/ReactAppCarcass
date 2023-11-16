//useMasterDataLookupLists.ts

import { useCallback } from "react";
import {
  useLazyGetDataTypesQuery,
  useLazyGetGridModelQuery,
} from "../../redux/api/dataTypesApi";
import {
  useLazyGetLookupTablesQuery,
  useLazyGetTablesQuery,
} from "../../redux/api/masterdataApi";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  SetItemEditorLookupTables,
  SetItemEditorTables,
  SetMdWorkingOnLoadingListData,
  SetWorkingOnLoad,
} from "../../redux/slices/masterdataSlice";
import {
  DeserializeGridModel,
  LookupCell,
  MdLookupCell,
} from "../../redux/types/gridTypes";
import { ISetItemEditorTablesAction } from "../../redux/types/masterdataTypes";
export type fnloadListData = (
  tableName: string,
  loadListDataExceptThisTable?: boolean
) => void;

export function useMasterDataLookupLists(): [fnloadListData] {
  const dispatch = useAppDispatch();
  const masterDataState = useAppSelector((state) => state.masterDataState);
  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const [getDataTypes] = useLazyGetDataTypesQuery();

  const [getGridModel] = useLazyGetGridModelQuery();

  const [getTables] = useLazyGetTablesQuery();
  const [getLookupTables] = useLazyGetLookupTablesQuery();

  const loadListData = useCallback(
    async (tableName: string) => {
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

      const requiredMdNames: Array<string> = [];
      const requiredMdLookupNames: Array<string> = [];

      if (
        !(tableName in masterDataState.itemEditorTables) ||
        !(tableName in masterDataState.itemEditorLookupTables)
      ) {
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
              if (cell.typeName === "MdLookup") {
                const mdLookupCol = cell as MdLookupCell;
                if (mdLookupCol.dtTable)
                  requiredMdLookupNames.push(mdLookupCol.dtTable);
              }
            });
          }
        }

        dispatch(
          SetItemEditorTables({
            tableNamesList: requiredMdNames,
            editTableName: tableName,
          } as ISetItemEditorTablesAction)
        );

        dispatch(
          SetItemEditorLookupTables({
            tableNamesList: requiredMdLookupNames,
            editTableName: tableName,
          } as ISetItemEditorTablesAction)
        );
      } else {
        requiredMdNames.push(...masterDataState.itemEditorTables[tableName]);
        requiredMdLookupNames.push(
          ...masterDataState.itemEditorLookupTables[tableName]
        );
      }

      const realyNeedTables = requiredMdNames.filter(
        (tableName) =>
          !(tableName in masterDataState.mdataRepo) &&
          !masterDataState.mdWorkingOnLoadingTables[tableName]
      );

      const realyNeedLookupTables = requiredMdLookupNames.filter(
        (tableName) =>
          !(tableName in masterDataState.mdLookupRepo) &&
          !masterDataState.mdWorkingOnLoadingLookupTables[tableName]
      );

      if (
        realyNeedTables.length === 0 &&
        !Object.values(masterDataState.mdWorkingOnLoadingTables).some(
          (s: boolean) => s
        ) &&
        realyNeedLookupTables.length === 0 &&
        !Object.values(masterDataState.mdWorkingOnLoadingLookupTables).some(
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
      await getLookupTables(realyNeedLookupTables);

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
