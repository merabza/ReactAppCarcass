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
    setItemEditorLookupTables,
    setItemEditorTables,
    setMdWorkingOnLoadingListData,
    setWorkingOnLoad,
} from "../../redux/slices/masterdataSlice";
import type { LookupCell, MdLookupCell } from "../../redux/types/gridTypes";
import type { ISetItemEditorTablesAction } from "../../redux/types/masterdataTypes";
export type fnloadListData = (
    tableName: string,
    loadListDataExceptThisTable?: boolean
) => void;

export function useMasterDataLookupLists(): [fnloadListData, boolean] {
    const dispatch = useAppDispatch();
    const masterDataState = useAppSelector((state) => state.masterDataState);
    const dataTypesState = useAppSelector((state) => state.dataTypesState);

    const [getDataTypes, { isLoading: loadingDataTypes }] =
        useLazyGetDataTypesQuery();

    const [getGridModel, { isLoading: loadingGridModel }] =
        useLazyGetGridModelQuery();

    const [getTables, { isLoading: loadingTables }] = useLazyGetTablesQuery();
    const [getLookupTables, { isLoading: loadingLookupTables }] =
        useLazyGetLookupTablesQuery();

    const loadListData = useCallback(
        (tableName: string) => {
            // console.log(
            //   "1 useMasterDataLists loadListData {tableName, masterDataState, dataTypesState}=",
            //   {
            //     tableName,
            //     masterDataState,
            //     dataTypesState,
            //   }
            // );

            if (masterDataState.mdWorkingOnLoadingListData) return;

            // console.log(
            //   "2 useMasterDataLists loadListData {tableName, masterDataState, dataTypesState}=",
            //   {
            //     tableName,
            //     masterDataState,
            //     dataTypesState,
            //   }
            // );

            // console.log("3 useMasterDataLists setMdWorkingOnLoadingListData");

            dispatch(setMdWorkingOnLoadingListData(true));
            dispatch(setWorkingOnLoad(true));

            if (dataTypesState.dataTypes.length === 0) {
                // console.log("4 useMasterDataLists getDataTypes");
                getDataTypes();
            }

            if (!(tableName in dataTypesState.gridRules)) {
                // console.log("5 useMasterDataLists getGridModel");
                getGridModel(tableName);
            }

            const requiredMdNames: Array<string> = [];
            const requiredMdLookupNames: Array<string> = [];

            // console.log(
            //   "6 useMasterDataLists masterDataState.itemEditorTables=",
            //   masterDataState.itemEditorTables
            // );
            // console.log(
            //   "7 useMasterDataLists masterDataState.itemEditorLookupTables=",
            //   masterDataState.itemEditorLookupTables
            // );

            if (
                !(tableName in masterDataState.itemEditorTables) ||
                !(tableName in masterDataState.itemEditorLookupTables)
            ) {
                const { gridRules } = dataTypesState;
                // console.log("8 useMasterDataLists loadListData gridRules=", gridRules);
                if (tableName in gridRules) {
                    const grid = gridRules[tableName];
                    if (grid !== undefined) {
                        grid?.cells.forEach((cell) => {
                            // console.log("8-1 useMasterDataLists loadListData cell=", cell);
                            if (cell.typeName === "Lookup") {
                                const lookupCol = cell as LookupCell;
                                // console.log(
                                //   "9 useMasterDataLists loadListData lookupCol=",
                                //   lookupCol
                                // );
                                if (lookupCol.dataMember)
                                    requiredMdNames.push(lookupCol.dataMember);
                            }
                            if (cell.typeName === "MdLookup") {
                                const mdLookupCol = cell as MdLookupCell;
                                // console.log(
                                //   "10 useMasterDataLists loadListData mdLookupCol=",
                                //   mdLookupCol
                                // );

                                if (mdLookupCol.dtTable)
                                    requiredMdLookupNames.push(
                                        mdLookupCol.dtTable
                                    );
                            }
                        });
                    }

                    dispatch(
                        setItemEditorTables({
                            tableNamesList: requiredMdNames,
                            editTableName: tableName,
                        } as ISetItemEditorTablesAction)
                    );

                    dispatch(
                        setItemEditorLookupTables({
                            tableNamesList: requiredMdLookupNames,
                            editTableName: tableName,
                        } as ISetItemEditorTablesAction)
                    );
                }
            } else {
                requiredMdNames.push(
                    ...masterDataState.itemEditorTables[tableName]
                );
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
                !Object.values(
                    masterDataState.mdWorkingOnLoadingLookupTables
                ).some((s: boolean) => s)
            ) {
                dispatch(setMdWorkingOnLoadingListData(false));
                dispatch(setWorkingOnLoad(false));
                return;
            }

            // console.log(
            //   "11 useMasterDataLists loadListData realyNeedTables=",
            //   realyNeedTables
            // );
            // console.log(
            //   "12 useMasterDataLists loadListData realyNeedLookupTables=",
            //   realyNeedLookupTables
            // );

            if (realyNeedTables.length > 0) getTables(realyNeedTables);

            if (realyNeedLookupTables.length > 0)
                getLookupTables(realyNeedLookupTables);

            // console.log("useMasterDataLists loadListData getTables Finished");
            dispatch(setMdWorkingOnLoadingListData(false));
            dispatch(setWorkingOnLoad(false));
        },
        [
            dataTypesState,
            loadingDataTypes,
            loadingGridModel,
            loadingTables,
            loadingLookupTables,
            masterDataState,
        ]
    );

    return [
        loadListData,
        loadingDataTypes ||
            loadingGridModel ||
            loadingTables ||
            loadingLookupTables,
    ];
}
