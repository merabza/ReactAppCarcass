//CheckDataLoaded.ts

import { IDataTypesState } from "../redux/slices/dataTypesSlice";
import { IMasterDataState } from "../redux/slices/masterdataSlice";

export function checkDataLoaded(
  masterData: IMasterDataState,
  dataTypes: IDataTypesState,
  tableName: string | undefined,
  gridName: string | undefined
) {
  // console.log("checkDataLoaded 0 masterData=", masterData);

  if (masterData.mdWorkingOnLoadingListData) {
    // console.log("checkDataLoaded 1 steel loading");
    return false;
  }

  const datatypes = dataTypes.dataTypes;

  if (!datatypes) {
    // console.log("checkDataLoaded 2 datatypes not loaded");
    return false;
  }

  if (datatypes.length === 0) {
    // console.log("checkDataLoaded 3 datatypes has not any element");
    return false;
  }

  if (tableName === undefined) {
    // console.log("checkDataLoaded 4 tableName does not specified");
    return false;
  }

  if (!(tableName in masterData.mdRepo)) {
    // console.log(
    //   "checkDataLoaded 5 table not loaded tableName in masterData.mdRepo=",
    //   tableName in masterData.mdRepo
    // );
    // console.log("checkDataLoaded 6 table not loaded tableName=", tableName);
    // console.log(
    //   "checkDataLoaded 7 table not loaded masterData.mdRepo=",
    //   masterData.mdRepo
    // );
    return false;
  }

  if (!masterData.mdRepo[tableName]) {
    // console.log("checkDataLoaded 8 table is ampty");
    return false;
  }

  if (gridName === undefined) {
    // console.log("checkDataLoaded 9 gridName does not specified");
    return false;
  }

  if (!(gridName in dataTypes.gridsDatas)) {
    // console.log("checkDataLoaded 10 grid rules not found gridName=", gridName);
    return false;
  }

  if (!dataTypes.gridsDatas[gridName]) {
    // console.log("checkDataLoaded 11 grid rules empty gridName=", gridName);
    return false;
  }

  const dataType = datatypes.find((dt) => {
    return dt.dtTable === tableName;
  });

  if (!dataType) {
    // console.log("checkDataLoaded 12 datatype not found for table ", tableName);
    return false;
  }

  const gridData = dataTypes.gridsDatas[gridName];

  // console.log("checkDataLoaded 13 return {dataType, gridData}", {
  //   dataType,
  //   gridData,
  // });
  return { dataType, gridData };
}

export function checkDataTypeLoaded(
  masterData: IMasterDataState,
  dataTypes: IDataTypesState,
  tableName: string
) {
  //console.log("checkDataLoaded masterData=", masterData);

  if (masterData.mdWorkingOnLoadingListData) {
    //console.log("checkDataLoaded 1 steel loading");
    return false;
  }

  const datatypes = dataTypes.dataTypes;

  if (!datatypes) {
    //console.log("checkDataLoaded 2 datatypes not loaded");
    return false;
  }

  if (datatypes.length === 0) {
    //console.log("checkDataLoaded 3 datatypes has not any element");
    return false;
  }

  const dataType = datatypes.find((dt) => {
    return dt.dtTable === tableName;
  });

  if (!dataType) {
    //console.log("checkDataLoaded 10 datatype not found for table ", tableName);
    return false;
  }

  return dataType;
}

export function checkDataTableLoaded(
  masterData: IMasterDataState,
  tableName: string
) {
  //console.log("checkDataLoaded masterData=", masterData);

  if (masterData.mdWorkingOnLoadingListData) {
    //console.log("checkDataLoaded 1 steel loading");
    return false;
  }

  if (!(tableName in masterData.mdRepo)) {
    //console.log("checkDataLoaded 4 table not loaded tableName=", tableName);
    //console.log("checkDataLoaded 4 table not loaded masterData.mdRepo=", masterData.mdRepo);
    return false;
  }

  if (!masterData.mdRepo[tableName]) {
    //console.log("checkDataLoaded 5 table is ampty");
    return false;
  }

  return true;
}

export function checkGridLoaded(
  masterData: IMasterDataState,
  dataTypes: IDataTypesState,
  gridName: string
) {
  //console.log("checkDataLoaded masterData=", masterData);

  if (masterData.mdWorkingOnLoadingListData) {
    //console.log("checkDataLoaded 1 steel loading");
    return false;
  }

  if (!(gridName in dataTypes.gridsDatas)) {
    //console.log("checkDataLoaded 8 grid rules not found gridName=", gridName);
    return false;
  }

  if (!dataTypes.gridsDatas[gridName]) {
    //console.log("checkDataLoaded 9 grid rules empty gridName=", gridName);
    return false;
  }

  const gridRules = dataTypes.gridsDatas[gridName];

  return gridRules;
}
