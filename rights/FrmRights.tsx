//FrmRights.tsx

import React, { useEffect, useState, useCallback, FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Form, Col, Row } from "react-bootstrap";
import { Link, useLocation, useParams } from "react-router-dom";
import Loading from "../common/Loading";
import CybCheckBox from "./CybCheckBox";
import WaitPage from "../common/WaitPage";
import "./FrmRights.css";
import { useRightsForman, useSaveDataRightChanges } from "./RightsFormHooks";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import {
  addRight,
  setSelectedChildDataType,
} from "../redux/slices/rightsSlice";
import { GetEnumFromString } from "../common/myFunctions";
import WrapText from "./WrapText";
import { createOneRight, getChildrenDataTypes } from "./RightFormFunctions";
import {
  DataTypeModel,
  RightsChangeModel,
  RightsViewKind,
} from "../redux/types/rightsTypes";
import { useAlert } from "../hooks/useAlert";
import { EAlertKind } from "../redux/slices/alertSlice";
import AlertMessages from "../common/AlertMessages";

const FrmRights: FC = () => {
  const [curRView, setCurRView] = useState<string | null>(null);
  const [curRViewId, setCurRViewId] = useState<RightsViewKind | null>(null);
  const [curChildViewKey, setCurChildViewKey] = useState<string | null>(null);
  const [curChildChecksKey, setCurChildChecksKey] = useState<string | null>(
    null
  );
  const [curParentDtKey, setCurParentDtKey] = useState<
    string | null | undefined
  >(null);
  const [curKey, setCurKey] = useState<string | null | undefined>(null);
  const [wasSaving, setWasSaving] = useState(false);
  const [selectedChildKey, setSelectedChildKey] = useState<string | null>(null);

  const { rView, dtKey, key } = useParams<string>();
  const menLinkKey = useLocation().pathname.split("/")[1];
  const dispatch = useAppDispatch();

  const flatMenu = useAppSelector((state) => state.navMenuState.flatMenu);
  const [drWorkingOnSave] = useSaveDataRightChanges();

  const {
    drParentsRepo,
    drChildrenRepo,
    drChecksRepo,
    changedRights,
    drWithCodes,
    drLinear,
  } = useAppSelector((state) => state.rightsState);

  const { isMenuLoading } = useAppSelector((state) => state.navMenuState);

  const [
    drChildsLoading,
    drChecksLoading,
    drParentsLoading,
    parExp,
    chiExp,
    turnExpanded,
    loadChildsTreeDataAndChecks,
  ] = useRightsForman();

  const isValidPage = useCallback(() => {
    if (!flatMenu) {
      return false;
    }
    return flatMenu.some((f) => f.menLinkKey === menLinkKey);
  }, [flatMenu, menLinkKey]);

  useEffect(() => {
    if (!isValidPage()) {
      // console.log("FrmRights useEffect page is not Valid");
      return;
    }

    const rViewKey = rView ? rView : RightsViewKind[RightsViewKind.normalView];
    const rViewId = GetEnumFromString(
      RightsViewKind,
      rViewKey
    ) as RightsViewKind;

    // console.log("FrmRights useEffect rViewKey=", rViewKey);
    // console.log("FrmRights useEffect rViewId=", rViewId);

    const childViewKey = rViewKey + (dtKey ? dtKey : "");
    const childChecksKey = childViewKey + (key ? key : "");

    let sameKeiesChanged = false;
    if (curRView !== rViewKey) {
      setCurRView(rViewKey);
      setCurRViewId(rViewId);
      sameKeiesChanged = true;
    }
    if (curChildViewKey !== childViewKey) {
      setCurChildViewKey(childViewKey);
      sameKeiesChanged = true;
    }

    let afterSave = false;
    if (wasSaving !== drWorkingOnSave) {
      setWasSaving(drWorkingOnSave);
      if (!drWorkingOnSave) {
        sameKeiesChanged = true;
        afterSave = true;
      }
    }

    if (curChildChecksKey !== childChecksKey || afterSave) {
      setCurChildChecksKey(childChecksKey);
      sameKeiesChanged = true;
    }

    if (curParentDtKey !== dtKey) {
      setCurParentDtKey(dtKey);
    }

    if (curKey !== key) {
      setCurKey(key);
      setSelectedChildKey(null);
      dispatch(setSelectedChildDataType(null));
    }

    // console.log("FrmRights useEffect sameKeiesChanged=", sameKeiesChanged);
    // console.log("FrmRights useEffect curRViewId=", curRViewId);
    // console.log("FrmRights useEffect curParentDtKey=", curParentDtKey);
    // console.log("FrmRights useEffect drChildrenRepo=", drChildrenRepo);
    // console.log("FrmRights useEffect drChildrenRepo=", drChecksRepo);
    // console.log("FrmRights useEffect !!drChildrenRepo=", !!drChecksRepo);

    if (sameKeiesChanged) {
      // console.log(
      //   "FrmRights useEffect loadChildsTreeDataAndChecks parames=",
      //   rViewId,
      //   dtKey,
      //   key
      // );
      loadChildsTreeDataAndChecks(rViewId, dtKey, key, false);
    } else if (
      (curRViewId || curRViewId === 0) &&
      curParentDtKey &&
      (!drChecksRepo[curRViewId] || !drChecksRepo[curRViewId][curParentDtKey])
    ) {
      // console.log(
      //   "FrmRights useEffect loadChildsTreeDataAndChecks 2 parames=",
      //   rViewId,
      //   dtKey,
      //   key
      // );
      loadChildsTreeDataAndChecks(rViewId, dtKey, key, false);
    }
  }, [
    isMenuLoading,
    flatMenu,
    rView,
    dtKey,
    key,
    curChildChecksKey,
    curChildViewKey,
    curKey,
    curParentDtKey,
    curRView,
    drWorkingOnSave,
    wasSaving,
    curRViewId,
    drChecksRepo,
    drChildrenRepo,
  ]);

  //   console.log("FrmRights expandedState=", expandedState);
  // console.log(
  //   "FrmRights { drParentsLoading, curRView, curRViewId, curParentDtKey, drParentsRepo, drChildrenRepo, changedRights }=",
  //   {
  //     drParentsLoading,
  //     curRView,
  //     curRViewId,
  //     curParentDtKey,
  //     drParentsRepo,
  //     drChildrenRepo,
  //     changedRights,
  //   }
  // );

  const [ApiLoadHaveErrors] = useAlert(EAlertKind.ApiLoad);

  if (ApiLoadHaveErrors)
    return (
      <div>
        <h5>ჩატვირთვის პრობლემა</h5>
        <AlertMessages alertKind={EAlertKind.ApiLoad} />
      </div>
    );

  if (!curRView || !drParentsRepo || !flatMenu) {
    if (drParentsLoading || isMenuLoading) {
      return <Loading />;
    }
  }

  if (!isValidPage()) {
    return (
      <div>
        <h5>ინფორმაციის ჩატვირთვა ვერ მოხერხდა</h5>
      </div>
    );
  }

  // console.log("drParentsRepo[curRViewId]=",drParentsRepo[curRViewId]);

  if ((curRViewId || curRViewId === 0) && !drParentsRepo[curRViewId]) {
    return (
      <div>
        <h5>უფლებების ჩატვირთვა ვერ მოხერხდა</h5>
      </div>
    );
  }

  function getTopParentDataType(dataType: DataTypeModel): DataTypeModel {
    const retDataType: DataTypeModel = dataType;
    if (
      !drLinear &&
      curParentDtKey !== null &&
      curParentDtKey !== undefined &&
      curRViewId === RightsViewKind.normalView
    ) {
      while (retDataType.dtParentDataTypeId) {
        const dtParentDataTypeId = retDataType.dtParentDataTypeId;
        const nextDataType = drChildrenRepo[curRViewId][curParentDtKey].find(
          (f) => f.dtId === dtParentDataTypeId
        );
        if (nextDataType === undefined) return retDataType;
      }
    }
    return retDataType;
  }

  function getNextSiblingExpKey(dataType: DataTypeModel, value: number) {
    const curIndex = dataType.returnValues.findIndex((fi) => fi.id === value);
    if (curIndex < dataType.returnValues.length - 1)
      return dataType.dtKey + dataType.returnValues[curIndex + 1].id.toString();
    return null;
  }

  function addOneRightAndChildren(
    dataType: DataTypeModel,
    oneRight: RightsChangeModel
  ) {
    dispatch(
      addRight({ dtId: dataType.dtId, oneRight, curParentDtKey, curRViewId })
    );
  }

  function getDataList(
    dataType: DataTypeModel,
    parentKey: string,
    parentValue: number | null
  ) {
    //console.log("FrmRights getDataList {drChildrenRepo, dataType, drLinear, curRView, curParentDtKey}=", { drChildrenRepo, dataType, drLinear, curRView, curParentDtKey });
    const childrenDataTypes = getChildrenDataTypes(
      dataType.dtId,
      drLinear,
      curParentDtKey,
      curRViewId,
      drChildrenRepo
    );
    //console.log("FrmRights getDataList childrenDataTypes=", childrenDataTypes);

    return (
      <ul
        key={parentKey}
        className={
          "tree list-unstyled collapse" + (chiExp[parentKey] ? " show" : "")
        }
      >
        {(!dataType.returnValues || dataType.returnValues.length === 0) && (
          <span>დეტალების ჩატვირთვა ვერ მოხერდა</span>
        )}
        {dataType.returnValues &&
          dataType.returnValues.length > 0 &&
          dataType.returnValues
            .filter((f) => parentValue === null || f.parentId === parentValue)
            .slice()
            .sort((a, b) =>
              (a.name ? a.name : "").localeCompare(b.name ? b.name : "")
            )
            .map((itm) => {
              // console.log(
              //   "FrmRights getDataList dataType.returnValues.map, itm=",
              //   itm
              // );
              // console.log(
              //   "FrmRights getDataList dataType.returnValues.map, ind=",
              //   ind
              // );

              const expKey = dataType.dtKey + itm.id.toString();

              let childrenCount = 0;
              childrenDataTypes.forEach((fe) => {
                childrenCount += fe.returnValues.filter(
                  (f) => f.parentId === itm.id
                ).length;
              });

              const oneRight = createOneRight(
                dataType.dtId,
                itm.key,
                curRViewId,
                curKey,
                drParentsRepo,
                curParentDtKey
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
                (curRViewId || curRViewId === 0) &&
                curParentDtKey !== null &&
                curParentDtKey !== undefined &&
                curKey !== null &&
                curKey !== undefined
              ) {
                // console.log(
                //   "getDataList drChecksRepo[curRViewId][curParentDtKey][curKey]=",
                //   drChecksRepo[curRViewId][curParentDtKey][curKey]
                // );
                // console.log(
                //   "getDataList Object.keys(drChecksRepo[curRViewId][curParentDtKey][curKey]).length=",
                //   Object.keys(drChecksRepo[curRViewId][curParentDtKey][curKey])
                //     .length
                // );
                checked = !findedRight
                  ? drChecksRepo[curRViewId][curParentDtKey][curKey] &&
                    Object.keys(
                      drChecksRepo[curRViewId][curParentDtKey][curKey]
                    ).length !== 0 &&
                    drChecksRepo[curRViewId][curParentDtKey][curKey].find(
                      (drf) =>
                        drf.dtId === dataType.dtId && drf.dKey === itm.key
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
                      labelText={`${drWithCodes ? `${itm.key}-` : ""}${
                        itm.name
                      }`}
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
                            setSelectedChildKey(nextExpKey);
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
                        setSelectedChildKey(expKey);
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

                    return getDataList(chdt, expKey, itm.id);
                  })}
                </li>
              );
            })}
      </ul>
    );
  }

  function getChildsRender() {
    if (drChildsLoading || drChecksLoading) return <WaitPage />;

    if (!curRViewId && curRViewId !== 0) {
      return (
        <div>
          <h5>ხედი არ არის არჩეული.</h5>
        </div>
      );
    }

    // console.log("FtmRights getChildsRender ", {
    //   curParentDtKey,
    //   curRViewId,
    //   drChildrenRepo,
    //   drChecksRepo,
    // });

    if (
      curParentDtKey === null ||
      curParentDtKey === undefined ||
      !drChildrenRepo[curRViewId] ||
      !drChildrenRepo[curRViewId][curParentDtKey] ||
      !drChecksRepo[curRViewId] ||
      !drChecksRepo[curRViewId][curParentDtKey]
    ) {
      return (
        <div>
          <h5>აირჩიეთ უფლების მშობელი</h5>
        </div>
      );
    }

    const zeroLevelDataTypes = drChildrenRepo[curRViewId][
      curParentDtKey
    ].filter(
      (w) =>
        drLinear ||
        curRView === "reverseView" ||
        w.dtParentDataTypeId === null ||
        w.dtId === w.dtParentDataTypeId
    );

    return (
      <Form>
        <div id="data-rights-tree" className="editor-scroll">
          <ul className="list-unstyled">
            {zeroLevelDataTypes.map((item) => {
              // console.log("FrmRights zeroLevelDataTypes.map, item=", item);
              // console.log("FrmRights zeroLevelDataTypes.map, index=", index);
              return (
                <li key={item.dtId}>
                  <span
                    onClick={() => {
                      const expanded = chiExp[item.dtKey] ? false : true;
                      turnExpanded(false, item.dtKey, expanded);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={chiExp[item.dtKey] ? "minus-square" : "plus-square"}
                    />
                  </span>
                  <span
                    className={
                      item.dtKey === selectedChildKey ? "backLigth" : ""
                    }
                    onClick={() => {
                      setSelectedChildKey(item.dtKey);
                      dispatch(setSelectedChildDataType(item));
                    }}
                  >
                    {" "}
                    {drWithCodes ? `${item.dtKey}-` : ""}
                    {item.dtName}
                  </span>

                  {getDataList(item, item.dtKey, null)}
                </li>
              );
            })}
          </ul>
        </div>
      </Form>
    );
  }

  function getExpByKey(dtKey: string): boolean {
    const stateExp = parExp[dtKey];
    let exp = stateExp;
    if (dtKey === curParentDtKey && stateExp !== true && stateExp !== false)
      exp = true;
    return exp;
  }

  if (!curRViewId && curRViewId !== 0) {
    return (
      <div>
        <h5>ხედი არ არის არჩეული.</h5>
      </div>
    );
  }

  // console.log("FrmRights before render return drParentsRepo=", drParentsRepo);
  return (
    <div>
      <Row className="editor-row">
        <Col sm="5" className="editor-column">
          <div id="data-rights-tree" className="editor-scroll">
            <ul className="list-unstyled">
              {drParentsRepo[curRViewId].map((item) => {
                // console.log(
                //   "FrmRights drParentsRepo[curRViewId].map, item=",
                //   item
                // );
                // console.log(
                //   "FrmRights drParentsRepo[curRViewId].map, index=",
                //   index
                // );

                const exp = getExpByKey(item.dtKey);
                return (
                  <li
                    key={item.dtId}
                    onClick={() => {
                      setSelectedChildKey(null);
                      dispatch(setSelectedChildDataType(null));
                    }}
                  >
                    <span
                      onClick={() => {
                        const expanded = !getExpByKey(item.dtKey);
                        turnExpanded(true, item.dtKey, expanded);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={exp ? "minus-square" : "plus-square"}
                      />{" "}
                      <WrapText
                        text={`${drWithCodes ? `${item.dtKey}-` : ""}${
                          item.dtName
                        }`}
                      />
                    </span>
                    <ul
                      className={
                        "tree list-unstyled collapse" + (exp ? " show" : "")
                      }
                    >
                      {item.returnValues
                        .slice()
                        .sort((a, b) =>
                          (a.name ? a.name : "").localeCompare(
                            b.name ? b.name : ""
                          )
                        )
                        .map((itm) => {
                          // console.log(
                          //   "FrmRights item.returnValues.map, itm=",
                          //   itm
                          // );
                          // console.log(
                          //   "FrmRights item.returnValues.map, ind=",
                          //   ind
                          // );

                          return (
                            <li
                              key={itm.id}
                              onClick={() => {
                                setSelectedChildKey(null);
                                dispatch(setSelectedChildDataType(null));
                              }}
                            >
                              <Link
                                className={
                                  itm.key === curKey ? "backLigth" : ""
                                }
                                to={`/Rights/${curRView}/${item.dtKey}/${itm.key}`}
                              >
                                <WrapText
                                  text={`${drWithCodes ? `${itm.key}-` : ""}${
                                    itm.name
                                  }`}
                                />
                              </Link>
                            </li>
                          );
                        })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        </Col>
        <Col sm="5">{getChildsRender()}</Col>
      </Row>
    </div>
  );
};

export default FrmRights;
