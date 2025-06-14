//MdList.tsx

import { type FC, useCallback, useEffect, useState } from "react";
import MdGridView from "./MdGridView";
import { useLocation, useParams } from "react-router-dom";
import { NzInt } from "../common/myFunctions";
import { useAppSelector } from "../redux/hooks";
import { useAlert } from "../hooks/useAlert";
import { EAlertKind } from "../redux/slices/alertSlice";
import Loading from "../common/Loading";
import AlertMessages from "../common/AlertMessages";

const MdList: FC = () => {
    const [curTableName, setCurTableName] = useState<string | undefined>(
        undefined
    );

    const { tableName, recName } = useParams<string>();
    //console.log("MdList {tableName, recName}=", { tableName, recName });

    const menLinkKey = useLocation().pathname.split("/")[1];
    const recId = NzInt(recName);

    const { isMenuLoading, flatMenu } = useAppSelector(
        (state) => state.navMenuState
    );

    const isValidPage = useCallback(() => {
        if (!flatMenu || !menLinkKey || !tableName) {
            return false;
        }
        //return flatMenu.find((f) => f.menLinkKey === menLinkKey && f.menValue === tableName);
        return flatMenu.find(
            (f) => f.menLinkKey === "mdList" && f.menValue === tableName
        );
    }, [flatMenu, tableName, menLinkKey]);

    useEffect(() => {
        // console.log("MdList useEffect started");
        const menuItem = isValidPage();
        // console.log("MdList useEffect menuItem=", menuItem);
        if (!menuItem) return;

        // console.log("MdList useEffect tableName=", tableName);
        if (tableName === undefined) return;

        // console.log("MdList useEffect curTableName=", curTableName);
        if (curTableName !== tableName) {
            // console.log("MdList useEffect setCurTableName tableName=", tableName);
            setCurTableName(tableName);
            return;
        }
    }, [isMenuLoading, flatMenu, tableName, curTableName]);

    // const [curscrollTo, backLigth] = useScroller<number>(recId);

    const [ApiLoadHaveErrors] = useAlert(EAlertKind.ApiLoad);

    if (isMenuLoading) return <Loading />;

    if (ApiLoadHaveErrors)
        return (
            <div>
                <h5>ჩატვირთვის პრობლემა</h5>
                <AlertMessages alertKind={EAlertKind.ApiLoad} />
            </div>
        );

    if (!flatMenu) {
        return (
            <div>
                <h5>ჩატვირთვის პრობლემა</h5>
            </div>
        );
    }

    if (curTableName)
        return <MdGridView tableName={curTableName} recId={recId} />;

    return <div>ცხრილის სახელი მითითებული არ არის</div>;
};

export default MdList;
