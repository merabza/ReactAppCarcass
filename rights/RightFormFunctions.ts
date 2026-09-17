//RightFormFunctions.ts

import type { IRightsState } from "../redux/slices/rightsSlice";
import {
    type DataTypeModel,
    type IParentsRightsDictionary,
    type ReturnValueModel,
    type RightsChangeModel,
    RightsViewKind,
    RightsViewKindName,
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
    dtTable: string | null,
    curRViewId: RightsViewKind | null,
    curKey: string | null | undefined,
    drParentsRepo: IParentsRightsDictionary,
    curParentDtTable: string | null | undefined
): RightsChangeModel {
    const oneRight = {} as RightsChangeModel;
    if (
        curRViewId === null ||
        dtTable === null ||
        curKey === null ||
        curKey === undefined
    )
        return oneRight;
    const dt = drParentsRepo[curRViewId].find(
        (item) => item.dtTable === curParentDtTable
    );
    if (dt === undefined) return oneRight;
    if (curRViewId === RightsViewKind.normalView) {
        oneRight.parent = { dtId: dt.dtId, dKey: curKey };
        oneRight.child = { dtId, dKey: dtTable };
    } else {
        oneRight.parent = { dtId, dKey: dtTable };
        oneRight.child = { dtId: dt.dtId, dKey: curKey };
    }
    return oneRight;
}

export function getChildrenDataTypes(
    dtId: number,
    drLinear: boolean,
    curParentDtTable: string | null | undefined,
    curRViewId: RightsViewKind | null,
    drChildrenRepo: { [key: string]: DataTypeModel[] }[]
): DataTypeModel[] {
    let childrenDataTypes = [] as DataTypeModel[];
    if (
        !drLinear &&
        curParentDtTable !== null &&
        curParentDtTable !== undefined &&
        curRViewId === RightsViewKind.normalView
    )
        childrenDataTypes = drChildrenRepo[curRViewId][curParentDtTable].filter(
            (w) =>
                w.dtParentDataTypeId !== null && dtId === w.dtParentDataTypeId
        );
    return childrenDataTypes;
}

//უფლების ცვლილების კონტექსტი: ხედი, მშობელი ტიპის ცხრილი (მაგ. Roles) და მშობლის გასაღები (მაგ. Admin)
export interface IRightsCascadeContext {
    rViewId: RightsViewKind;
    parentDtTable: string;
    curKey: string;
}

function findChangedRightIndex(
    changedRights: RightsChangeModel[],
    oneRight: RightsChangeModel
): number {
    return changedRights.findIndex(
        (f) =>
            !!f.parent &&
            !!oneRight.parent &&
            !!f.child &&
            !!oneRight.child &&
            f.parent.dtId === oneRight.parent.dtId &&
            f.parent.dKey === oneRight.parent.dKey &&
            f.child.dtId === oneRight.child.dtId &&
            f.child.dKey === oneRight.child.dKey
    );
}

//ცვლილების ჩაწერა changedRights-ში: არსებულის განახლება ან ახლის დამატება
export function addChangedRight(state: IRightsState, oneRight: RightsChangeModel) {
    if (!oneRight.parent || !oneRight.child) return;
    const index = findChangedRightIndex(state.changedRights, oneRight);
    if (index === -1) state.changedRights.push(oneRight);
    else state.changedRights[index].checked = oneRight.checked;
}

//უფლების მიმდინარე მდგომარეობა: ჯერ შეუნახავი ცვლილებები, მერე სერვერიდან ჩატვირთული უფლებები
export function isRightChecked(
    state: IRightsState,
    ctx: IRightsCascadeContext,
    dtId: number,
    key: string | null
): boolean {
    const oneRight = createOneRight(
        dtId,
        key,
        ctx.rViewId,
        ctx.curKey,
        state.drParentsRepo,
        ctx.parentDtTable
    );
    if (!oneRight.parent || !oneRight.child) return false;
    const index = findChangedRightIndex(state.changedRights, oneRight);
    if (index !== -1) return state.changedRights[index].checked;
    const checks = state.drChecksRepo[ctx.rViewId]?.[ctx.parentDtTable]?.[ctx.curKey];
    return !!checks && checks.some((c) => c.dtId === dtId && c.dKey === key);
}

function setRight(
    state: IRightsState,
    ctx: IRightsCascadeContext,
    dtId: number,
    key: string | null,
    checked: boolean
) {
    if (isRightChecked(state, ctx, dtId, key) === checked) return;
    const oneRight = createOneRight(
        dtId,
        key,
        ctx.rViewId,
        ctx.curKey,
        state.drParentsRepo,
        ctx.parentDtTable
    );
    oneRight.checked = checked;
    addChangedRight(state, oneRight);
}

//მშობლის ჩართვა-გამორთვა ყველა შვილზე ვრცელდება, რეკურსიულად შვილების შვილებზეც
function cascadeDown(
    state: IRightsState,
    ctx: IRightsCascadeContext,
    dataType: DataTypeModel,
    row: ReturnValueModel,
    checked: boolean
) {
    getChildrenDataTypes(
        dataType.dtId,
        state.drLinear,
        ctx.parentDtTable,
        ctx.rViewId,
        state.drChildrenRepo
    ).forEach((childDataType) => {
        childDataType.returnValues
            .filter((childRow) => childRow.parentId === row.id)
            .forEach((childRow) => {
                setRight(state, ctx, childDataType.dtId, childRow.key, checked);
                cascadeDown(state, ctx, childDataType, childRow, checked);
            });
    });
}

//შვილის ჩართვა გამორთულ მშობელსაც რთავს; როცა მშობლის ყველა შვილი გამორთულია, მშობელიც ითიშება
function cascadeUp(
    state: IRightsState,
    ctx: IRightsCascadeContext,
    dataType: DataTypeModel,
    row: ReturnValueModel,
    checked: boolean
) {
    if (dataType.dtParentDataTypeId === null || row.parentId === null) return;
    const dataTypes = state.drChildrenRepo[ctx.rViewId]?.[ctx.parentDtTable];
    if (!dataTypes) return;
    const parentDataType = dataTypes.find((dt) => dt.dtId === dataType.dtParentDataTypeId);
    if (!parentDataType) return;
    const parentRow = parentDataType.returnValues.find((r) => r.id === row.parentId);
    if (!parentRow) return;

    const parentChecked = isRightChecked(state, ctx, parentDataType.dtId, parentRow.key);
    if (parentChecked === checked) return;

    if (!checked) {
        const anySiblingChecked = getChildrenDataTypes(
            parentDataType.dtId,
            state.drLinear,
            ctx.parentDtTable,
            ctx.rViewId,
            state.drChildrenRepo
        ).some((siblingDataType) =>
            siblingDataType.returnValues.some(
                (sibling) =>
                    sibling.parentId === parentRow.id &&
                    isRightChecked(state, ctx, siblingDataType.dtId, sibling.key)
            )
        );
        if (anySiblingChecked) return;
    }

    setRight(state, ctx, parentDataType.dtId, parentRow.key, checked);
    cascadeUp(state, ctx, parentDataType, parentRow, checked);
}

//ერთი უფლების შეცვლა კასკადით: ქვემოთ შვილებზე, ზემოთ მშობლებზე.
//კასკადი მხოლოდ ჩვეულებრივ (არა ხაზოვან) ხედშია, სადაც მშობელ-შვილის ხე ჩანს
export function changeRightWithCascade(
    state: IRightsState,
    ctx: IRightsCascadeContext,
    dataType: DataTypeModel,
    row: ReturnValueModel,
    checked: boolean
) {
    setRight(state, ctx, dataType.dtId, row.key, checked);
    if (state.drLinear || ctx.rViewId !== RightsViewKind.normalView) return;
    cascadeDown(state, ctx, dataType, row, checked);
    cascadeUp(state, ctx, dataType, row, checked);
}
