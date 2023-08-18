//GetDisplayValue.ts

import moment from "moment";
import { IMasterDataState } from "../redux/slices/masterdataSlice";
import { Cell, DateCell, LookupCell } from "../redux/types/gridTypes";

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

  if (col.typeName === "Lookup") {
    const lookupCol = col as LookupCell;
    const { dataMember } = lookupCol;

    if (
      dataMember &&
      dataMember in masterData.mdRepo &&
      masterData.mdRepo[dataMember]
    ) {
      const dataTable = masterData.mdRepo[dataMember];

      return GetDisplayValueForLookup(
        dataTable,
        value,
        lookupCol.valueMember,
        lookupCol.displayMember
      );
    }

    if (!!lookupCol.rowSource) {
      // console.log("GetDisplayValue col.rowSource=", lookupCol.rowSource);
      var rsarr = lookupCol.rowSource.split(";");
      // console.log("GetDisplayValue rsarr=", rsarr);
      // console.log("GetDisplayValue value=", value);
      var ind = rsarr.indexOf(value.toString()) + 1;
      if (ind > 0 && ind < rsarr.length && !!rsarr[ind]) return rsarr[ind];
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
