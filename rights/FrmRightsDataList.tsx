//FrmRightsDataList.tsx

import type { FC } from "react";
import type { DataTypeModel, RightsChangeModel } from "../redux/types/rightsTypes";
import { RightsViewKind } from "../redux/types/rightsTypes";
import { createOneRight, getChildrenDataTypes } from "./RightFormFunctions";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { fnTurnExpanded, IExpDictionary } from "./RightsFormHooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CybCheckBox from "./CybCheckBox";
import {
    addRight,
    setSelectedChildDataType,
    setSelectedChildKey,
} from "../redux/slices/rightsSlice";

type FrmRightsDataListProps = {
    dataType: DataTypeModel;
    parentKey: string;
    parentValue?: number | null;
    parentDtTable: string;
    rViewId: RightsViewKind;
    chiExp: IExpDictionary;
    curKey?: string | null | undefined;
    turnExpanded: fnTurnExpanded;
};

const FrmRightsDataList: FC<FrmRightsDataListProps> = (props) => {
    const {
        dataType,
        parentKey,
        parentValue,
        parentDtTable,
        rViewId,
        chiExp,
        curKey,
        turnExpanded,
    } = props;

    // console.log("FrmRights getDataList props=", props);

    const {
        drParentsRepo,
        drChildrenRepo,
        drChecksRepo,
        changedRights,
        drWithCodes,
        drLinear,
        selectedChildKey,
    } = useAppSelector((state) => state.rightsState);
    const dispatch = useAppDispatch();

    function addOneRightAndChildren(dataType: DataTypeModel, oneRight: RightsChangeModel) {
        dispatch(
            addRight({
                dtId: dataType.dtId,
                oneRight,
                curParentDtTable: parentDtTable,
                curRViewId: rViewId,
            })
        );
    }

    function getNextSiblingExpKey(dataType: DataTypeModel, value: number) {
        const curIndex = dataType.returnValues.findIndex((fi) => fi.id === value);
        if (curIndex < dataType.returnValues.length - 1)
            return dataType.dtTable + dataType.returnValues[curIndex + 1].id.toString();
        return null;
    }

    function getTopParentDataType(dataType: DataTypeModel): DataTypeModel {
        const retDataType: DataTypeModel = dataType;
        if (
            !drLinear &&
            parentDtTable !== null &&
            parentDtTable !== undefined &&
            rViewId === RightsViewKind.normalView
        ) {
            while (retDataType.dtParentDataTypeId) {
                const dtParentDataTypeId = retDataType.dtParentDataTypeId;
                const nextDataType = drChildrenRepo[rViewId][parentDtTable].find(
                    (f) => f.dtId === dtParentDataTypeId
                );
                if (nextDataType === undefined) return retDataType;
            }
        }
        return retDataType;
    }

    //console.log("FrmRights getDataList {drChildrenRepo, dataType, drLinear, curRView, curParentDtTable}=", { drChildrenRepo, dataType, drLinear, curRView, curParentDtTable });
    const childrenDataTypes = getChildrenDataTypes(
        dataType.dtId,
        drLinear,
        parentDtTable,
        rViewId,
        drChildrenRepo
    );
    //console.log("FrmRights getDataList childrenDataTypes=", childrenDataTypes);

    return (
        <ul
            key={parentKey}
            className={"tree list-unstyled collapse" + (chiExp[parentKey] ? " show" : "")}
        >
            {(!dataType.returnValues || dataType.returnValues.length === 0) && (
                <span>დეტალების ჩატვირთვა ვერ მოხერდა</span>
            )}
            {dataType.returnValues &&
                dataType.returnValues.length > 0 &&
                dataType.returnValues
                    .filter((f) => parentValue === null || f.parentId === parentValue)
                    .slice()
                    .sort((a, b) => (a.name ? a.name : "").localeCompare(b.name ? b.name : ""))
                    .map((itm) => {
                        // console.log(
                        //   "FrmRights getDataList dataType.returnValues.map, itm=",
                        //   itm
                        // );
                        // console.log(
                        //   "FrmRights getDataList dataType.returnValues.map, ind=",
                        //   ind
                        // );

                        const expKey = dataType.dtTable + itm.id.toString();

                        let childrenCount = 0;
                        childrenDataTypes.forEach((fe) => {
                            childrenCount += fe.returnValues.filter(
                                (f) => f.parentId === itm.id
                            ).length;
                        });

                        const oneRight = createOneRight(
                            dataType.dtId,
                            itm.key,
                            rViewId,
                            curKey,
                            drParentsRepo,
                            parentDtTable
                        );

                        const findedRight = changedRights.find(
                            (f) =>
                                f.parent !== null &&
                                oneRight.parent !== null &&
                                f.child !== null &&
                                oneRight.child !== null &&
                                f.parent.dtId === oneRight.parent.dtId &&
                                f.parent.dKey === oneRight.parent.dKey &&
                                f.child.dtId === oneRight.child.dtId &&
                                f.child.dKey === oneRight.child.dKey
                        );

                        let checked = false;
                        if (findedRight) checked = findedRight.checked;

                        // console.log(
                        //   "FrmRights getDataList {oneRight, findedRight, checked}=",
                        //   { oneRight, findedRight, checked }
                        // );

                        if (
                            (rViewId || rViewId === 0) &&
                            parentDtTable !== null &&
                            parentDtTable !== undefined &&
                            curKey !== null &&
                            curKey !== undefined
                        ) {
                            // console.log(
                            //   "getDataList drChecksRepo[rViewId][curParentDtTable][curKey]=",
                            //   drChecksRepo[rViewId][curParentDtTable][curKey]
                            // );
                            // console.log(
                            //   "getDataList Object.keys(drChecksRepo[rViewId][curParentDtTable][curKey]).length=",
                            //   Object.keys(drChecksRepo[rViewId][curParentDtTable][curKey])
                            //     .length
                            // );
                            checked = !findedRight
                                ? drChecksRepo[rViewId][parentDtTable][curKey] &&
                                  Object.keys(drChecksRepo[rViewId][parentDtTable][curKey])
                                      .length !== 0 &&
                                  drChecksRepo[rViewId][parentDtTable][curKey].find(
                                      (drf) => drf.dtId === dataType.dtId && drf.dKey === itm.key
                                  )
                                    ? true
                                    : false
                                : findedRight.checked;
                            // console.log("getDataList checked=", checked);
                        }

                        return (
                            <li key={expKey}>
                                <span>
                                    {childrenCount > 0 && (
                                        <FontAwesomeIcon
                                            icon={chiExp[expKey] ? "minus-square" : "plus-square"}
                                            onClick={() => {
                                                const expanded = chiExp[expKey] ? false : true;
                                                turnExpanded(false, expKey, expanded);
                                            }}
                                        />
                                    )}
                                    <span
                                        className={
                                            childrenCount > 0 ? "padleftwithplus" : "padleft"
                                        }
                                    />

                                    <CybCheckBox
                                        checked={checked}
                                        labelSelected={expKey === selectedChildKey}
                                        labelText={`${drWithCodes ? `${itm.key}-` : ""}${itm.name}`}
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>,
                                            usedSpace
                                        ) => {
                                            //console.log("FrmRights getDataList CybCheckBox onChange e.target.checked=", e.target.checked);
                                            oneRight.checked = e.target.checked;
                                            addOneRightAndChildren(dataType, oneRight);
                                            if (usedSpace) {
                                                const nextExpKey = getNextSiblingExpKey(
                                                    dataType,
                                                    itm.id
                                                );
                                                if (nextExpKey) {
                                                    dispatch(setSelectedChildKey(nextExpKey));
                                                    dispatch(
                                                        setSelectedChildDataType(
                                                            getTopParentDataType(dataType)
                                                        )
                                                    );
                                                }
                                            }
                                        }}
                                        onLabelClick={() => {
                                            //console.log("FrmRights getDataList CybCheckBox onLabelClick");
                                            dispatch(setSelectedChildKey(expKey));
                                            dispatch(
                                                setSelectedChildDataType(
                                                    getTopParentDataType(dataType)
                                                )
                                            );
                                        }}
                                    />
                                </span>

                                {childrenDataTypes.map((chdt) => {
                                    // console.log("FrmRights childrenDataTypes.map, chdt=", chdt);
                                    // console.log("FrmRights childrenDataTypes.map, ind=", ind);

                                    // return getDataList(chdt, expKey, itm.id);

                                    return (
                                        <FrmRightsDataList
                                            dataType={chdt}
                                            parentKey={expKey}
                                            parentValue={itm.id}
                                            parentDtTable={parentDtTable}
                                            rViewId={rViewId}
                                            chiExp={chiExp}
                                            curKey={curKey}
                                            turnExpanded={turnExpanded}
                                        />
                                    );
                                })}
                            </li>
                        );
                    })}
        </ul>
    );
};

export default FrmRightsDataList;
