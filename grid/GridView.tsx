//GridView.tsx

import { useState, useEffect, type FC } from "react";
import { Table, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import type { IconName } from "@fortawesome/fontawesome-svg-core";

import "./GridView.css";
import type {
    IFilterField,
    IGridColumn,
    IGridScrollTo,
    IRowsData,
    ISortField,
} from "./GridViewTypes";
import Loading from "../common/Loading";
import MasterDataFilterComboBox from "./MasterDataFilterComboBox";
import FilterTextBox from "./FilterTextBox";
import FilterNumberControl from "./FilterNumberControl";
import FilterYesNoComboBox from "./FilterYesNoComboBox";
import GridPagenation from "./GridPagenation";
import GridTableBody from "./GridTableBody";

type GridViewProps = {
    gridHeader?: string;
    columns: IGridColumn[];
    rowsData: IRowsData | undefined;
    showCountColumn: boolean;
    loading: boolean;
    curscrollTo?: IGridScrollTo;
    backLigth?: (node: HTMLElement | HTMLLIElement | null) => void;
    onLoadRows?: (
        offset: number,
        rowsCount: number,
        sortByFields: ISortField[],
        filterByFields: IFilterField[]
    ) => void;
    onRowClick?: (row: any, index: number) => void;
    readOnly?: boolean;
    allowCreate?: boolean;
    allowUpdate?: boolean;
    allowDelete?: boolean;
    editorLink?: string;
    allowInlineEdit?: boolean;
    onInlineEdit?: (
        row: any,
        fieldName: string,
        newValue: any
    ) => Promise<boolean>;
    onInlineEditStart?: (row: any) => void;
    onInlineEditCancel?: (row: any) => void;
};

const GridView: FC<GridViewProps> = (props) => {
    const {
        gridHeader,
        columns,
        rowsData,
        showCountColumn,
        loading,
        curscrollTo,
        backLigth,
        onLoadRows,
        onRowClick,
        readOnly,
        allowCreate,
        allowUpdate,
        allowDelete,
        editorLink,
        allowInlineEdit,
        onInlineEdit,
        onInlineEditStart,
        onInlineEditCancel,
    } = props;

    console.log("GridView props=", props);

    const [curShowRowsCount, setCurShowRowsCount] = useState<number>(10); //ცხრილში საჩვენებელი სტრიქონების რაოდენობა

    const [curSortFieldNames, setCurSortFieldNames] = useState<ISortField[]>(
        [] as ISortField[]
    ); //სორტირების ველების სახელები

    const [curFilterFields, setCurFilterFields] = useState<IFilterField[]>(
        [] as IFilterField[]
    ); //სორტირების ველების სახელები

    useEffect(() => {
        if (!rowsData) {
            if (onLoadRows) {
                onLoadRows(
                    0,
                    curShowRowsCount,
                    curSortFieldNames,
                    curFilterFields
                );
            }
        }
    }, [rowsData, curShowRowsCount, curSortFieldNames, curFilterFields]);

    function toggleSortForColumn(fieldName: string, shiftKeyIsUsed: boolean) {
        //console.log("---- GridView toggleSortForColumn {fieldName}=", {fieldName});

        const sortField = curSortFieldNames.find(
            (f) => f.fieldName === fieldName
        );
        let ascDescVal = 0;
        if (sortField) ascDescVal = sortField.ascending ? 1 : -1;
        ascDescVal = ((ascDescVal + 2) % 3) - 1;
        const newSortFieldNames = shiftKeyIsUsed
            ? curSortFieldNames.filter((f) => f.fieldName !== fieldName)
            : ([] as ISortField[]);
        if (ascDescVal) {
            newSortFieldNames.push({
                fieldName: fieldName,
                ascending: ascDescVal > 0,
            });
        }
        // console.log(
        //   "GridView toggleSortForColumn newSortFieldNames=",
        //   newSortFieldNames
        // );
        setCurSortFieldNames(newSortFieldNames);

        if (onLoadRows) {
            onLoadRows(0, curShowRowsCount, newSortFieldNames, curFilterFields);
        }
    }

    function changeFilterField(fieldName: string, value: any) {
        //console.log("---- GridView changeFilterField {fieldName}=", {fieldName});

        const newFilterFields = curFilterFields.filter(
            (f) => f.fieldName !== fieldName
        );

        if (value !== undefined)
            newFilterFields.push({
                fieldName: fieldName,
                value: value?.toString(),
            } as IFilterField);

        // console.log(
        //   "GridView toggleSortForColumn newSortFieldNames=",
        //   newSortFieldNames
        // );
        setCurFilterFields(newFilterFields);

        if (onLoadRows) {
            onLoadRows(0, curShowRowsCount, curSortFieldNames, newFilterFields);
        }
    }

    function handlePageChange(offset: number, rowsCount: number) {
        setCurShowRowsCount(rowsCount);
        if (onLoadRows) {
            onLoadRows(offset, rowsCount, curSortFieldNames, curFilterFields);
        }
    }

    function getTableHeader() {
        return (
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

                            // console.log("GridView getTableHeader col=", col);
                            // console.log("GridView getTableHeader caption=", caption);

                            if (sortable) {
                                let ascDescVal = 0;
                                const sortField = curSortFieldNames.find(
                                    (f) => f.fieldName === col.fieldName
                                );
                                if (sortField)
                                    ascDescVal = sortField.ascending ? 1 : -1;

                                let sortIconName = "sort";
                                if (ascDescVal > 0) sortIconName = "sort-up";
                                else if (ascDescVal < 0)
                                    sortIconName = "sort-down";
                                return (
                                    <th key={caption}>
                                        <Link
                                            to="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleSortForColumn(
                                                    col.fieldName,
                                                    e.shiftKey
                                                );
                                            }}
                                        >
                                            {caption}{" "}
                                            <FontAwesomeIcon
                                                icon={sortIconName as IconName}
                                            />
                                        </Link>
                                        {!!(
                                            col.dropdownOptions &&
                                            col.dropdownOptions.length > 0
                                        ) && (
                                            <MasterDataFilterComboBox
                                                controlId={col.fieldName}
                                                dropdownOptions={
                                                    col.dropdownOptions
                                                }
                                                isNullable={col.nullable}
                                                onChangeValue={(
                                                    newValue:
                                                        | number
                                                        | null
                                                        | undefined
                                                ) => {
                                                    changeFilterField(
                                                        col.fieldName,
                                                        newValue
                                                    );
                                                }}
                                            ></MasterDataFilterComboBox>
                                        )}
                                        {col.typeName === "String" && (
                                            <FilterTextBox
                                                controlId={col.fieldName}
                                                isNullable={col.nullable}
                                                onChangeValue={(
                                                    newValue:
                                                        | string
                                                        | null
                                                        | undefined
                                                ) => {
                                                    changeFilterField(
                                                        col.fieldName,
                                                        newValue
                                                    );
                                                }}
                                            ></FilterTextBox>
                                        )}
                                        {col.typeName === "Integer" && (
                                            <FilterNumberControl
                                                controlId={col.fieldName}
                                                isNullable={col.nullable}
                                                onChangeValue={(
                                                    newValue:
                                                        | number
                                                        | null
                                                        | undefined
                                                ) => {
                                                    changeFilterField(
                                                        col.fieldName,
                                                        newValue
                                                    );
                                                }}
                                            ></FilterNumberControl>
                                        )}
                                        {col.typeName === "Boolean" && (
                                            <FilterYesNoComboBox
                                                controlId={col.fieldName}
                                                isNullable={col.nullable}
                                                onChangeValue={(
                                                    newValue:
                                                        | boolean
                                                        | null
                                                        | undefined
                                                ) => {
                                                    changeFilterField(
                                                        col.fieldName,
                                                        newValue
                                                    );
                                                }}
                                            ></FilterYesNoComboBox>
                                        )}
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
        );
    }

    // function getTableBody(keyCol: IGridColumn) {
    //     if (!rowsData || !rowsData.rows || rowsData.rows.length === 0)
    //         return null;

    //     return (
    //         <tbody>
    //             {rowsData.rows.map((row, i) => {
    //                 // console.log("GridView row=", row);
    //                 // console.log("GridView keyCol=", keyCol);
    //                 // console.log(
    //                 //     "GridView row[keyCol.fieldName]=",
    //                 //     row[keyCol.fieldName]
    //                 // );
    //                 const index = rowsData.offset + i + 1;
    //                 const bl = curscrollTo
    //                     ? curscrollTo.value === row[curscrollTo.idFieldName]
    //                     : false;
    //                 // console.log("GridView curscrollTo=", curscrollTo);
    //                 // console.log("GridView bl=", bl);
    //                 return (
    //                     <tr
    //                         key={row[keyCol.fieldName]}
    //                         ref={bl ? backLigth : null}
    //                         onClick={() => {
    //                             // Don't trigger row click if inline editing is active
    //                             if (
    //                                 !editingRow ||
    //                                 editingRow[keyCol.fieldName] !==
    //                                     row[keyCol.fieldName]
    //                             ) {
    //                                 onRowClick?.(row, index);
    //                             }
    //                         }}
    //                         style={{
    //                             cursor:
    //                                 onRowClick &&
    //                                 (!editingRow ||
    //                                     editingRow[keyCol.fieldName] !==
    //                                         row[keyCol.fieldName])
    //                                     ? "pointer"
    //                                     : "default",
    //                         }}
    //                     >
    //                         {!!showCountColumn && (
    //                             <td className={bl ? "backLigth" : undefined}>
    //                                 {index}
    //                             </td>
    //                         )}
    //                         {columns
    //                             .filter((col) => col.visible)
    //                             .map((col) => {
    //                                 const fieldName = col.fieldName
    //                                     ? col.fieldName
    //                                     : "";
    //                                 const value = fieldName
    //                                     ? row[fieldName]
    //                                     : "";

    //                                 const displayValue =
    //                                     col.dropdownOptions &&
    //                                     col.dropdownOptions.length > 0
    //                                         ? col.dropdownOptions.find(
    //                                               (opt) => opt.value === value
    //                                           )?.label ?? value
    //                                         : value;

    //                                 const changingFieldName =
    //                                     col.changingFieldName
    //                                         ? col.changingFieldName
    //                                         : "";
    //                                 const changing = changingFieldName
    //                                     ? row[changingFieldName]
    //                                     : false;

    //                                 // Check if this cell is being edited
    //                                 const isEditingThisCell = isEditing(
    //                                     row,
    //                                     fieldName
    //                                 );
    //                                 const canEditThisColumn =
    //                                     allowInlineEdit &&
    //                                     !readOnly &&
    //                                     col.editable !== false &&
    //                                     !col.isKey;

    //                                 return (
    //                                     <td
    //                                         key={col.fieldName}
    //                                         className={`${
    //                                             bl ? "backLigth" : ""
    //                                         } ${
    //                                             canEditThisColumn &&
    //                                             !isEditingThisCell
    //                                                 ? "grid-cell-editable"
    //                                                 : ""
    //                                         } ${
    //                                             isEditingThisCell
    //                                                 ? "grid-cell-editing"
    //                                                 : ""
    //                                         }`.trim()}
    //                                         onClick={(e) => {
    //                                             if (
    //                                                 canEditThisColumn &&
    //                                                 !isEditingThisCell
    //                                             ) {
    //                                                 e.stopPropagation();
    //                                                 startCellEdit(
    //                                                     row,
    //                                                     fieldName
    //                                                 );
    //                                             }
    //                                         }}
    //                                     >
    //                                         {isEditingThisCell ? (
    //                                             renderInlineEditor(col, value)
    //                                         ) : col.control &&
    //                                           React.isValidElement(
    //                                               col.control
    //                                           ) ? (
    //                                             React.cloneElement(
    //                                                 col.control as React.ReactElement<any>,
    //                                                 {
    //                                                     value,
    //                                                     index,
    //                                                     offset: rowsData.offset,
    //                                                     showRows:
    //                                                         curShowRowsCount,
    //                                                     changing,
    //                                                     record: row,
    //                                                 },
    //                                                 null
    //                                             )
    //                                         ) : (
    //                                             // ) : col.lookupColumnPart ? (
    //                                             //   <LookupColumn
    //                                             //     lookupTable={col.lookupColumnPart}
    //                                             //     value={value}
    //                                             //   ></LookupColumn>
    //                                             <span
    //                                                 style={{
    //                                                     display: "block",
    //                                                     minHeight: "20px",
    //                                                     padding:
    //                                                         canEditThisColumn
    //                                                             ? "2px 4px"
    //                                                             : "0",
    //                                                 }}
    //                                             >
    //                                                 {displayValue}
    //                                             </span>
    //                                         )}
    //                                     </td>
    //                                 );
    //                             })}

    //                         {!readOnly &&
    //                             (allowUpdate || allowDelete) &&
    //                             !!editorLink && (
    //                                 <td width="50px">
    //                                     <div className="btn-toolbar pull-right">
    //                                         <Link
    //                                             to={`${editorLink}/${
    //                                                 row[keyCol.fieldName]
    //                                             }`}
    //                                             className="btn btn-primary"
    //                                             onClick={(e) =>
    //                                                 e.stopPropagation()
    //                                             }
    //                                         >
    //                                             <FontAwesomeIcon icon="edit" />
    //                                         </Link>
    //                                     </div>
    //                                 </td>
    //                             )}
    //                     </tr>
    //                 );
    //             })}
    //         </tbody>
    //     );
    // }

    //ყველა ველისათვის აუცილებლად უნდა იყოს განსაზღვრული შემდეგი თვისებები
    //visible - თუ საჭიროა, რომ სევტი გამოჩნდეს
    //caption - სათაური
    //fieldName - ველის სახელი, რომლითაც სტრიქონებიდან უნდა ამოვიღოთ უჯრის მნიშვნელობა

    if (columns.length === 0)
        return <div>სვეტების შესახებ ინფორმაცია განსაზღვრული არ არის</div>;

    //ერთერთ ველს უნდა ჰქონდეს
    const keyCol = columns.find((f) => f.isKey);

    if (!keyCol)
        return <div>უნიკალური მნიშვნელობების სვეტი განსაზღვრული არ არის</div>;

    return (
        <div>
            <Row>
                <Col sm="10">
                    <h4>{gridHeader}</h4>
                </Col>
                <Col sm="2" align="right">
                    {!readOnly && allowCreate && editorLink && (
                        <Link to={editorLink} className="btn btn-primary">
                            <FontAwesomeIcon icon="plus" /> ახალი
                        </Link>
                    )}
                </Col>
            </Row>

            <div id="gridview">
                <Table
                    striped
                    bordered
                    hover
                    responsive="sm"
                    className="table table-sm table-bordered"
                >
                    {getTableHeader()}
                    {/* {getTableBody(keyCol)} */}
                    <GridTableBody
                        rows={rowsData?.rows ?? []}
                        columns={columns}
                        offset={rowsData?.offset ?? 0}
                        rowsCountPerPage={curShowRowsCount}
                        curscrollTo={curscrollTo}
                        keyCol={keyCol}
                        editorLink={editorLink}
                        allowInlineEdit={allowInlineEdit}
                        readOnly={readOnly}
                        showCountColumn={showCountColumn}
                        allowUpdate={allowUpdate}
                        allowDelete={allowDelete}
                        backLigth={backLigth}
                        onInlineEditStart={onInlineEditStart}
                        onInlineEditCancel={onInlineEditCancel}
                        onRowClick={onRowClick}
                        onInlineEdit={onInlineEdit}
                    />
                </Table>
                <GridPagenation
                    offset={rowsData?.offset ?? 0}
                    rowsCountPerPage={curShowRowsCount}
                    allRowsCount={rowsData?.allRowsCount ?? 0}
                    onChange={handlePageChange}
                />
                {(!rowsData ||
                    !rowsData.rows ||
                    rowsData.rows.length === 0) && (
                    <div>მონაცემები არ არის</div>
                )}
                <Row>{!!loading && <Loading />}</Row>
            </div>
        </div>
    );
};

export default GridView;
