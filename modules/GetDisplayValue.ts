//GetDisplayValue.ts

import moment from "moment";
import { IMasterDataState } from "../redux/slices/masterdataSlice";
import {
  Cell,
  DateCell,
  LookupCell,
  MdLookupCell,
  RsLookupCell,
} from "../redux/types/gridTypes";
import { ILookup } from "../redux/types/masterdataTypes";

export function GetDisplayValue(
  masterData: IMasterDataState,
  mdItem: any,
  col: Cell
) {
  // console.log("GetDisplayValue mdItem=", mdItem);
  // console.log("GetDisplayValue col.fieldName=", col.fieldName);
  // console.log("GetDisplayValue mdItem=", mdItem);

  const value = mdItem[col.fieldName];

  if (!col) return value;

  if (col.typeName === "Boolean") {
    if (value === true) return "დიახ";
    if (value === false) return "არა";
  }

  if (col.typeName === "Date") {
    const dateCol = col as DateCell;
    if (!dateCol.showDate && !dateCol.showTime) return value;

    const strFormat = `${dateCol.showDate ? "DD-MMM-YYYY" : ""} ${
      dateCol.showTime ? "HH:mm:ss" : ""
    }`;
    return moment(value).format(strFormat);
  }

  if (col.typeName === "MdLookup") {
    const mdLookupCol = col as MdLookupCell;
    const { dtTable } = mdLookupCol;
    // console.log("GetDisplayValue MdLookupCell dtTable=", dtTable);
    // console.log(
    //   "GetDisplayValue MdLookupCell masterData.mdLookupRepo=",
    //   masterData.mdLookupRepo
    // );
    if (
      dtTable &&
      dtTable in masterData.mdLookupRepo &&
      masterData.mdLookupRepo[dtTable]
    ) {
      const lookupTable = masterData.mdLookupRepo[dtTable];
      // console.log("GetDisplayValue MdLookupCell value=", value);
      // console.log("GetDisplayValue MdLookupCell lookupTable=", lookupTable);
      return GetDisplayValueForMdLookup(lookupTable, value);
    }
  }

  if (col.typeName === "RsLookup") {
    const lookupCol = col as RsLookupCell;
    if (!!lookupCol.rowSource && value !== null && value !== undefined) {
      // console.log("GetDisplayValue col.rowSource=", lookupCol.rowSource);
      var rsarr = lookupCol.rowSource.split(";");
      // console.log("GetDisplayValue rsarr=", rsarr);
      // console.log("GetDisplayValue value=", value);
      var ind = rsarr.indexOf(value.toString()) + 1;
      if (ind > 0 && ind < rsarr.length && !!rsarr[ind]) return rsarr[ind];
    }
  }

  if (col.typeName === "Lookup") {
    //deprecated
    const lookupCol = col as LookupCell;
    const { dataMember } = lookupCol;
    // console.log("GetDisplayValue LookupCell dataMember=", dataMember);
    // console.log(
    //   "GetDisplayValue LookupCell masterData.mdataRepo=",
    //   masterData.mdataRepo
    // );

    if (
      dataMember &&
      dataMember in masterData.mdataRepo &&
      masterData.mdataRepo[dataMember]
    ) {
      const dataTable = masterData.mdataRepo[dataMember];
      // console.log("GetDisplayValue MdLookupCell dataTable=", dataTable);

      return GetDisplayValueForLookup(
        dataTable,
        value,
        lookupCol.valueMember,
        lookupCol.displayMember
      );
    }
  }

  return value;
}

export function GetDisplayValueForLookup(
  dataTable: any[] | undefined,
  value: number,
  valueMember: string | null,
  displayMember: string | null
) {
  if (!!valueMember && !!displayMember && !!dataTable) {
    const fval = dataTable.find(
      (mdItm) => valueMember !== null && mdItm[valueMember] === value
    );
    if (displayMember && !!fval && !!fval[displayMember])
      return fval[displayMember];
  }

  return value;
}

export function GetDisplayValueForMdLookup(
  lookupTable: ILookup[] | undefined,
  value: number
) {
  if (!lookupTable) return value;
  const fval = lookupTable.find((mdItm) => mdItm.id === value);
  if (!!fval && !!fval.name) return fval.name;
}
