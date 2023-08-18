//RightFormFunctions.ts

import { IRightsState } from "../redux/slices/rightsSlice";
import {
  DataTypeModel,
  IParentsRightsDictionary,
  ReturnValueModel,
  RightsChangeModel,
  RightsViewKind,
  TypeDataModel,
} from "../redux/types/rightsTypes";

export function createOneRight(
  dataType: DataTypeModel,
  retValue: ReturnValueModel,
  curRViewId: RightsViewKind | null,
  curKey: string | null | undefined,
  drParentsRepo: IParentsRightsDictionary,
  curParentDtKey: string | null | undefined
): RightsChangeModel {
  const oneRight = {} as RightsChangeModel;
  if (
    curRViewId === null ||
    retValue.key === null ||
    curKey === null ||
    curKey === undefined
  )
    return oneRight;
  const dt = drParentsRepo[curRViewId].find(
    (item) => item.dtKey === curParentDtKey
  );
  if (dt === undefined) return oneRight;
  if (curRViewId === RightsViewKind.normalView) {
    oneRight.parent = { dtId: dt.dtId, dKey: curKey };
    oneRight.child = { dtId: dataType.dtId, dKey: retValue.key };
  } else {
    oneRight.parent = { dtId: dataType.dtId, dKey: retValue.key };
    oneRight.child = { dtId: dt.dtId, dKey: curKey };
  }
  return oneRight;
}

export function getChildrenDataTypes(
  dataType: DataTypeModel,
  drLinear: boolean,
  curParentDtKey: string | null | undefined,
  curRViewId: RightsViewKind | null,
  drChildrenRepo: { [key: string]: DataTypeModel[] }[]
): DataTypeModel[] {
  let childrenDataTypes = [] as DataTypeModel[];
  if (
    !drLinear &&
    curParentDtKey !== null &&
    curParentDtKey !== undefined &&
    curRViewId === RightsViewKind.normalView
  )
    childrenDataTypes = drChildrenRepo[curRViewId][curParentDtKey].filter(
      (w) =>
        w.dtParentDataTypeId !== null && dataType.dtId === w.dtParentDataTypeId
    );
  return childrenDataTypes;
}

export function funAddOneRightAndChildren(
  state: IRightsState,
  dataType: DataTypeModel,
  oneRight: RightsChangeModel,
  curParentDtKey: string | null | undefined,
  curRViewId: RightsViewKind | null
) {
  const childrenDataTypes = getChildrenDataTypes(
    dataType,
    state.drLinear,
    curParentDtKey,
    curRViewId,
    state.drChildrenRepo
  );

  childrenDataTypes.forEach((chdt) => {
    chdt.returnValues
      .filter((f) => {
        if (curRViewId === RightsViewKind.normalView)
          return f.parentId === oneRight.child?.dtId;
        return f.parentId === oneRight.parent?.dtId;
      })
      .forEach((item) => {
        if (oneRight.parent === null) return;

        if (oneRight.child === null) return;

        const nextOneRight = {} as RightsChangeModel;
        if (curRViewId === RightsViewKind.normalView) {
          nextOneRight.parent = {
            dtId: oneRight.parent.dtId,
            dKey: oneRight.parent.dKey,
          } as TypeDataModel;
          nextOneRight.child = {
            dtId: chdt.dtId,
            dKey: item.key,
          } as TypeDataModel;
        } else {
          nextOneRight.parent = {
            dtId: chdt.dtId,
            dKey: item.key,
          } as TypeDataModel;
          nextOneRight.child = {
            dtId: oneRight.child.dtId,
            dKey: oneRight.child.dKey,
          };
        }
        nextOneRight.checked = oneRight.checked;
        funAddOneRightAndChildren(
          state,
          chdt,
          nextOneRight,
          curParentDtKey,
          curRViewId
        );
      });
  });
}
