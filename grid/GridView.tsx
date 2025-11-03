//GridView.tsx

import { useState, useEffect, type FC } from "react";
import { Table, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import "./GridView.css";
import type {
    IFilterField,
    IGridColumn,
    IGridScrollTo,
    IRowsData,
    ISortField,
} from "./GridViewTypes";
import Loading from "../common/Loading";
import GridPagenation from "./GridPagenation";
import GridTableBody from "./GridTableBody";
import GridTableHeader from "./GridTableHeader";

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
    onInlineEdit?: (row: any, fieldName: string, newValue: any) => Promise<boolean>;
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

    // console.log("GridView props=", props);

    const [curShowRowsCount, setCurShowRowsCount] = useState<number>(10); //ცხრილში საჩვენებელი სტრიქონების რაოდენობა

    const [curSortFieldNames, setCurSortFieldNames] = useState<ISortField[]>([] as ISortField[]); //სორტირების ველების სახელები

    const [curFilterFields, setCurFilterFields] = useState<IFilterField[]>([] as IFilterField[]); //სორტირების ველების სახელები

    useEffect(() => {
        if (!rowsData) {
            if (onLoadRows) {
                onLoadRows(0, curShowRowsCount, curSortFieldNames, curFilterFields);
            }
        }
    }, [rowsData, curShowRowsCount, curSortFieldNames, curFilterFields]);

    function toggleSortForColumn(fieldName: string, shiftKeyIsUsed: boolean) {
        //console.log("---- GridView toggleSortForColumn {fieldName}=", {fieldName});

        const sortField = curSortFieldNames.find((f) => f.fieldName === fieldName);
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

        const newFilterFields = curFilterFields.filter((f) => f.fieldName !== fieldName);

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

    //ყველა ველისათვის აუცილებლად უნდა იყოს განსაზღვრული შემდეგი თვისებები
    //visible - თუ საჭიროა, რომ სევტი გამოჩნდეს
    //caption - სათაური
    //fieldName - ველის სახელი, რომლითაც სტრიქონებიდან უნდა ამოვიღოთ უჯრის მნიშვნელობა

    if (columns.length === 0) return <div>სვეტების შესახებ ინფორმაცია განსაზღვრული არ არის</div>;

    //ერთერთ ველს უნდა ჰქონდეს
    const keyCol = columns.find((f) => f.isKey);

    if (!keyCol) return <div>უნიკალური მნიშვნელობების სვეტი განსაზღვრული არ არის</div>;

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
                    size="sm"
                    className="table table-sm table-bordered"
                >
                    {/* {getTableHeader()} */}
                    <GridTableHeader
                        columns={columns}
                        showCountColumn={showCountColumn}
                        sortFieldNames={curSortFieldNames}
                        toggleSortForColumn={toggleSortForColumn}
                        changeFilterField={changeFilterField}
                    />
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
                {(!rowsData || !rowsData.rows || rowsData.rows.length === 0) && (
                    <div>მონაცემები არ არის</div>
                )}
                <Row>{!!loading && <Loading />}</Row>
            </div>
        </div>
    );
};

export default GridView;
