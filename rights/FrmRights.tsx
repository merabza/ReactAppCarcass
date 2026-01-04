//FrmRights.tsx

import { useEffect, useState, useCallback, type FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Col, Row } from "react-bootstrap";
import { Link, useLocation, useParams } from "react-router-dom";
import Loading from "../common/Loading";
import "./FrmRights.css";
import { useRightsForman, useSaveDataRightChanges } from "./RightsFormHooks";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSelectedChildDataType, setSelectedChildKey } from "../redux/slices/rightsSlice";
import WrapText from "./WrapText";
import { RightsViewKind, RightsViewKindName } from "../redux/types/rightsTypes";
import { useAlert } from "../hooks/useAlert";
import { EAlertKind } from "../redux/slices/alertSlice";
import AlertMessages from "../common/AlertMessages";
import FrmRightsChildren from "./FrmRightsChildren";

const FrmRights: FC = () => {
    const [curRView, setCurRView] = useState<string | null>(null);
    const [curRViewId, setCurRViewId] = useState<RightsViewKind | null>(null);
    const [curChildViewKey, setCurChildViewKey] = useState<string | null>(null);
    const [curChildChecksKey, setCurChildChecksKey] = useState<string | null>(null);
    const [curParentDtTable, setCurParentDtTable] = useState<string | null | undefined>(null);
    const [curKey, setCurKey] = useState<string | null | undefined>(null);
    const [wasSaving, setWasSaving] = useState(false);

    const { rView, dtTable, key } = useParams<string>();
    const menLinkKey = useLocation().pathname.split("/")[1];
    const dispatch = useAppDispatch();

    const flatMenu = useAppSelector((state) => state.navMenuState.flatMenu);
    const [drWorkingOnSave] = useSaveDataRightChanges();

    const { drParentsRepo, drChildrenRepo, drChecksRepo, drWithCodes } = useAppSelector(
        (state) => state.rightsState
    );

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

        const rViewKey = rView ? rView : RightsViewKindName[RightsViewKind.normalView];

        let rViewId = RightsViewKind.normalView;

        if (RightsViewKindName[RightsViewKind.reverseView] === rViewKey)
            rViewId = RightsViewKind.reverseView;

        // console.log("FrmRights useEffect rViewKey=", rViewKey);
        // console.log("FrmRights useEffect rViewId=", rViewId);

        const childViewKey = rViewKey + (dtTable ? dtTable : "");
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

        if (curParentDtTable !== dtTable) {
            setCurParentDtTable(dtTable);
        }

        if (curKey !== key) {
            setCurKey(key);
            dispatch(setSelectedChildKey(null));
            dispatch(setSelectedChildDataType(null));
        }

        // console.log("FrmRights useEffect sameKeiesChanged=", sameKeiesChanged);
        // console.log("FrmRights useEffect curRViewId=", curRViewId);
        // console.log("FrmRights useEffect curParentDtTable=", curParentDtTable);
        // console.log("FrmRights useEffect drChildrenRepo=", drChildrenRepo);
        // console.log("FrmRights useEffect drChildrenRepo=", drChecksRepo);
        // console.log("FrmRights useEffect !!drChildrenRepo=", !!drChecksRepo);

        if (sameKeiesChanged) {
            // console.log(
            //   "FrmRights useEffect loadChildsTreeDataAndChecks parames=",
            //   rViewId,
            //   dtTable,
            //   key
            // );
            loadChildsTreeDataAndChecks(rViewId, dtTable, key, false);
        } else if (
            (curRViewId || curRViewId === 0) &&
            curParentDtTable &&
            (!drChecksRepo[curRViewId] || !drChecksRepo[curRViewId][curParentDtTable])
        ) {
            // console.log(
            //   "FrmRights useEffect loadChildsTreeDataAndChecks 2 parames=",
            //   rViewId,
            //   dtTable,
            //   key
            // );
            loadChildsTreeDataAndChecks(rViewId, dtTable, key, false);
        }
    }, [
        isMenuLoading,
        flatMenu,
        rView,
        dtTable,
        key,
        curChildChecksKey,
        curChildViewKey,
        curKey,
        curParentDtTable,
        curRView,
        drWorkingOnSave,
        wasSaving,
        curRViewId,
        drChecksRepo,
        drChildrenRepo,
    ]);

    //   console.log("FrmRights expandedState=", expandedState);
    // console.log(
    //   "FrmRights { drParentsLoading, curRView, curRViewId, curParentDtTable, drParentsRepo, drChildrenRepo, changedRights }=",
    //   {
    //     drParentsLoading,
    //     curRView,
    //     curRViewId,
    //     curParentDtTable,
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

    function getExpByKey(dtTable: string): boolean {
        const stateExp = parExp[dtTable];
        let exp = stateExp;
        if (dtTable === curParentDtTable && stateExp !== true && stateExp !== false) exp = true;
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

                                const exp = getExpByKey(item.dtTable);
                                return (
                                    <li
                                        key={item.dtId}
                                        onClick={() => {
                                            dispatch(setSelectedChildKey(null));
                                            dispatch(setSelectedChildDataType(null));
                                        }}
                                    >
                                        <span
                                            onClick={() => {
                                                const expanded = !getExpByKey(item.dtTable);
                                                turnExpanded(true, item.dtTable, expanded);
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={exp ? "minus-square" : "plus-square"}
                                            />{" "}
                                            <WrapText
                                                text={`${drWithCodes ? `${item.dtTable}-` : ""}${
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
                                                                dispatch(setSelectedChildKey(null));
                                                                dispatch(
                                                                    setSelectedChildDataType(null)
                                                                );
                                                            }}
                                                        >
                                                            <Link
                                                                className={
                                                                    itm.key === curKey
                                                                        ? "backLigth"
                                                                        : ""
                                                                }
                                                                to={`/Rights/${curRView}/${item.dtTable}/${itm.key}`}
                                                            >
                                                                <WrapText
                                                                    text={`${
                                                                        drWithCodes
                                                                            ? `${itm.key}-`
                                                                            : ""
                                                                    }${itm.name}`}
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
                <Col sm="5">
                    <FrmRightsChildren
                        drChildsLoading={drChildsLoading}
                        drChecksLoading={drChecksLoading}
                        curRViewId={curRViewId}
                        curParentDtTable={curParentDtTable}
                        curRView={curRView}
                        chiExp={chiExp}
                        curKey={curKey}
                        turnExpanded={turnExpanded}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default FrmRights;
