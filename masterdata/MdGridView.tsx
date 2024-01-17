//MdGridView.tsx

import { FC, useEffect } from "react";
import { useAppSelector } from "../redux/hooks";
import { useScroller } from "../hooks/useScroller";
import { useAlert } from "../hooks/useAlert";
import { EAlertKind } from "../redux/slices/alertSlice";
import Loading from "../common/Loading";
import AlertMessages from "../common/AlertMessages";
import {
  ConvertGridModelToGridColumns,
  CountRowDataDisplayValues,
} from "./mdFunctions";
import { useMasterDataLookupLists } from "./masterDataHooks/useMasterDataLookupLists";
import GridView from "../grid/GridView";
import { IRowsData } from "../grid/GridViewTypes";
import { useLazyGetTableRowsDataQuery } from "../redux/api/masterdataApi";

type MdGridViewProps = {
  tableName: string;
  recId?: number | undefined;
  readOnly?: boolean | undefined;
};

const MdGridView: FC<MdGridViewProps> = (props) => {
  const { tableName, recId, readOnly } = props;
  //console.log("MdGridView props=", props);

  const [loadListData, loadingListData] = useMasterDataLookupLists();
  const masterData = useAppSelector((state) => state.masterDataState);
  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const {
    deletingKey,
    mdWorkingOnSave,
    mdWorkingOnLoadingListData,
    tableRowData,
    mdWorkingOnLoadingTables,
    mdWorkingOnLoad,
    itemEditorTables,
    itemEditorLookupTables,
  } = masterData;

  // console.log("MdGridView mdWorkingOnLoadingTables=", mdWorkingOnLoadingTables);

  const [getTableRowsData, { isLoading: loadingTableRowsData }] =
    useLazyGetTableRowsDataQuery();

  const dataType = dataTypesState.dataTypesByTableNames[tableName];
  const gridRules = dataTypesState.gridRules[tableName];

  useEffect(() => {
    if (
      !dataType ||
      !gridRules ||
      !(tableName in itemEditorTables) ||
      !(tableName in itemEditorLookupTables)
    )
      loadListData(tableName);
  }, [
    tableName,
    dataType,
    gridRules,
    loadingListData,
    itemEditorTables,
    itemEditorLookupTables,
  ]);

  const [curscrollTo, backLigth] = useScroller<number | undefined>(recId);

  const [ApiLoadHaveErrors] = useAlert(EAlertKind.ApiLoad);

  if (
    mdWorkingOnLoadingListData ||
    mdWorkingOnLoad ||
    loadingTableRowsData ||
    Object.values(mdWorkingOnLoadingTables).some((s: boolean) => s)
  )
    return <Loading />;

  // console.log("MdGridView tableName=", tableName);
  // console.log("MdGridView masterData=", masterData);
  // console.log("MdGridView tableRowData=", tableRowData);
  // console.log("MdGridView serverSidePagination=", serverSidePagination);
  // console.log(
  //   "MdGridView masterData.mdLookupRepo[tableName]=",
  //   masterData.mdLookupRepo[tableName]
  // );

  let curMasterDataTable: any[] = [];
  let countedRowData: IRowsData | undefined = undefined;
  countedRowData = CountRowDataDisplayValues(
    tableRowData[tableName],
    gridRules,
    masterData
  );

  //console.log("MdGridView countedRowData=", countedRowData);

  const curGridColumns =
    gridRules && dataType
      ? ConvertGridModelToGridColumns(gridRules, dataType, masterData)
      : null;

  // console.log("MdGridView curMasterDataTable=", curMasterDataTable);

  if (ApiLoadHaveErrors)
    return (
      <div>
        <h5>ჩატვირთვის პრობლემა 1</h5>
        <AlertMessages alertKind={EAlertKind.ApiLoad} />
      </div>
    );

  // console.log("MdGridView CheckLoad ", {
  //   tableName,
  //   curGridColumns,
  //   curscrollTo,
  //   curDataType,
  //   curMasterDataTable,
  //   curRowsData,
  //   serverSidePagination,
  // });

  if (!curGridColumns || curscrollTo === null || !dataType || !curGridColumns) {
    return (
      <div>
        <h5>ჩატვირთვის პრობლემა 2</h5>
      </div>
    );
  }

  return (
    <GridView
      gridHeader={dataType.dtName}
      readOnly={readOnly}
      allowCreate={dataType.create}
      allowUpdate={dataType.update}
      allowDelete={dataType.delete}
      editorLink={`/mdItemEdit/${tableName}`}
      showCountColumn
      columns={curGridColumns}
      rowsData={countedRowData}
      loading={mdWorkingOnLoadingListData}
      onLoadRows={(offset, rowsCount, sortByFields, filterFields) => {
        // console.log(
        //   "MdGridView GridView onLoadRows {offset, rowsCount, sortByFields, filterFields}=",
        //   { offset, rowsCount, sortByFields, filterFields }
        // );
        // console.log("MdGridView GridView onLoadRows curDataType=", curDataType);

        getTableRowsData({
          tableName: tableName,
          filterSortRequest: {
            offset,
            rowsCount,
            filterFields,
            sortByFields,
          },
        });

        let RealOffset = offset;
        if (RealOffset >= curMasterDataTable.length)
          RealOffset =
            Math.floor((curMasterDataTable.length - rowsCount) / rowsCount) *
            rowsCount;

        if (RealOffset < 0) RealOffset = 0;
        let endElementNom = RealOffset + rowsCount;
        if (endElementNom > curMasterDataTable.length)
          endElementNom = curMasterDataTable.length;
      }}
    ></GridView>
  );
};

export default MdGridView;
