//MdListView.tsx

import { useEffect, useState, useCallback, FC } from "react";
import { Form, Table, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GetDisplayValue } from "../modules/GetDisplayValue";
import BsComboBox from "./BsComboBox";
import { EmptyToNull, NzInt, filterByHeader } from "../common/myFunctions";
import { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import { Cell, LookupCell } from "../redux/types/gridTypes";
import { IMasterDataState } from "../redux/slices/masterdataSlice";
import { useForman } from "../hooks/useForman";

type MdListViewProps = {
  dataType: DataTypeFfModel;
  table: Array<any>;
  gridColumns: Array<Cell>;
  masterData: IMasterDataState;
  curscrollTo: number | null;
  backLigth: (node: HTMLTableRowElement) => void;
  firstFilter?: any;
  readOnly?: boolean;
  filterChanged?: (frm: any) => void;
  // onLoad: (offset: number, numberOfRowsToShow: number) => void; //
};

interface IrowSourceItem {
  val: number;
  disp: string;
}

const MdListView: FC<MdListViewProps> = (props) => {
  const {
    dataType,
    table,
    gridColumns,
    masterData,
    curscrollTo,
    backLigth,
    firstFilter,
    readOnly,
    filterChanged,
  } = props;

  // console.log("MdListView props=", props);
  // console.log("MdListView table=", table);
  // console.log("MdListView gridColumns=", gridColumns);

  const [curTableName, setCurTableName] = useState<string | null>(null);

  const { dtTable } = dataType;

  const getFilterFirstItem = useCallback(() => {
    const firstItem = { ...table[0] };
    if (firstFilter) {
      for (let propertyName in firstItem) {
        if (!firstFilter[propertyName]) {
          firstItem[propertyName] = "";
        }
      }
    } else {
      for (let propertyName in firstItem) {
        firstItem[propertyName] = "";
      }
    }
    return firstItem;
  }, [firstFilter, table]);

  const [frm, changeField, , , , setFormData] = useForman<any, any>(null);

  useEffect(() => {
    if (curTableName !== dtTable) {
      setCurTableName(dtTable);
      setFormData(getFilterFirstItem());
      return;
    }
  }, [curTableName, dtTable]);

  //console.log("MdListView frm=", frm)

  if (!gridColumns) {
    return <div>ინფორმაციის ჩატვირთვის პრობლემა</div>;
  }

  return (
    <div>
      <Row>
        <Col sm="10">
          <h4>{dataType.dtName}</h4>
        </Col>
        <Col sm="2" align="right">
          {!readOnly && dataType.create && (
            <Link
              to={`/mdItemEdit/${dataType.dtTable}`}
              className="btn btn-primary"
            >
              <FontAwesomeIcon icon="plus" /> ახალი
            </Link>
          )}
        </Col>
      </Row>
      {(table === undefined || table === null) && (
        <div>ცხრილი ჩატვირთული არ არის</div>
      )}
      {table !== undefined && table !== null && table.length === 0 && (
        <div>ცხრილში ჩანაწერები არ არის</div>
      )}
      {table !== undefined && table !== null && table.length > 0 && (
        <Table
          striped
          bordered
          hover
          responsive="sm"
          className="table table-sm table-bordered"
        >
          <thead>
            <tr>
              {gridColumns
                .filter((col) => col.visible)
                .map((col) => {
                  const caption = col.caption ? col.caption : "";
                  const fieldName = col.fieldName ? col.fieldName : "";
                  switch (col.typeName) {
                    case "Lookup":
                      const lookupCol = col as LookupCell;
                      //console.log("lookupCol=", lookupCol);
                      if (
                        lookupCol.dataMember &&
                        lookupCol.valueMember &&
                        lookupCol.displayMember
                      )
                        return (
                          <th key={caption}>
                            {caption}
                            <BsComboBox
                              name={fieldName}
                              value={
                                frm && frm[fieldName] ? frm[fieldName] : ""
                              }
                              dataMember={
                                masterData.mdRepo[lookupCol.dataMember]
                              }
                              valueMember={lookupCol.valueMember}
                              displayMember={lookupCol.displayMember}
                              sortByDisplayMember={false}
                              firstItem={{ id: -1, name: "ყველა" }}
                              firstItemIsSelectable
                              onChangeValue={(name, newValue) => {
                                changeField(name, newValue);
                                const tfrm = { ...frm };
                                tfrm[fieldName] = newValue;
                                if (filterChanged) filterChanged(tfrm);
                              }}
                            />
                          </th>
                        );
                      if (lookupCol.rowSource) {
                        const rows = new Array<IrowSourceItem>();
                        const rsarr = lookupCol.rowSource.split(";");
                        //console.log("rsarr=", rsarr);

                        rsarr.forEach((item, index) => {
                          if (index % 2 === 0) return;
                          rows.push({
                            val: parseInt(rsarr[index - 1]),
                            disp: item,
                          } as IrowSourceItem);
                        });
                        return (
                          <th key={caption}>
                            {caption}
                            <BsComboBox
                              name={fieldName}
                              value={frm ? frm[fieldName] : ""}
                              dataMember={rows}
                              valueMember="val"
                              displayMember="disp"
                              sortByDisplayMember={false}
                              firstItem={{ id: -1, name: "ყველა" }}
                              firstItemIsSelectable
                              onChangeValue={(name, newValue) => {
                                changeField(name, newValue);
                                const tfrm = { ...frm };
                                tfrm[fieldName] = newValue;
                                if (filterChanged) filterChanged(tfrm);
                              }}
                            />
                          </th>
                        );
                      }
                      break;
                    case "Integer": {
                      return (
                        <th key={caption}>
                          {caption}
                          <Form.Control
                            type="number"
                            value={frm && frm[fieldName] ? frm[fieldName] : ""}
                            onChange={(e) => {
                              const { value } = e.target;
                              // console.log(
                              //   "MdListView Integer filter changed to value = ",
                              //   value
                              // );
                              const numberValue = NzInt(EmptyToNull(value), -1);
                              changeField(
                                fieldName,
                                numberValue === -1 ? "" : numberValue
                              );
                              const tfrm = { ...frm };
                              tfrm[fieldName] = numberValue;
                              if (filterChanged) filterChanged(tfrm);
                            }}
                            autoComplete="off"
                          />
                        </th>
                      );
                    }

                    default:
                      break;
                  }
                  return <th key={caption}>{caption}</th>;
                })}
            </tr>
          </thead>
          <tbody>
            {table
              .filter((f) => filterByHeader(f, frm))
              .map((mdItem) => {
                const bl = curscrollTo === mdItem[dataType.idFieldName];
                return (
                  <tr
                    key={mdItem[dataType.idFieldName]}
                    ref={bl ? backLigth : undefined}
                  >
                    {gridColumns
                      .filter((col) => col.visible)
                      .map((col, index) => (
                        <td
                          key={col.fieldName}
                          className={bl ? "backLigth" : undefined}
                        >
                          {GetDisplayValue(masterData, mdItem, col)}
                        </td>
                      ))}
                    {!readOnly && (dataType.update || dataType.delete) && (
                      <td width="50px">
                        <div className="btn-toolbar pull-right">
                          <Link
                            to={`/mdItemEdit/${dataType.dtTable}/${
                              mdItem[dataType.idFieldName]
                            }`}
                            className="btn btn-primary"
                          >
                            <FontAwesomeIcon icon="edit" />
                          </Link>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MdListView;
