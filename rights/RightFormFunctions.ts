//RightFormFunctions.ts

//RightFormFunctions.ts
import type { IRightsState } from "../redux/slices/rightsSlice";
import {
    type DataTypeModel,
    type IParentsRightsDictionary,
    type RightsChangeModel,
    RightsViewKind,
    RightsViewKindName,
    type TypeDataModel,
} from "../redux/types/rightsTypes";

export function RightsViewKindFromString(
    rViewKey: string | undefined
): RightsViewKind {
    let rViewId = RightsViewKind.normalView;
    if (RightsViewKindName[RightsViewKind.reverseView] === rViewKey)
        rViewId = RightsViewKind.reverseView;
    return rViewId;
}

export function createOneRight(
    dtId: number,
    dtKey: string | null,
    curRViewId: RightsViewKind | null,
    curKey: string | null | undefined,
    drParentsRepo: IParentsRightsDictionary,
    curParentDtKey: string | null | undefined
): RightsChangeModel {
    const oneRight = {} as RightsChangeModel;
    if (
        curRViewId === null ||
        dtKey === null ||
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
        oneRight.child = { dtId, dKey: dtKey };
    } else {
        oneRight.parent = { dtId, dKey: dtKey };
        oneRight.child = { dtId: dt.dtId, dKey: curKey };
    }
    return oneRight;
}

export function getChildrenDataTypes(
    dtId: number,
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
                w.dtParentDataTypeId !== null && dtId === w.dtParentDataTypeId
        );
    return childrenDataTypes;
}

export function funAddOneRightAndChildren(
    state: IRightsState,
    dtId: number,
    oneRight: RightsChangeModel,
    curParentDtKey: string | null | undefined,
    curRViewId: RightsViewKind | null
) {
    const childrenDataTypes = getChildrenDataTypes(
        dtId,
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
                    chdt.dtId,
                    nextOneRight,
                    curParentDtKey,
                    curRViewId
                );
            });
    });
}
