import { FC } from "react";
import WaitPage from "../common/WaitPage";
import { RightsViewKind, RightsViewKindName } from "../redux/types/rightsTypes";
import { Form } from "react-bootstrap";
import { fnTurnExpanded, IExpDictionary } from "./RightsFormHooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { setSelectedChildDataType, setSelectedChildKey } from "../redux/slices/rightsSlice";
import FrmRightsDataList from "./FrmRightsDataList";

//FrmRightsChildren.tsx
type FrmRightsChildrenProps = {
    drChildsLoading: boolean;
    drChecksLoading: boolean;
    curRViewId: RightsViewKind;
    curParentDtTable: string | null | undefined;
    curRView: string | null;
    chiExp: IExpDictionary;
    curKey: string | null | undefined;
    turnExpanded: fnTurnExpanded;
};

const FrmRightsChildren: FC<FrmRightsChildrenProps> = (props) => {
    const {
        drChildsLoading,
        drChecksLoading,
        curRViewId,
        curParentDtTable,
        curRView,
        chiExp,
        curKey,
        turnExpanded,
    } = props;

    const dispatch = useAppDispatch();

    const { drChildrenRepo, drChecksRepo, drWithCodes, drLinear, selectedChildKey } =
        useAppSelector((state) => state.rightsState);

    if (drChildsLoading || drChecksLoading) return <WaitPage />;

    if (!curRViewId && curRViewId !== 0) {
        return (
            <div>
                <h5>ხედი არ არის არჩეული.</h5>
            </div>
        );
    }

    // console.log("FrmRights getChildsRender ", {
    //     curParentDtTable,
    //     curRViewId,
    //     drChildrenRepo,
    //     drChecksRepo,
    // });

    if (
        curParentDtTable === null ||
        curParentDtTable === undefined ||
        !drChildrenRepo[curRViewId] ||
        !drChildrenRepo[curRViewId][curParentDtTable] ||
        !drChecksRepo[curRViewId] ||
        !drChecksRepo[curRViewId][curParentDtTable]
    ) {
        return (
            <div>
                <h5>აირჩიეთ უფლების მშობელი</h5>
            </div>
        );
    }

    const zeroLevelDataTypes = drChildrenRepo[curRViewId][curParentDtTable].filter(
        (w) =>
            drLinear ||
            curRView === RightsViewKindName[RightsViewKind.reverseView] ||
            w.dtParentDataTypeId === null ||
            w.dtId === w.dtParentDataTypeId
    );

    return (
        <Form>
            <div id="data-rights-tree" className="editor-scroll">
                <ul className="list-unstyled">
                    {zeroLevelDataTypes.map((item, index) => {
                        // console.log("FrmRights zeroLevelDataTypes.map, item=", item);
                        // console.log("FrmRights zeroLevelDataTypes.map, index=", index);
                        return (
                            <li key={item.dtId}>
                                <span
                                    onClick={() => {
                                        const expanded = chiExp[item.dtTable] ? false : true;
                                        turnExpanded(false, item.dtTable, expanded);
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={chiExp[item.dtTable] ? "minus-square" : "plus-square"}
                                    />
                                </span>
                                <span
                                    className={item.dtTable === selectedChildKey ? "backLigth" : ""}
                                    onClick={() => {
                                        dispatch(setSelectedChildKey(item.dtTable));
                                        dispatch(setSelectedChildDataType(item));
                                    }}
                                >
                                    {" "}
                                    {drWithCodes ? `${item.dtTable}-` : ""}
                                    {item.dtName}
                                </span>

                                {/* {getDataList(item, item.dtTable, null)} */}

                                <FrmRightsDataList
                                    dataType={item}
                                    parentKey={item.dtTable}
                                    parentValue={null}
                                    parentDtTable={curParentDtTable}
                                    rViewId={curRViewId}
                                    chiExp={chiExp}
                                    curKey={curKey}
                                    turnExpanded={turnExpanded}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </Form>
    );
};

export default FrmRightsChildren;
