//RightsTopNavMenu.tsx

import { useState, useEffect, type FC } from "react";
import {
    Nav,
    Form,
    FormControl,
    Button,
    ToggleButton,
    Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import MessageBox from "../common/MessageBox";

import "./FrmRights.css";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { useOptimizeMutation } from "../redux/api/rightsApi";
import {
    setSearchText,
    switchLinear,
    switchWithCodes,
    turnAll,
} from "../redux/slices/rightsSlice";
import { useRightsForman, useSaveDataRightChanges } from "./RightsFormHooks";
import { RightsViewKind, RightsViewKindName } from "../redux/types/rightsTypes";

const RightsTopNavMenu: FC = () => {
    //console.log("RightsTopNavMenu props=", props);
    const { rView, dtKey, key } = useParams<string>();
    const menLinkKey = useLocation().pathname.split("/")[1];
    const flatMenu = useAppSelector((state) => state.navMenuState.flatMenu);
    const {
        drWorkingOnRefresh,
        searchText,
        changedRights,
        drWithCodes,
        drLinear,
        selectedChildDataType,
    } = useAppSelector((state) => state.rightsState);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // const {
    //     flatMenu,
    //     drWithCodes,
    //     drLinear,
    //     drWorkingOnSave,
    //     drWorkingOnRefresh,
    //     drWorkingOnOptimisation,
    //     changedRights,
    //     selectedChildDataType,
    //     searchText,
    // } = props;
    const [showRefreshConfirmMessage, setShowRefreshConfirmMessage] =
        useState(false);
    const [disableButtons, setDisableButtons] = useState(false);

    const [drWorkingOnSave, SaveDtaRightChanges] = useSaveDataRightChanges();

    const [OptimizeRights, { isLoading: drWorkingOnOptimisation }] =
        useOptimizeMutation();

    function isValidPage() {
        if (!flatMenu) {
            return false;
        }
        return flatMenu.some((f) => f.menLinkKey === menLinkKey);
    }

    const [, , , , , , loadChildsTreeDataAndChecks] = useRightsForman();

    useEffect(() => {
        setDisableButtons(
            drWorkingOnSave || drWorkingOnRefresh || drWorkingOnOptimisation
        );
    }, [
        drWorkingOnSave,
        drWorkingOnRefresh,
        drWorkingOnOptimisation,
        drLinear,
    ]);

    function RightsViewKindFromString(
        rViewKey: string | undefined
    ): RightsViewKind {
        let rViewId = RightsViewKind.normalView;
        if (RightsViewKindName[RightsViewKind.reverseView] === rViewKey)
            rViewId = RightsViewKind.reverseView;
        return rViewId;
    }

    function doRefresh() {
        //ToDo ეს ნაწილი გასაცოცხლებელია
        setDisableButtons(true);

        //გასაკეთებალია ისე, რომ FrmRights ფორმას ვაიძულოთ ჩატვირთვა
        //და აქედან არ გამოვიძახოთ ეს ჩატვირთვა
        //ეხლა განახლების ღილაკი არ მუშაობს
        loadChildsTreeDataAndChecks(
            RightsViewKindFromString(
                rView ? rView : RightsViewKind.normalView.toString()
            ),
            dtKey,
            key,
            true
        );
    }

    if (!isValidPage()) {
        return <div />;
    }

    // console.log("RightsTopNavMenu drLinear=", drLinear);

    return (
        <Nav>
            <Form>
                <FormControl
                    type="text"
                    placeholder="Search"
                    className="mr-sm-2"
                    value={searchText}
                    onChange={(e) => {
                        //console.log("RightsTopNavMenu FormControl onChange e.target.value=", e.target.value);
                        dispatch(setSearchText(e.target.value));
                    }}
                />
            </Form>
            <Nav className="mr-auto">
                <Button
                    className="btn-space"
                    disabled={disableButtons}
                    onClick={(e) => {
                        e.preventDefault();
                        if (changedRights.length > 0)
                            setShowRefreshConfirmMessage(true);
                        else doRefresh();
                    }}
                >
                    <FontAwesomeIcon icon="sync" /> განახლება
                    {drWorkingOnRefresh && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    )}
                </Button>

                <MessageBox
                    show={showRefreshConfirmMessage}
                    title="განახლება"
                    text={
                        "უკვე გაკეთებული ცვლილებები განახლებისას დაიკარგება, მაინც გსურთ განახლების გაკეთება?"
                    }
                    primaryButtonText="დიახ"
                    secondaryButtonText="არა"
                    onConfirmed={() => {
                        setShowRefreshConfirmMessage(false);
                        doRefresh();
                    }}
                    onClosed={() => setShowRefreshConfirmMessage(false)}
                />

                <Button
                    className="btn-space"
                    disabled={disableButtons || changedRights.length === 0}
                    onClick={() => {
                        SaveDtaRightChanges();
                    }}
                >
                    <FontAwesomeIcon icon="save" /> შენახვა
                    {drWorkingOnSave && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    )}
                </Button>
                <ToggleButton
                    id="barcodeToggleButton"
                    type="checkbox"
                    checked={drWithCodes ? true : false}
                    className="btn-space"
                    value="კოდებით"
                    onChange={(val) => {
                        dispatch(switchWithCodes(val.target.checked));
                    }}
                >
                    <FontAwesomeIcon icon="barcode" /> კოდებით
                </ToggleButton>
                <ToggleButton
                    id="viewToggleButton"
                    type="checkbox"
                    checked={rView === RightsViewKindName[RightsViewKind.reverseView] ? true : false}
                    className="btn-space"
                    value="რევერსი"
                    onChange={(val) => {
                        navigate(
                            `/Rights/${
                                val.target.checked
                                    ? RightsViewKindName[RightsViewKind.reverseView]
                                    : RightsViewKindName[RightsViewKind.normalView]
                            }`
                        );
                    }}
                >
                    <FontAwesomeIcon icon="arrows-alt-h" /> რევერსი
                </ToggleButton>
                <ToggleButton
                    id="linearToggleButton"
                    type="checkbox"
                    checked={drLinear ? true : false}
                    className="btn-space"
                    value="1"
                    onChange={(val) => {
                        // console.log(
                        //   "RightsTopNavMenu drLinear onChange val.target.checked=",
                        //   val.target.checked
                        // );
                        dispatch(switchLinear(val.target.checked));
                    }}
                >
                    <FontAwesomeIcon icon="long-arrow-alt-down" /> სწორხაზოვნად
                </ToggleButton>
                <Button
                    id="turnAllOnButton"
                    className="btn-space"
                    disabled={!selectedChildDataType}
                    onClick={() => {
                        //const { rView, dtKey, key } = props.match.params;
                        // console.log("turnAllOnButton onClick");
                        const curRViewId = (
                            rView !== undefined
                                ? RightsViewKindFromString(rView)
                                : RightsViewKind.normalView
                        ) as RightsViewKind;

                        // console.log("turnAllOnButton onClick", {
                        //   curRViewId,
                        //   selectedChildDataType,
                        //   dtKey,
                        // });

                        if (
                            selectedChildDataType !== null &&
                            dtKey !== undefined
                        ) {
                            // console.log("turnAllOnButton onClick turnAll");
                            dispatch(
                                turnAll({
                                    selectedChildDataType,
                                    curRViewId,
                                    curParentDtKey: dtKey,
                                    curKey: key,
                                    turnOn: true,
                                })
                            );
                        }
                    }}
                >
                    <FontAwesomeIcon icon="check-square" /> ყველა{" "}
                    {selectedChildDataType ? selectedChildDataType.dtName : ""}
                </Button>
                <Button
                    id="turnAllOffButton"
                    className="btn-space"
                    disabled={!selectedChildDataType}
                    onClick={() => {
                        // const { rView, dtKey, key } = props.match.params;

                        const curRViewId = (
                            rView !== undefined
                                ? RightsViewKindFromString(rView)
                                : RightsViewKind.normalView
                        ) as RightsViewKind;

                        if (
                            selectedChildDataType !== null &&
                            dtKey !== undefined
                        )
                            dispatch(
                                turnAll({
                                    selectedChildDataType,
                                    curRViewId,
                                    curParentDtKey: dtKey,
                                    curKey: key,
                                    turnOn: false,
                                })
                            );
                    }}
                >
                    <FontAwesomeIcon icon="square" /> არცერთი{" "}
                    {selectedChildDataType ? selectedChildDataType.dtName : ""}
                </Button>
                <Button
                    className="btn-space"
                    disabled={disableButtons || changedRights.length > 0}
                    onClick={(e) => {
                        e.preventDefault();
                        OptimizeRights();
                        //TODO აღსადგენია განახლება
                        // doRefresh();
                    }}
                >
                    <FontAwesomeIcon icon="microscope" /> ოპტიმიზაცია
                    {drWorkingOnOptimisation && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    )}
                </Button>
            </Nav>
        </Nav>
    );
};

export default RightsTopNavMenu;
