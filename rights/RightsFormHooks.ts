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
  dtKey: string | undefined,
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

  const [formRightState, dispatchRightForm] = useReducer(reducer, initialState);

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
      dtKey: string | undefined,
      key: string | undefined,
      refresh: boolean
    ) => {
      // console.log("loadChildsTreeDataAndChecks {rView, dtKey, key, refresh}=", {
      //   rView,
      //   dtKey,
      //   key,
      //   refresh,
      // });

      async function funLoadParentsTreeData(rView: RightsViewKind) {
        const { drParentsRepo } = rights;

        if (drParentsRepo && rView in drParentsRepo && drParentsRepo[rView])
          return;

        await getParentsTreeData(rView);
      }

      async function funLoadChildsTreeData(
        rView: RightsViewKind,
        dtKey: string | undefined
      ) {
        await funLoadParentsTreeData(rView);

        if (!dtKey) return;

        const { drChildrenRepo } = rights;

        if (
          drChildrenRepo &&
          rView in drChildrenRepo &&
          drChildrenRepo[rView] &&
          dtKey in drChildrenRepo[rView] &&
          drChildrenRepo[rView][dtKey]
        )
          return;

        await getChildrenTreeData({ dtKey, rViewId: rView });
      }

      async function CheckDataAndgetHalfChecks() {
        if (!dtKey || !key) return;

        const { drChecksRepo, drParentsRepo } = rights;

        if (
          drChecksRepo &&
          rView in drChecksRepo &&
          drChecksRepo[rView] &&
          dtKey in drChecksRepo[rView] &&
          drChecksRepo[rView][dtKey] &&
          key in drChecksRepo[rView][dtKey] &&
          drChecksRepo[rView][dtKey][key]
        )
          return;

        if (
          !drParentsRepo ||
          !(rView in drParentsRepo) ||
          !drParentsRepo[rView]
        )
          return;
        const dt = drParentsRepo[rView].find((item) => item.dtKey === dtKey);
        if (!dt) return;
        const parentTypeId = dt.dtId;

        await getHalfChecks({ dtKey, parentTypeId, key, rViewId: rView });
      }

      if (refresh) dispatchStore(clearForRefresh());

      await funLoadChildsTreeData(rView, dtKey);

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
