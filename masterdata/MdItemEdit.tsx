//MdItemEdit.tsx

import React, { useState, useEffect, type FC } from "react";
import { Form, Row, Col } from "react-bootstrap";
import * as yup from "yup";

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
import type {
    DateCell,
    GridModel,
    LookupCell,
    MdLookupCell,
    RsLookupCell,
} from "../redux/types/gridTypes";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import type { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import {
    useAddMasterDataRecordMutation,
    useDeleteMasterDataRecordMutation,
    useLazyGetOneMdRecordQuery,
    useUpdateMasterDataRecordMutation,
} from "../redux/api/masterdataApi";
import { clearAllAlerts, EAlertKind } from "../redux/slices/alertSlice";
import {
    clearTablesForClearAfterCrudOperations,
    setDeleteFailure,
} from "../redux/slices/masterdataSlice";
//import { useMasterDataLists } from "./masterDataHooks/useMasterDataLookupLists";
import { useAlert } from "../hooks/useAlert";
import AlertMessages from "../common/AlertMessages";
import { useForman } from "../hooks/useForman";
import { useMasterDataLookupLists } from "./masterDataHooks/useMasterDataLookupLists";
import { countMdSchema } from "./mdSchemaFunctions";
import type { IGetOneMdRecordParameters } from "../redux/types/masterdataTypes";
import { CreateArrayFromRowSource } from "./mdFunctions";

const MdItemEdit: FC = () => {
    //1. იდენტიფიკატორი
    const [curMdIdVal, setCurMdIdVal] = useState<number | undefined>();

    //1.1. ცხრილის სახელი
    const [curTableName, setCurTableName] = useState<string | undefined>(
        undefined
    );
    // //1.2. მონაცემთა ტიპის შესახებ ინფორმაცია
    const [curDataType, setCurDataType] = useState<DataTypeFfModel | null>(
        null
    );
    // //1.3. ველების შესახები ინფორმაცია
    const [curGridRules, setCurGridRules] = useState<
        GridModel | undefined | null
    >(null);
    //1.4. ველების სქემა
    const [curYupSchema, setCurYupSchema] = useState<yup.AnySchema | null>(
        null
    );

    const dispatch = useAppDispatch();

    const [loadListData] = useMasterDataLookupLists();

    const dataTypesState = useAppSelector((state) => state.dataTypesState);

    const masterData = useAppSelector((state) => state.masterDataState);

    const {
        deletingKey,
        mdWorkingOnSave,
        mdWorkingOnLoadingListData,
        deleteFailure,
        mdRecordForEdit,
        itemEditorTables,
        itemEditorLookupTables,
    } = masterData;

    const { tableName } = useParams<string>();
    const { mdIdValue: fromParamsMdId } = useParams<string>();

    const [getOneMdRecord, { isLoading: loadingMdRecord }] =
        useLazyGetOneMdRecordQuery();

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
        FormSet,
    ] = useForman<any, any>(curYupSchema);

    // console.log("MdItemEdit Before UseEffect {}=", {
    //   masterData,
    //   mdLookupRepo: masterData.mdLookupRepo,
    //   mdWorkingOnLoadingListData,
    //   curMdIdVal,
    //   curTableName,
    //   dataTypesState,
    //   mdIdValue,
    //   tableName,
    // });

    //7. იდენტიფიკატორის ეფექტი
    useEffect(() => {
        if (tableName === undefined) return;

        if (curTableName !== tableName) {
            setCurTableName(tableName);
            dispatch(clearAllAlerts());
        }

        const dataType = dataTypesState.dataTypesByTableNames[tableName];
        const gridRules = dataTypesState.gridRules[tableName];
        if (
            !dataType ||
            !gridRules ||
            !(tableName in itemEditorTables) ||
            !(tableName in itemEditorLookupTables)
        )
            loadListData(tableName);

        if (mdWorkingOnLoadingListData) return;

        setCurDataType(dataType);
        setCurGridRules(gridRules);

        if (gridRules) {
            const YupSchema = countMdSchema(gridRules);
            //console.log("MdItemEdit useEffect setCurYupSchema YupSchema=", YupSchema);
            setCurYupSchema(YupSchema);
            setSchema(YupSchema);
        }

        const mdIdValue = fromParamsMdId ? parseInt(fromParamsMdId) : 0;

        if (curMdIdVal !== mdIdValue) {
            //გავასუფთავოთ შეცდომები, სანამ ახლების დაგროვებას დავიწყებთ
            dispatch(clearAllAlerts());

            setCurMdIdVal(mdIdValue);

            if (mdIdValue) {
                //თუ იდენტიფიკატორი კარგია, ჩავტვირთოთ ბაზიდან ინფორმაცია
                getOneMdRecord({
                    tableName,
                    id: mdIdValue,
                } as IGetOneMdRecordParameters);
                return;
            }

            //ახალი სარედაქტირებელი ობიექტის შექმნა
            clearToDefaults();
            return;
        }

        // console.log("MdItemEdit useEffect", {
        //   loadingMdRecord,
        //   tableName,
        //   mdRecordForEdit,
        //   mdIdValue,
        // });

        if (loadingMdRecord || !mdRecordForEdit[tableName]) return;

        setFormData(mdRecordForEdit[tableName]);
    }, [
        loadingMdRecord,
        mdWorkingOnLoadingListData,
        curMdIdVal,
        curTableName,
        dataTypesState,
        tableName,
        mdRecordForEdit,
        itemEditorTables,
        itemEditorLookupTables,
    ]);

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
    const [ApiMutationHaveErrors] = useAlert(EAlertKind.ApiMutation);

    if (ApiLoadHaveErrors)
        return (
            <div>
                <h5>ჩატვირთვის პრობლემა</h5>
                <AlertMessages alertKind={EAlertKind.ApiLoad} />
            </div>
        );

    if (loadingMdRecord || mdWorkingOnLoadingListData)
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
            if (curMdIdVal) {
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

    const formSetCheck = !curMdIdVal || (!!curMdIdVal && FormSet);

    // console.log("MdItemEdit CheckLoad ", {
    //   frm,
    //   FormSet,
    //   curDataType,
    //   curGridRules,
    //   curMdIdVal,
    //   formSetCheck,
    // });

    if (!frm || !formSetCheck || !curDataType || !curGridRules) {
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
    const editedObjectName =
        edObjKey + edObjKey !== "" ? " - " : "" + edObjName;

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
                            if (curMdIdVal)
                                deleteMasterDataRecord({
                                    tableName: curDataType.dtTable,
                                    idFielName: curDataType.idFieldName,
                                    id: curMdIdVal,
                                    navigate,
                                });
                        }}
                        onClearDeletingFailure={() =>
                            dispatch(setDeleteFailure(false))
                        }
                        allowDelete={curDataType.delete}
                    />
                    {curGridRules.cells
                        .filter((col) => col.visible)
                        .map((field) => {
                            const caption = field.caption ? field.caption : "";
                            const fieldName = field.fieldName
                                ? field.fieldName
                                : "";
                            // console.log("MdItemEdit fieldName=", fieldName);
                            switch (field.typeName) {
                                case "RsLookup":
                                    const rsLookupField = field as RsLookupCell;
                                    const lookupData = CreateArrayFromRowSource(
                                        rsLookupField.rowSource
                                    );

                                    // if (rsLookupField.rowSource) {
                                    //   const rows = [] as any[];
                                    //   const rsarr = rsLookupField.rowSource.split(";");
                                    //   rsarr.forEach((item, index) => {
                                    //     if (index % 2 === 0) return;
                                    //     rows.push({ val: rsarr[index - 1], disp: item });
                                    //   });
                                    return (
                                        <OneComboBoxControl
                                            key={fieldName}
                                            controlId={fieldName}
                                            label={caption}
                                            value={frm[fieldName]}
                                            dataMember={lookupData}
                                            valueMember="id"
                                            displayMember="name"
                                            getError={getError}
                                            onChangeValue={changeField}
                                            firstItem={{
                                                id: -1,
                                                name: `აირჩიე ${caption}`,
                                            }}
                                        />
                                    );
                                    //თუ აქ მოვიდა კოდი, ნიშნავს, რომ კი არის მითითებული კომბო ბოქსი, მაგრამ პარამეტრები არ აქვს საკმარისი,
                                    //ამიტომ გამოვა ტექსტ ბოქსი
                                    break;
                                case "MdLookup":
                                    const mdLookupField = field as MdLookupCell;
                                    if (mdLookupField.dtTable)
                                        return (
                                            <OneComboBoxControl
                                                key={fieldName}
                                                controlId={fieldName}
                                                label={caption}
                                                value={frm[fieldName]}
                                                dataMember={
                                                    masterData.mdLookupRepo[
                                                        mdLookupField.dtTable
                                                    ]
                                                }
                                                valueMember={"id"}
                                                displayMember={"name"}
                                                getError={getError}
                                                onChangeValue={changeField}
                                                firstItem={{
                                                    id: -1,
                                                    name: `აირჩიე ${caption}`,
                                                }}
                                            />
                                        );
                                    break;
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
                                                dataMember={
                                                    masterData.mdataRepo[
                                                        lookupField.dataMember
                                                    ]
                                                }
                                                valueMember={
                                                    lookupField.valueMember
                                                }
                                                displayMember={
                                                    lookupField.displayMember
                                                }
                                                getError={getError}
                                                onChangeValue={changeField}
                                                firstItem={{
                                                    id: -1,
                                                    name: `აირჩიე ${caption}`,
                                                }}
                                            />
                                        );
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
                            dispatch(clearTablesForClearAfterCrudOperations());
                            const realReturnPageName = masterData.returnPageName
                                ? masterData.returnPageName
                                : "mdList";
                            navigate(
                                `/${realReturnPageName}/${curTableName}/${curMdIdVal}`
                            );
                        }}
                        allowEdit={curDataType.update}
                    />
                    <OneErrorRow allErrors={allErrors} />
                    {!!ApiMutationHaveErrors && (
                        <AlertMessages alertKind={EAlertKind.ApiMutation} />
                    )}
                </Form>
            </Col>
        </Row>
    );
};

export default MdItemEdit;
