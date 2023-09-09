//MdItemEdit.tsx

import React, { useState, useEffect, FC } from "react";
import { Form, Row, Col } from "react-bootstrap";
import * as yup from "yup";

import { checkDataLoaded } from "../modules/CheckDataLoaded";
import WaitPage from "../common/WaitPage";
import EditorHeader from "../editorParts/EditorHeader";
import OneTextControl from "../editorParts/OneTextControl";
import OneNumberControl from "../editorParts/OneNumberControl";
import OneComboBoxControl from "../editorParts/OneComboBoxControl";
import OneCheckBoxControl from "../editorParts/OneCheckBoxControl";
import OneDateBoxControl from "../editorParts/OneDateBoxControl";
import OneSaveCancelButtons from "../editorParts/OneSaveCancelButtons";
import OneErrorRow from "../editorParts/OneErrorRow";
import { useNavigate, useParams } from "react-router-dom";
import {
  DateCell,
  DeserializeGridModel,
  GridModel,
  IntegerCell,
  LookupCell,
  MixedCell,
  StringCell,
} from "../redux/types/gridTypes";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import {
  useAddMasterDataRecordMutation,
  useDeleteMasterDataRecordMutation,
  useUpdateMasterDataRecordMutation,
} from "../redux/api/masterdataApi";
import { clearAllAlerts, EAlertKind } from "../redux/slices/alertSlice";
import { SetDeleteFailure } from "../redux/slices/masterdataSlice";
import { useMasterDataLists } from "./masterDataHooks/useMasterDataLists";
import { useAlert } from "../hooks/useAlert";
import AlertMessages from "../common/AlertMessages";
import { useForman } from "../hooks/useForman";

const MdItemEdit: FC = () => {
  //1. იდენტიფიკატორი
  const [curMdIdVal, setCurMdIdVal] = useState<number | undefined>(undefined);

  //1.1. ცხრილის სახელი
  const [curTableName, setCurTableName] = useState<string | undefined>(
    undefined
  );
  //1.2. მონაცემთა ტიპის შესახებ ინფორმაცია
  const [curDataType, setCurDataType] = useState<DataTypeFfModel | null>(null);
  //1.3. ველების შესახები ინფორმაცია
  const [curGridRules, setCurGridRules] = useState<
    GridModel | undefined | null
  >(null);
  //1.4. ველების სქემა
  const [curYupSchema, setCurYupSchema] = useState<yup.AnySchema | null>(null);

  const dispatch = useAppDispatch();

  const [loadListData] = useMasterDataLists();

  const dataTypesState = useAppSelector((state) => state.dataTypesState);

  const masterData = useAppSelector((state) => state.masterDataState);

  const {
    deletingKey,
    mdWorkingOnSave,
    mdWorkingOnLoadingListData,
    itemEditorTables,
    deleteFailure,
  } = masterData;

  const { mdIdValue, tableName } = useParams<string>();

  const navigate = useNavigate();

  const [updateMasterDataRecord] = useUpdateMasterDataRecordMutation();
  const [addMasterDataRecord] = useAddMasterDataRecordMutation();
  const [deleteMasterDataRecord] = useDeleteMasterDataRecordMutation();

  //6. ფორმის მენეჯერი
  const [
    frm,
    changeField,
    getError,
    getAllErrors,
    clearToDefaults,
    setFormData,
    setSchema,
  ] = useForman<any, any>(curYupSchema);

  function countSchema(gridRules: GridModel) {
    const fields = {} as any;
    gridRules.cells.forEach((col) => {
      let yupResult;

      switch (col.typeName) {
        case "Integer":
        case "Lookup":
          yupResult = yup.number();
          const IntegerCol = col as IntegerCell;
          if (IntegerCol.isIntegerErr)
            yupResult = yupResult.integer(IntegerCol.isIntegerErr.errorMessage);
          else yupResult = yupResult.integer();
          if (IntegerCol.minValRule) {
            yupResult = yupResult.min(IntegerCol.minValRule.val);
          }
          if (IntegerCol.isPositiveErr) {
            yupResult = yupResult.positive(
              IntegerCol.isPositiveErr.errorMessage
            );
          }
          if (IntegerCol.def) {
            yupResult = yupResult.default(IntegerCol.def);
          }
          break;
        case "Boolean":
          yupResult = yup.boolean();
          break;
        case "Date":
          yupResult = yup.date();
          break;
        case "String":
          const StringCol = col as StringCell;
          yupResult = yup.string();
          if (StringCol.def) {
            yupResult = yupResult.default(StringCol.def);
          }
          if (StringCol.maxLenRule) {
            yupResult = yupResult.max(
              StringCol.maxLenRule.val,
              StringCol.maxLenRule.err.errorMessage
            );
          }
          break;
        default:
          throw new Error();
      }

      const mixedCol = col as MixedCell;

      if (mixedCol.isRequiredErr) {
        yupResult = yupResult.required(mixedCol.isRequiredErr.errorMessage);
      }
      if (mixedCol.isNullable) {
        yupResult = yupResult.nullable();
      }

      fields[col.fieldName] = yupResult;
    });
    return yup.object().shape(fields);
  }

  // console.log("MdItemEdit Before UseEffect {}=", {
  //   masterData,
  //   mdRepo: masterData.mdRepo,
  //   mdWorkingOnLoadingListData,
  //   curMdIdVal,
  //   curTableName,
  //   dataTypesState,
  //   mdIdValue,
  //   tableName,
  // });

  //7. იდენტიფიკატორის ეფექტი
  // eslint-disable-next-line
  useEffect(() => {
    if (tableName === undefined) return;

    if (curTableName !== tableName) {
      setCurTableName(tableName);
      dispatch(clearAllAlerts());
      loadListData(tableName, tableName);
      return;
    }

    if (mdWorkingOnLoadingListData) return;

    const checkResult = checkDataLoaded(
      masterData,
      dataTypesState,
      tableName,
      tableName
    );
    if (!checkResult) return;

    const { dataType, gridData } = checkResult;
    setCurDataType(dataType);
    const gridRules = gridData ? DeserializeGridModel(gridData) : null;
    setCurGridRules(gridRules);

    if (gridRules) {
      const YupSchema = countSchema(gridRules);
      setCurYupSchema(YupSchema);
      setSchema(YupSchema);
    }

    if (curMdIdVal !== mdIdValue) {
      if (mdIdValue !== undefined) {
        setCurMdIdVal(parseInt(mdIdValue));
        //console.log("MdItemEdit useEffect mdIdValue=", mdIdValue);
        //console.log("MdItemEdit useEffect tableName=", tableName);
        //console.log("MdItemEdit useEffect dataType.idFieldName=", dataType.idFieldName);
        //console.log("MdItemEdit useEffect masterData.mdRepo[tableName]=", masterData.mdRepo[tableName]);
        const mdItm = masterData.mdRepo[tableName]?.find((itm) => {
          return itm[dataType.idFieldName] === parseInt(mdIdValue);
        });
        //ჩატვირთული ინფორმაცია მივცეთ ფორმის მენეჯერს
        //console.log("MdItemEdit useEffect finded mdItm=", mdItm);
        setFormData(mdItm);
        return;
      }

      //ახალი სარედაქტირებელი ობიექტის შექმნა
      clearToDefaults();
      return;
    }
  }, [
    mdWorkingOnLoadingListData,
    curMdIdVal,
    curTableName,
    dataTypesState,
    mdIdValue,
    tableName,
  ]);

  //8. ჩატვირთვის შემოწმება
  let allNeedTablesLoaded = true;

  if (itemEditorTables) {
    for (let i = 0; i < itemEditorTables.length; i++) {
      const tname = itemEditorTables[i];
      if (!(tname in masterData.mdRepo)) {
        allNeedTablesLoaded = false;
        break;
      }
      if (!masterData.mdRepo[tname]) {
        allNeedTablesLoaded = false;
        break;
      }
    }
  }

  // console.log(
  //   "MdItemEdit before Check Loading {curDataType, curGridRules, curYupSchema, frm, allNeedTablesLoaded, mdWorkingOnLoadingListData}=",
  //   {
  //     curDataType,
  //     curGridRules,
  //     curYupSchema,
  //     frm,
  //     allNeedTablesLoaded,
  //     mdWorkingOnLoadingListData,
  //   }
  // );

  const [ApiLoadHaveErrors] = useAlert(EAlertKind.ApiLoad);

  if (ApiLoadHaveErrors)
    return (
      <div>
        <h5>ჩატვირთვის პრობლემა</h5>
        <AlertMessages alertKind={EAlertKind.ApiLoad} />
      </div>
    );

  if (mdWorkingOnLoadingListData)
    //თუ ინფორმაციის ჩატვირთვა ჯერ კიდევ მიმდინარეობა
    return <WaitPage />;

  //9. შეცდომების შესახებ ინფორმაცია გამოიყენება საბმიტის ფუნქციაში
  const allErrors = getAllErrors();
  const haveErrors = allErrors !== "";

  //10. საბმიტის ფუნქცია
  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    dispatch(clearAllAlerts());
    if (haveErrors) return;

    if (curDataType !== null) {
      if (curMdIdVal !== undefined) {
        updateMasterDataRecord({
          tableName: curDataType.dtTable,
          idFielName: curDataType.idFieldName,
          id: curMdIdVal,
          mdItem: frm,
          navigate,
        });
      } else {
        addMasterDataRecord({
          tableName: curDataType.dtTable,
          idFielName: curDataType.idFieldName,
          mdItem: frm,
          navigate,
        });
      }
    }
  }

  if (!frm || !curDataType || !curMdIdVal || !curGridRules) {
    return <h5>ჩატვირთვის პრობლემა</h5>;
  }

  const edObjKey: string =
    frm && curDataType.keyFieldName && frm[curDataType.keyFieldName]
      ? frm[curDataType.keyFieldName]
      : "";
  const edObjName: string =
    frm && curDataType.nameFieldName && frm[curDataType.nameFieldName]
      ? frm[curDataType.nameFieldName]
      : "";
  const editedObjectName = edObjKey + edObjKey !== "" ? " - " : "" + edObjName;

  return (
    <Row id="MdItemEdit">
      <Col md="6">
        <Form
          className="border border-secondary rounded"
          onSubmit={handleSubmit}
          noValidate
        >
          <EditorHeader
            curIdVal={curMdIdVal}
            EditorName={curDataType.dtNameNominative}
            EditorNameGenitive={curDataType.dtNameGenitive}
            EditedObjectName={editedObjectName}
            workingOnDelete={!!deletingKey}
            DeleteFailure={deleteFailure}
            onDelete={() => {
              deleteMasterDataRecord({
                tableName: curDataType.dtTable,
                idFielName: curDataType.idFieldName,
                id: curMdIdVal,
              });
            }}
            onClearDeletingFailure={() => dispatch(SetDeleteFailure(false))}
            allowDelete={curDataType.delete}
          />
          {curGridRules.cells
            .filter((col) => col.visible)
            .map((field) => {
              const caption = field.caption ? field.caption : "";
              const fieldName = field.fieldName ? field.fieldName : "";

              switch (field.typeName) {
                case "Lookup":
                  const lookupField = field as LookupCell;
                  if (
                    lookupField.dataMember &&
                    lookupField.valueMember &&
                    lookupField.displayMember
                  )
                    return (
                      <OneComboBoxControl
                        key={fieldName}
                        controlId={fieldName}
                        label={caption}
                        value={frm[fieldName]}
                        dataMember={masterData.mdRepo[lookupField.dataMember]}
                        valueMember={lookupField.valueMember}
                        displayMember={lookupField.displayMember}
                        getError={getError}
                        onChangeValue={changeField}
                        firstItem={{ id: -1, name: `აირჩიე ${caption}` }}
                      />
                    );
                  if (lookupField.rowSource) {
                    const rows = [] as any[];
                    const rsarr = lookupField.rowSource.split(";");
                    rsarr.forEach((item, index) => {
                      if (index % 2 === 0) return;
                      rows.push({ val: rsarr[index - 1], disp: item });
                    });
                    return (
                      <OneComboBoxControl
                        key={fieldName}
                        controlId={fieldName}
                        label={caption}
                        value={frm[fieldName]}
                        dataMember={rows}
                        valueMember="val"
                        displayMember="disp"
                        getError={getError}
                        onChangeValue={changeField}
                        firstItem={{ id: -1, name: `აირჩიე ${caption}` }}
                      />
                    );
                  }
                  //თუ აქ მოვიდა კოდი, ნიშნავს, რომ კი არის მითითებული კომბო ბოქსი, მაგრამ პარამეტრები არ აქვს საკმარისი,
                  //ამიტომ გამოვა ტექსტ ბოქსი
                  break;
                case "Boolean":
                  return (
                    <OneCheckBoxControl
                      key={fieldName}
                      controlId={fieldName}
                      label={caption}
                      value={frm[fieldName]}
                      getError={getError}
                      onChangeValue={changeField}
                    />
                  );
                case "Date":
                  const dateField = field as DateCell;
                  return (
                    <OneDateBoxControl
                      key={fieldName}
                      controlId={fieldName}
                      label={caption}
                      value={frm[fieldName]}
                      showDate={!!dateField.showDate}
                      showTime={!!dateField.showTime}
                      getError={getError}
                      onChangeValue={changeField}
                    />
                  );
                case "Integer":
                  return (
                    <OneNumberControl
                      key={fieldName}
                      controlId={fieldName}
                      label={caption}
                      value={frm[fieldName]}
                      getError={getError}
                      onChangeValue={changeField}
                    />
                  );
                default:
                  break;
              }
              //თყ არცერთი ნაცნობი ვარიანტი არ იყო მითითებული, ავიღებთ ტექსტ ბოქსს
              return (
                <OneTextControl
                  key={fieldName}
                  controlId={fieldName}
                  label={caption}
                  value={frm[fieldName]}
                  getError={getError}
                  onChangeValue={changeField}
                />
              );
            })}

          <OneSaveCancelButtons
            curIdVal={curMdIdVal}
            haveErrors={haveErrors}
            savingNow={mdWorkingOnSave}
            onCloseClick={() => {
              dispatch(clearAllAlerts());
              const realReturnPageName = masterData.returnPageName
                ? masterData.returnPageName
                : "mdList";
              navigate(`/${realReturnPageName}/${curTableName}/${curMdIdVal}`);
            }}
            allowEdit={curDataType.update}
          />
          <OneErrorRow allErrors={allErrors} />
        </Form>
      </Col>
    </Row>
  );
};

export default MdItemEdit;
