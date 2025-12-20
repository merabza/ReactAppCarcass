//RightsFormHooks.ts

import { useCallback, useReducer } from "react";
import {
    useLazyGetChildrenTreeDataQuery,
    useLazyGetHalfChecksQuery,
    useLazyGetParentsTreeDataQuery,
    useSaveDataMutation,
} from "../redux/api/rightsApi";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { clearForRefresh, finishRefresh } from "../redux/slices/rightsSlice";
import { RightsViewKind } from "../redux/types/rightsTypes";

export type fnTurnExpanded = (
    forParent: boolean,
    nodeKey: string,
    expanded: boolean
) => void;
export type fnSaveDtaRightChanges = () => void;
export type fnLoadChildsTreeDataAndChecks = (
    rView: RightsViewKind,
    dtTable: string | undefined,
    key: string | undefined,
    refresh: boolean
) => void;

interface IExpDictionary {
    [index: string]: boolean;
}

export function useRightsForman(): [
    boolean,
    boolean,
    boolean,
    IExpDictionary,
    IExpDictionary,
    fnTurnExpanded,
    fnLoadChildsTreeDataAndChecks
] {
    interface IRightFormState {
        parExp: IExpDictionary;
        chiExp: IExpDictionary;
    }

    type ActionType = {
        type: "turnExpanded";
        payload: { forParent: boolean; nodeKey: string; expanded: boolean };
    };

    function reducer(formRightState: IRightFormState, action: ActionType) {
        //console.log("useForman changeField formState=", formState);
        //console.log("useForman changeField action=", action);
        const { type, payload } = action;
        switch (type) {
            case "turnExpanded": {
                const { forParent, nodeKey, expanded } = payload;
                const newExp = forParent
                    ? formRightState.parExp
                    : formRightState.chiExp;
                newExp[nodeKey] = expanded;
                if (forParent) return { ...formRightState, parExp: newExp };
                return { ...formRightState, chiExp: newExp };
            }
            default:
                throw new Error();
        }
    }

    const initialState: IRightFormState = {
        parExp: {} as IExpDictionary,
        chiExp: {} as IExpDictionary,
    };

    const [formRightState, dispatchRightForm] = useReducer(
        reducer,
        initialState
    );

    const turnExpanded = useCallback(
        (forParent: boolean, nodeKey: string, expanded: boolean) => {
            dispatchRightForm({
                type: "turnExpanded",
                payload: { forParent, nodeKey, expanded },
            });
        },
        [dispatchRightForm]
    );

    const dispatchStore = useAppDispatch();
    const rights = useAppSelector((state) => state.rightsState);
    const [getParentsTreeData, { isLoading: drParentsLoading }] =
        useLazyGetParentsTreeDataQuery();
    const [getChildrenTreeData, { isLoading: drChildsLoading }] =
        useLazyGetChildrenTreeDataQuery();
    const [getHalfChecks, { isLoading: drChecksLoading }] =
        useLazyGetHalfChecksQuery();

    const loadChildsTreeDataAndChecks = useCallback(
        async (
            rView: RightsViewKind,
            dtTable: string | undefined,
            key: string | undefined,
            refresh: boolean
        ) => {
            // console.log("loadChildsTreeDataAndChecks {rView, dtTable, key, refresh}=", {
            //   rView,
            //   dtTable,
            //   key,
            //   refresh,
            // });

            async function funLoadParentsTreeData(rView: RightsViewKind) {
                const { drParentsRepo } = rights;

                if (
                    drParentsRepo &&
                    rView in drParentsRepo &&
                    drParentsRepo[rView]
                )
                    return;

                await getParentsTreeData(rView);
            }

            async function funLoadChildsTreeData(
                rView: RightsViewKind,
                dtTable: string | undefined
            ) {
                await funLoadParentsTreeData(rView);

                if (!dtTable) return;

                const { drChildrenRepo } = rights;

                if (
                    drChildrenRepo &&
                    rView in drChildrenRepo &&
                    drChildrenRepo[rView] &&
                    dtTable in drChildrenRepo[rView] &&
                    drChildrenRepo[rView][dtTable]
                )
                    return;

                await getChildrenTreeData({ dtTable, rViewId: rView });
            }

            async function CheckDataAndgetHalfChecks() {

                // console.log("CheckDataAndgetHalfChecks dtTable, key=", {dtTable, key});

                if (!dtTable || !key) return;

                const { drChecksRepo, drParentsRepo } = rights;

                // console.log("CheckDataAndgetHalfChecks drChecksRepo=", drChecksRepo);

                if (
                    drChecksRepo &&
                    rView in drChecksRepo &&
                    drChecksRepo[rView] &&
                    dtTable in drChecksRepo[rView] &&
                    drChecksRepo[rView][dtTable] &&
                    key in drChecksRepo[rView][dtTable] &&
                    drChecksRepo[rView][dtTable][key]
                )
                    return;

                // console.log("CheckDataAndgetHalfChecks drParentsRepo=", drParentsRepo);
                // console.log("CheckDataAndgetHalfChecks rView=", rView);

                if (
                    !drParentsRepo ||
                    !(rView in drParentsRepo) ||
                    !drParentsRepo[rView]
                )
                    return;
                    
                // console.log("CheckDataAndgetHalfChecks drParentsRepo[rView]=", drParentsRepo[rView]);

                const dt = drParentsRepo[rView].find(
                    (item) => item.dtTable === dtTable
                );

                // console.log("CheckDataAndgetHalfChecks dt=", dt);


                if (!dt) return;
                const parentTypeId = dt.dtId;

                await getHalfChecks({
                    dtTable,
                    parentTypeId,
                    key,
                    rViewId: rView,
                });
            }

            if (refresh) dispatchStore(clearForRefresh());

            await funLoadChildsTreeData(rView, dtTable);

            await CheckDataAndgetHalfChecks();

            if (refresh) dispatchStore(finishRefresh());
        },
        [rights]
    );

    return [
        drChildsLoading,

        drChecksLoading,

        drParentsLoading,

        formRightState.parExp,

        formRightState.chiExp,

        turnExpanded,

        loadChildsTreeDataAndChecks,
    ];
}

export function useSaveDataRightChanges(): [boolean, fnSaveDtaRightChanges] {
    const [SaveDataRightChanges, { isLoading: drWorkingOnSave }] =
        useSaveDataMutation();
    const rights = useAppSelector((state) => state.rightsState);

    const saveDtaRightChanges = useCallback(async () => {
        await SaveDataRightChanges(rights.changedRights);
    }, [SaveDataRightChanges, rights.changedRights]);

    return [drWorkingOnSave, saveDtaRightChanges];
}
