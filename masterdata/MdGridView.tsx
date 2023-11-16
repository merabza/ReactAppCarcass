//MdGridView.tsx

import { FC, useEffect, useState } from "react";
import { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import { DeserializeGridModel, GridModel } from "../redux/types/gridTypes";
import { useAppSelector } from "../redux/hooks";
import { checkDataLoaded } from "../modules/CheckDataLoaded";
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
import { IGridColumn, IRowsData } from "../grid/GridViewTypes";
import { useLazyGetTableRowsDataQuery } from "../redux/api/masterdataApi";

type MdGridViewProps = {
  tableName: string;
  recId?: number | undefined;
  readOnly?: boolean | undefined;
};

const MdGridView: FC<MdGridViewProps> = (props) => {
  const { tableName, recId, readOnly } = props;
  //console.log("MdGridView props=", props);

  const [curDataType, setCurDataType] = useState<DataTypeFfModel | null>(null);
  const [curGridColumns, setCurGridColumns] = useState<IGridColumn[] | null>(
    null
  );
  const [curGridRules, setCurGridRules] = useState<GridModel | null>(null);
  // const [curRowsData, setCurRowsData] = useState<IRowsData | undefined>(
  //   undefined
  // );

  const [loadListData] = useMasterDataLookupLists();
  const masterData = useAppSelector((state) => state.masterDataState);
  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const {
    deletingKey,
    mdWorkingOnSave,
    mdWorkingOnLoadingListData,
    tableRowData,
    mdWorkingOnLoadingTables,
    mdWorkingOnLoad,
  } = masterData;

  // console.log("MdGridView mdWorkingOnLoadingTables=", mdWorkingOnLoadingTables);

  const [getTableRowsData, { isLoading: loadingTableRowsData }] =
    useLazyGetTableRowsDataQuery();

  useEffect(() => {
    if (
      mdWorkingOnLoadingListData ||
      deletingKey ||
      mdWorkingOnSave ||
      mdWorkingOnLoad ||
      loadingTableRowsData ||
      Object.values(mdWorkingOnLoadingTables).some((s: boolean) => s)
    ) {
      return;
    }

    setCurDataType(null);
    // setCurRowsData(undefined);
    loadListData(tableName);

    const checkResult = checkDataLoaded(masterData, dataTypesState, tableName);

    // console.log("MdGridView useEffect 5 checkResult=", tableName, checkResult);

    if (checkResult) {
      const { dataType, gridData } = checkResult;
      const gridRules = gridData ? DeserializeGridModel(gridData) : null;

      // console.log("MdGridView useEffect new dataType=", dataType);
      // console.log("MdGridView useEffect new gridData=", gridData);
      setCurDataType(dataType);
      setCurGridRules(gridRules);
      // console.log("MdGridView useEffect new gridRules=", gridRules);
      // console.log("MdGridView useEffect new dataType=", dataType);
      if (gridRules)
        setCurGridColumns(ConvertGridModelToGridColumns(gridRules, dataType));
    }

    // const dataType = checkDataTypeLoaded(masterData, dataTypesState, tableName);
    // const gridData = checkGridLoaded(masterData, dataTypesState, tableName);

    // if (dataType) {
    //   setCurDataType(dataType);

    //   const gridRules = gridData ? DeserializeGridModel(gridData) : null;

    //   if (gridRules)
    //     setCurGridColumns(ConvertGridModelToGridColumns(gridRules, dataType));
    // }
  }, [
    tableName,
    mdWorkingOnLoadingListData,
    deletingKey,
    mdWorkingOnSave,
    dataTypesState,
    mdWorkingOnLoadingTables,
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
  // console.log("MdGridView serverSidePagination=", serverSidePagination);
  // console.log(
  //   "MdGridView masterData.mdLookupRepo[tableName]=",
  //   masterData.mdLookupRepo[tableName]
  // );

  let curMasterDataTable: any[] = [];
  let countedRowData: IRowsData | undefined = undefined;
  // if (serverSidePagination) {
  countedRowData = CountRowDataDisplayValues(
    tableRowData[tableName],
    curGridRules,
    masterData
  );
  // } else
  //   curMasterDataTable = CountDisplayValues(
  //     masterData.mdLookupRepo[tableName],
  //     curGridRules,
  //     masterData
  //   );

  // if ( serverSidePagination &&  !countedRowData || !serverSidePagination && !curMasterDataTable)
  //   return (
  //     <div>
  //       <h5>ჩატვირთვის პრობლემა 0</h5>
  //       <AlertMessages alertKind={EAlertKind.ApiLoad} />
  //     </div>
  //   );

  curGridColumns?.forEach((col) => {
    col.possibleValues = curMasterDataTable
      .map((row) => row[col.fieldName])
      .filter((item, pos, arr) => arr.indexOf(item) === pos); //distinct
  });

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

  if (
    !curGridColumns ||
    curscrollTo === null ||
    !curDataType
    // ||
    // (!serverSidePagination && !curMasterDataTable)
    //  ||
    // !curRowsData
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
  //const allRowsCount = 100;

  return (
    <GridView
      gridHeader={curDataType.dtName}
      readOnly={readOnly}
      allowCreate={curDataType.create}
      allowUpdate={curDataType.update}
      allowDelete={curDataType.delete}
      editorLink={`/mdItemEdit/${curDataType.dtTable}`}
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

        // const filteredMasterDataTable = curMasterDataTable.filter((row) => {
        //   let filterResult = true;
        //   filterFields.every((filterField) => {
        //     // const col = curGridColumns.find(
        //     //   (f) => f.fieldName === filterField.fieldName
        //     // );

        //     // switch (col?.typeName) {
        //     //   case "Integer":
        //     //     const intValue = parseInt(filterField.value);
        //     //     if (row[filterField.fieldName] !== intValue) {
        //     //       filterResult = false;
        //     //       return false;
        //     //     }
        //     //     return true;
        //     //   case "Boolean":
        //     //     const boolValue = filterField.value.toLowerCase() === "true";
        //     //     if (row[filterField.fieldName] !== boolValue) {
        //     //       filterResult = false;
        //     //       return false;
        //     //     }
        //     //     return true;

        //     //   case "Date":
        //     //     const dateValue = new Date(filterField.value);
        //     //     if (row[filterField.fieldName] !== dateValue) {
        //     //       filterResult = false;
        //     //       return false;
        //     //     }
        //     //     return true;
        //     // }

        //     // if ( filterField.value === null )
        //     // {
        //     //   if (row[filterField.fieldName] !== null && row[filterField.fieldName] !== "") {
        //     //     filterResult = false;
        //     //     return false;
        //     //   }
        //     //   return true;
        //     // }

        //     if (row[filterField.fieldName] !== filterField.value) {
        //       filterResult = false;
        //       return false;
        //     }
        //     return true;
        //   });
        //   return filterResult;
        // });

        // setCurRowsData({
        //   allRowsCount: filteredMasterDataTable.length,
        //   offset: RealOffset,
        //   rows: filteredMasterDataTable
        //     .slice()
        //     .sort((a, b) => {
        //       let compareResult = 0;
        //       sortByFields.every((f) => {
        //         if (a[f.fieldName] < b[f.fieldName]) {
        //           compareResult = f.ascending ? -1 : 1;
        //           return false;
        //         }
        //         if (a[f.fieldName] > b[f.fieldName]) {
        //           compareResult = f.ascending ? 1 : -1;
        //           return false;
        //         }
        //         return true;
        //       });
        //       return compareResult;
        //     })
        //     .slice(RealOffset, endElementNom),
        // } as IRowsData);
      }}
    ></GridView>
  );
};

export default MdGridView;
