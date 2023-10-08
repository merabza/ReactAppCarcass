//GridViewOld.tsx

import React, { useState, useEffect, useCallback, FC } from "react";
import { Table, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { IconName } from "@fortawesome/fontawesome-svg-core";

import "./GridView.css";
import {
  IFilterSortObject,
  IGridColumn,
  IGridScrollTo,
  ISortField,
} from "./GridViewTypes";
import { NzInt } from "../common/myFunctions";
import Loading from "../common/Loading";

type GridViewOldProps = {
  columns: IGridColumn[]; //
  rows: any[]; //
  offset?: number;
  showRows?: number;
  allRowsCount: number; //
  showCountColumn: boolean; //
  onLoad: (newOffset: number, targetShowRows: number) => void; //
  onFilterSortChange: (newSortFieldNames: ISortField[]) => void; //
  onChangeOffsetAndShowRows?: (
    newOffset: number,
    targetShowRows: number
  ) => void;
  filterSortObject?: IFilterSortObject;
  filterSortId?: number;
  loading: boolean; //
  curscrollTo?: IGridScrollTo;
  backLigth?: (node: HTMLElement | HTMLLIElement | null) => void;
};

const GridViewOld: FC<GridViewOldProps> = (props) => {
  const {
    columns,
    rows,
    offset,
    showRows,
    allRowsCount,
    showCountColumn,
    onLoad,
    onFilterSortChange,
    onChangeOffsetAndShowRows,
    filterSortObject,
    filterSortId,
    loading,
    curscrollTo,
    backLigth,
  } = props;

  console.log("GridViewOld props=", props);

  const [curOffset, setCurOffset] = useState<number>(0); //წანაცვლება
  const [curShowRows, setCurShowRows] = useState<number>(10); //ცხრილში საჩვენებელი სტრიქონების რაოდენობა
  const [curFilterSortId, setCurFilterSortId] = useState<number>(-1); //ფილტრაციისა და სორტირების მიმდინარე რეჟიმის ნომერი

  const [curOffsetInputWith, setCurOffsetInputWith] = useState<number>(50); //წანაცვლების ველის სიგანე
  const [curSortFieldNames, setCurSortFieldNames] = useState<ISortField[]>(
    [] as ISortField[]
  ); //სორტირების ველების სახელები

  let gvSortFieldNames: ISortField[] = curSortFieldNames;
  if (filterSortObject && filterSortObject.sortByFields)
    gvSortFieldNames = filterSortObject.sortByFields;

  const gvFilterSortId = filterSortId ?? curFilterSortId;
  const gvOffset = offset ?? curOffset;
  const gvShowRows = showRows ?? curShowRows;
  const gvAllRowsCount =
    allRowsCount || allRowsCount === 0 ? allRowsCount : rows.length;
  //console.log("GridViewOld gvAllRowsCount=", gvAllRowsCount);

  //console.log("GridViewOld {gvOffset, gvShowRows}=", {gvOffset, gvShowRows});

  const changeOffsetAndShowRows = useCallback(
    (targetOffset: number, targetShowRows: number) => {
      // console.log(
      //   "GridViewOld changeOffsetAndShowRows {targetOffset, targetShowRows}=",
      //   { targetOffset, targetShowRows }
      // );

      let haveChanges = false;

      if (targetShowRows !== gvShowRows) {
        setCurShowRows(targetShowRows);
        //console.log("GridViewOld setCurShowRows targetShowRows=", targetShowRows);
        haveChanges = true;
      }

      let newOffset = targetOffset;
      if (newOffset > gvAllRowsCount - targetShowRows)
        newOffset = gvAllRowsCount - targetShowRows;
      if (newOffset < 0) newOffset = 0;

      if (newOffset !== gvOffset) {
        setCurOffset(newOffset);
        //console.log("GridViewOld setCurOffset newOffset=", newOffset);
        setCurOffsetInputWith(
          (Math.floor(Math.log10(newOffset + 1)) + 1) * 9 + 31
        );
        haveChanges = true;
      }

      if (haveChanges && onChangeOffsetAndShowRows) {
        //console.log("GridViewOld changeOffsetAndShowRows onChangeOffsetAndShowRows {newOffset, targetShowRows}=", {newOffset, targetShowRows});
        onChangeOffsetAndShowRows(newOffset, targetShowRows);
      }

      if (onLoad) {
        // console.log(
        //   "GridViewOld changeOffsetAndShowRows {newOffset, targetShowRows}=",
        //   { newOffset, targetShowRows }
        // );

        let needsToLoad = false;
        // console.log(
        //   "GridViewOld changeOffsetAndShowRows needsToLoad=",
        //   needsToLoad
        // );
        if (!needsToLoad && !rows) {
          // console.log(
          //   "GridViewOld changeOffsetAndShowRows needsToLoad because {rows}=",
          //   { rows }
          // );
          needsToLoad = true;
        }

        if (!needsToLoad) {
          for (let i = 0; i < targetShowRows; i++) {
            const index = newOffset + i;
            if (
              !(index in rows) ||
              rows[index] === undefined ||
              rows[index] === null
            ) {
              // console.log(
              //   "GridViewOld changeOffsetAndShowRows needsToLoad because {index, rows[index]}=",
              //   { index, val: rows[index] }
              // );
              needsToLoad = true;
              break;
            }
          }
        }

        if (needsToLoad) {
          // console.log(
          //   "GridViewOld changeOffsetAndShowRows call",
          //   newOffset,
          //   targetShowRows
          // );
          onLoad(newOffset, targetShowRows);
        }
      }
    },
    [
      gvAllRowsCount,
      gvOffset,
      gvShowRows,
      onChangeOffsetAndShowRows,
      onLoad,
      rows,
    ]
  );

  useEffect(() => {
    // console.log("GridViewOld useEffect ", {
    //   curFilterSortId,
    //   gvFilterSortId,
    //   curOffset,
    //   gvOffset,
    //   curShowRows,
    //   gvShowRows,
    // });
    if (
      curFilterSortId === -1 ||
      gvFilterSortId !== curFilterSortId ||
      curOffset !== gvOffset ||
      curShowRows !== gvShowRows
    ) {
      let nextFilterSortId = gvFilterSortId;
      if (nextFilterSortId < 0) nextFilterSortId = 0;
      setCurFilterSortId(nextFilterSortId);
      changeOffsetAndShowRows(gvOffset, gvShowRows);
    }
  }, [
    gvOffset,
    gvShowRows,
    gvFilterSortId,
    curFilterSortId,
    curOffset,
    curShowRows,
  ]);

  function toggleSortForColumn(fieldName: string) {
    //console.log("---- GridViewOld toggleSortForColumn {fieldName}=", {fieldName});

    const newSortFieldNames = [] as ISortField[];
    let ascDescVal = 0;
    const sortField = gvSortFieldNames.find((f) => f.fieldName === fieldName);
    if (sortField) ascDescVal = sortField.ascending ? 1 : -1;
    ascDescVal = ((ascDescVal + 2) % 3) - 1;
    if (ascDescVal)
      newSortFieldNames[0] = {
        fieldName: fieldName,
        ascending: ascDescVal > 0,
      };
    setCurSortFieldNames(newSortFieldNames);
    if (onFilterSortChange) onFilterSortChange(newSortFieldNames);
    if (filterSortId === undefined) setCurFilterSortId(-1);
  }

  //ყველა ველისათვის აუცილებლად უნდა იყოს განსაზღვრული შემდეგი თვისებები
  //visible - თუ საჭიროა, რომ სევტი გამოჩნდეს
  //caption - სათაური
  //fieldName - ველის სახელი, რომლითაც სტრიქონებიდან უნდა ამოვიღოთ უჯრის მნიშვნელობა

  //ერთერთ ველს უნდა ჰქონდეს
  const keyCol = columns.find((f) => f.isKey);

  if (!keyCol)
    return <div>უნიკალური მნიშვნელობების სვეტი განსაზღვრული არ არის</div>;

  if (!rows || rows.length === 0) return <div>მონაცემები არ არის</div>;

  return (
    <div id="gridview">
      <Table
        striped
        bordered
        hover
        responsive="sm"
        className="table table-sm table-bordered"
      >
        <thead>
          <tr>
            {!!showCountColumn && (
              <th>
                <span>N</span>
              </th>
            )}
            {columns
              .filter((col) => col.visible)
              .map((col) => {
                const caption = col.caption ? col.caption : "";
                const sortable = !!col.sortable;

                if (sortable) {
                  let ascDescVal = 0;
                  const sortField = gvSortFieldNames.find(
                    (f) => f.fieldName === col.fieldName
                  );
                  if (sortField) ascDescVal = sortField.ascending ? 1 : -1;

                  let sortIconName = "sort";
                  if (ascDescVal > 0) sortIconName = "sort-up";
                  else if (ascDescVal < 0) sortIconName = "sort-down";
                  return (
                    <th key={caption}>
                      <Link
                        to="#"
                        onClick={() => toggleSortForColumn(col.fieldName)}
                      >
                        {caption}{" "}
                        <FontAwesomeIcon icon={sortIconName as IconName} />
                      </Link>
                    </th>
                  );
                } else {
                  return (
                    <th key={caption}>
                      <span>{caption}</span>
                    </th>
                  );
                }
              })}
          </tr>
        </thead>
        <tbody>
          {rows.slice(gvOffset, gvOffset + gvShowRows).map((row, i) => {
            //console.log("GridViewOld row=", row);
            const index = gvOffset + i + 1;
            const bl = curscrollTo?.index === index;
            return (
              <tr key={row[keyCol.fieldName]} ref={bl ? backLigth : null}>
                {!!showCountColumn && (
                  <td className={bl ? "backLigth" : undefined}>{index}</td>
                )}
                {columns
                  .filter((col) => col.visible)
                  .map((col) => {
                    const fieldName = col.fieldName ? col.fieldName : "";
                    const value = fieldName ? row[fieldName] : "";
                    const changingFieldName = col.changingFieldName
                      ? col.changingFieldName
                      : "";
                    const changing = changingFieldName
                      ? row[changingFieldName]
                      : false;
                    if (col.caption === "თოლია") {
                      //console.log("GridViewOld col=", col);
                      //console.log("GridViewOld changingFieldName=", changingFieldName);
                      //console.log("GridViewOld changing=", changing);
                    }
                    return (
                      <td
                        key={col.fieldName}
                        className={bl ? "backLigth" : undefined}
                      >
                        {col.control && React.isValidElement(col.control)
                          ? React.cloneElement(
                              col.control as React.ReactElement<any>,
                              {
                                value,
                                index,
                                offset: curOffset,
                                showRows: curShowRows,
                                changing,
                                record: row,
                              },
                              null
                            )
                          : value}
                      </td>
                    );
                  })}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <div className="d-flex align-items-center justify-content-center">
        <div className="form-inline">
          {" "}
          გვერდზე ჩანაწერების რაოდენობა:{" "}
          <select
            className="ml-1 mr-1"
            onChange={(e) => {
              e.preventDefault();
              const newValue = NzInt(e.target.value, gvShowRows);
              changeOffsetAndShowRows(gvOffset, newValue);
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          წანაცვლება:
          <input
            className="ml-1 mr-1"
            autoComplete="off"
            type="number"
            style={{ width: `${curOffsetInputWith}px` }}
            value={gvOffset}
            min="0"
            onChange={(e) => {
              e.preventDefault();
              const newValue = NzInt(e.target.value, gvOffset);
              changeOffsetAndShowRows(newValue, gvShowRows);
            }}
          />
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-center mt-3">
        <button
          className="btn-space btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            changeOffsetAndShowRows(0, gvShowRows);
          }}
        >
          <FontAwesomeIcon icon="angle-double-left" />
        </button>
        <button
          className="btn-space btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            changeOffsetAndShowRows(gvOffset - gvShowRows, gvShowRows);
          }}
        >
          <FontAwesomeIcon icon="angle-left" />
        </button>
        <span className="mr-1">
          ჩანაწერები: {gvOffset + 1}-
          {gvOffset + gvShowRows > gvAllRowsCount
            ? gvAllRowsCount
            : gvOffset + gvShowRows}{" "}
          სულ: {gvAllRowsCount}{" "}
        </span>
        <button
          className="btn-space btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            changeOffsetAndShowRows(gvOffset + gvShowRows, gvShowRows);
          }}
        >
          <FontAwesomeIcon icon="angle-right" />
        </button>
        <button
          className="btn-space btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            changeOffsetAndShowRows(gvAllRowsCount - gvShowRows, gvShowRows);
          }}
        >
          <FontAwesomeIcon icon="angle-double-right" />
        </button>
      </div>
      <Row>{!!loading && <Loading />}</Row>
    </div>
  );
};

export default GridViewOld;
