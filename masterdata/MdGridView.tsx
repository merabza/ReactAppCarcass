//MdGridView.tsx

import { FC, useEffect, useState } from "react";
import { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import { DeserializeGridModel, GridModel } from "../redux/types/gridTypes";
import { useMasterDataLists } from "./masterDataHooks/useMasterDataLists";
import { useAppSelector } from "../redux/hooks";
import { checkDataLoaded } from "../modules/CheckDataLoaded";
import { useScroller } from "../hooks/useScroller";
import { useAlert } from "../hooks/useAlert";
import { EAlertKind } from "../redux/slices/alertSlice";
import Loading from "../common/Loading";
import AlertMessages from "../common/AlertMessages";
import GridView from "../common/GridView";
import { IGridColumn } from "../common/GridViewTypes";
import { ConvertGridModelToGridColumns } from "./mdFunctions";

type MdGridViewProps = {
  tableName: string;
  recId: number;
};

const MdGridView: FC<MdGridViewProps> = (props) => {
  const { tableName, recId } = props;
  console.log("MdGridView props=", props);

  const [curDataType, setCurDataType] = useState<DataTypeFfModel | null>(null);
  const [curGridColumns, setCurGridColumns] = useState<IGridColumn[] | null>(
    null
  );
  const [loadListData] = useMasterDataLists();
  const masterData = useAppSelector((state) => state.masterDataState);
  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const { deletingKey, mdWorkingOnSave, mdWorkingOnLoadingListData } =
    masterData;

  useEffect(() => {
    // setCurDataType(null);
    // setCurGridRules(null);
    loadListData(tableName, tableName);

    if (mdWorkingOnLoadingListData || deletingKey || mdWorkingOnSave) {
      return;
    }

    const checkResult = checkDataLoaded(
      masterData,
      dataTypesState,
      tableName,
      tableName
    );

    console.log("MdGridView useEffect checkResult=", checkResult);

    if (checkResult) {
      const { dataType, gridData } = checkResult;
      const gridRules = gridData ? DeserializeGridModel(gridData) : null;
      setCurDataType(dataType);
      if (gridRules)
        setCurGridColumns(ConvertGridModelToGridColumns(gridRules, dataType));
    }
  }, [
    tableName,
    mdWorkingOnLoadingListData,
    tableName,
    deletingKey,
    mdWorkingOnSave,
    dataTypesState,
  ]);

  const [curscrollTo, backLigth] = useScroller<number>(recId);

  const [ApiLoadHaveErrors] = useAlert(EAlertKind.ApiLoad);

  if (mdWorkingOnLoadingListData) return <Loading />;

  const curMasterDataTable = masterData.mdRepo[tableName];

  if (ApiLoadHaveErrors)
    return (
      <div>
        <h5>ჩატვირთვის პრობლემა 1</h5>
        <AlertMessages alertKind={EAlertKind.ApiLoad} />
      </div>
    );

  console.log(
    "MdGridView CheckLoad {curGridColumns, curscrollTo, curDataType, curMasterDataTable}=",
    { curGridColumns, curscrollTo, curDataType, curMasterDataTable }
  );

  if (
    !curGridColumns ||
    curscrollTo === null ||
    !curDataType ||
    !curMasterDataTable
  ) {
    return (
      <div>
        <h5>ჩატვირთვის პრობლემა 2</h5>
      </div>
    );
  }

  // return <div>{tableName}</div>;

  //const gridColumns = [] as IGridColumn[];
  //const mdRows = [] as any[];
  const allRowsCount = 100;
  const loadingMdRows = false;

  return (
    <GridView
      showCountColumn
      columns={curGridColumns}
      rows={curMasterDataTable}
      allRowsCount={allRowsCount}
      onLoad={(offset, rowsCount) => {}}
      onFilterSortChange={(sortFields) => {}}
      loading={loadingMdRows}
    ></GridView>
  );
};

export default MdGridView;
