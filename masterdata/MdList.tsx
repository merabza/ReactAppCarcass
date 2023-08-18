//MdList.tsx

import { useEffect, useState, useCallback, FC } from "react";
import { checkDataLoaded } from "../modules/CheckDataLoaded";
import Loading from "../common/Loading";
import MdListView from "./MdListView";
import { NzInt } from "../common/myFunctions";
import { useLocation, useParams } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import { DeserializeGridModel, GridModel } from "../redux/types/gridTypes";
import { useMasterDataLists } from "./masterDataHooks/useMasterDataLists";
import { useAlert } from "../hooks/useAlert";
import { EAlertKind } from "../redux/slices/alertSlice";
import AlertMessages from "../common/AlertMessages";
import { useScroller } from "../hooks/useScroller";

const MdList: FC = () => {
  const [curTableName, setCurTableName] = useState<string | undefined>(
    undefined
  );
  const [curDataType, setCurDataType] = useState<DataTypeFfModel | null>(null);
  const [curGridRules, setCurGridRules] = useState<GridModel | null>(null);

  const { tableName, recName } = useParams<string>();
  // console.log("MdList 1 {tableName, recName}=", { tableName, recName });

  const menLinkKey = useLocation().pathname.split("/")[1];
  const recId = NzInt(recName);

  const { isMenuLoading, flatMenu } = useAppSelector(
    (state) => state.navMenuState
  );
  const masterData = useAppSelector((state) => state.masterDataState);
  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const { deletingKey, mdWorkingOnSave, mdWorkingOnLoadingListData } =
    masterData;

  const isValidPage = useCallback(() => {
    // console.log("MdList isValidPage 1 {flatMenu, menLinkKey, tableName}=", {
    //   flatMenu,
    //   menLinkKey,
    //   tableName,
    // });
    if (!flatMenu || !menLinkKey || !tableName) {
      return false;
    }
    return flatMenu.find(
      (f) => f.menLinkKey === menLinkKey && f.menValue === tableName
    );
  }, [flatMenu, tableName, menLinkKey]);

  const [loadListData] = useMasterDataLists();

  useEffect(() => {
    // const controller = new AbortController();
    // const signal = controller.signal;

    const menuItem = isValidPage();
    // console.log("MdList useEffect 1 menuItem=", menuItem);
    if (!menuItem) return;

    // console.log("MdList useEffect 2 tableName=", tableName);
    if (tableName === undefined) return;

    // console.log("MdList useEffect 3 {curTableName, tableName}=", {
    //   curTableName,
    //   tableName,
    // });
    if (curTableName !== tableName) {
      // console.log("MdList useEffect 4 curTableName !== tableName");
      setCurTableName(tableName);
      setCurDataType(null);
      setCurGridRules(null);
      loadListData(tableName, tableName);
      return;
    }

    // console.log(
    //   // "MdList useEffect 3 {mdWorkingOnLoadingListData, deletingKey, mdWorkingOnSave}=",
    //   { mdWorkingOnLoadingListData, deletingKey, mdWorkingOnSave }
    // );
    if (mdWorkingOnLoadingListData || deletingKey || mdWorkingOnSave) {
      return;
    }

    const checkResult = checkDataLoaded(
      masterData,
      dataTypesState,
      tableName,
      tableName
    );

    // console.log("MdList useEffect 5 checkResult=", checkResult);

    if (checkResult) {
      const { dataType, gridData } = checkResult;
      const gridRules = gridData ? DeserializeGridModel(gridData) : null;

      // console.log("MdItemEdit useEffect new dataType=", dataType);
      // console.log("MdItemEdit useEffect new gridData=", gridData);
      setCurDataType(dataType);
      // console.log("MdItemEdit useEffect new gridRules=", gridRules);
      setCurGridRules(gridRules);
    }
  }, [
    isMenuLoading,
    flatMenu,
    mdWorkingOnLoadingListData,
    tableName,
    curTableName,
    deletingKey,
    mdWorkingOnSave,
    dataTypesState,
  ]);

  const [curscrollTo, backLigth] = useScroller<number>(recId);

  // console.log("MdList before Loading {mdWorkingOnLoadingListData, isMenuLoading}=", {
  //   mdWorkingOnLoadingListData,
  //   isMenuLoading,
  // });

  // console.log(
  //   "MdList after Loading {curGridRules, curscrollTo, flatMenu, curDataType, curTableName, mdWorkingOnLoadingListData}=",
  //   {
  //     curGridRules,
  //     curscrollTo,
  //     flatMenu,
  //     curDataType,
  //     curTableName,
  //     mdWorkingOnLoadingListData,
  //   }
  // );

  // console.log("MdList after Loading curMasterDataTable=", curMasterDataTable);

  const [ApiLoadHaveErrors] = useAlert(EAlertKind.ApiLoad);

  if (mdWorkingOnLoadingListData || isMenuLoading) return <Loading />;

  const curMasterDataTable =
    curTableName === undefined ? undefined : masterData.mdRepo[curTableName];

  if (ApiLoadHaveErrors)
    return (
      <div>
        <h5>ჩატვირთვის პრობლემა</h5>
        <AlertMessages alertKind={EAlertKind.ApiLoad} />
      </div>
    );

  if (
    !curGridRules ||
    curscrollTo === null ||
    !flatMenu ||
    !curDataType ||
    !curMasterDataTable
  ) {
    return (
      <div>
        <h5>ჩატვირთვის პრობლემა</h5>
      </div>
    );
  }

  return (
    <MdListView
      dataType={curDataType}
      table={curMasterDataTable}
      gridColumns={curGridRules.cells}
      masterData={masterData}
      curscrollTo={curscrollTo}
      backLigth={backLigth}
    />
  );
};

export default MdList;
