//useForman.ts

import { useReducer, useCallback, Reducer, useState } from "react";
import { InferType, ObjectSchema, ValidationError } from "yup";
import { IDictionary } from "../common/types";
//import { Console } from "console";

export type fnGetError = (fieldPath: string) => string | null | undefined;
export type fnChangeField = (fieldPath: string, value: any) => void; //value შეიძლება სხვადასხვა ტიპისა იყოს
export type fngetAllErrors = () => string;
export type fnClearToDefaults = () => void;
export type fnSetFormData<TFormData> = (frp: TFormData) => void;
export type fnSetSchema<TSchema extends ObjectSchema<any, any, any, any>> = (
  yupSchema: TSchema
) => void;

export function useForman<
  TSchema extends ObjectSchema<any, any, any, any>,
  TFormData extends InferType<TSchema>
>(
  yupSchema: TSchema | null
): [
  TFormData,
  fnChangeField,
  fnGetError,
  fngetAllErrors,
  fnClearToDefaults,
  fnSetFormData<TFormData>,
  fnSetSchema<TSchema>,
  boolean
] {
  const [curFormSet, setFormSet] = useState<boolean>(false);

  function getValidationErrMsg(
    scema: TSchema,
    path: string,
    value: any
  ): string {
    try {
      scema.validateSyncAt(path, value);
      return "";
    } catch (err) {
      //console.log("useForman getValidationErrMsg err=", err);
      if (err instanceof ValidationError) return err.message;
      throw err;
    }
  }

  function getAllValidationErrMsg(
    scema: ObjectSchema<TFormData>,
    value: any
  ): string {
    try {
      if (scema) scema.validateSync(value);
      return "";
    } catch (err) {
      //console.log("useForman getValidationErrMsg err=", err);
      if (err instanceof ValidationError) return err.message;
      throw err;
    }
  }

  function setValueByPatch(obj: any, path: string, value: any): any {
    let s = path.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
    s = s.replace(/^\./, ""); // strip a leading dot
    const schemaCopy = JSON.parse(JSON.stringify(obj)); // a moving reference to internal objects within obj
    let schema = schemaCopy;
    const pList = s.split(".");
    const len = pList.length;

    pList.forEach((elem: string, i: number) => {
      if (i === len - 1) {
        schema[elem] = value;
      } else {
        if (schema[elem]) schema = schema[elem];
        else schema[elem] = {};
      }
    });

    return schemaCopy;
  }

  interface IFormState {
    frm: TFormData | null;
    err: IDictionary;
    sch: TSchema | null;
  }

  type ActionType =
    | { type: "clearToDefault" }
    | { type: "changeField"; payload: { fieldPath: string; value: any } }
    | { type: "setForm"; payload: TFormData }
    | { type: "setSchema"; payload: ObjectSchema<TFormData> };

  function reducer(prevState: IFormState, action: ActionType) {
    //console.log("useForman changeField formState=", formState);
    //console.log("useForman changeField action=", action);
    switch (action.type) {
      case "clearToDefault": {
        return {
          ...prevState,
          frm: yupSchema ? (yupSchema.getDefault() as TFormData) : null,
          err: {} as IDictionary,
        };
      }
      case "changeField": {
        let newfrm = prevState.frm;
        const { fieldPath, value } = action.payload;
        // console.log("useForman changeField { fieldPath, value }=", {
        //   fieldPath,
        //   value,
        // });

        // console.log("useForman before changeField newfrm=", newfrm);
        newfrm = setValueByPatch(newfrm, fieldPath, value);
        // console.log("useForman after changeField newfrm=", newfrm);
        //console.log("useForman changeField newfrm[fieldPath]=", newfrm[fieldPath]);
        const newerr = prevState.err;
        if (prevState.sch)
          newerr[fieldPath] = getValidationErrMsg(
            prevState.sch,
            fieldPath,
            newfrm
          );
        // console.log(
        //   "useForman changeField newerr[fieldPath]=",
        //   newerr[fieldPath]
        // );
        return { ...prevState, frm: newfrm, err: newerr };
      }
      case "setForm":
        setFormSet(true);
        return {
          ...prevState,
          frm: { ...action.payload },
          err: {} as IDictionary,
        };
      case "setSchema":
        //return { ...prevState, sch: action.payload, err: {} as IDictionary };
        const newYupSchema = action.payload;
        // console.log(
        //   "newYupSchema.getDefault() as TFormData=",
        //   newYupSchema.getDefault() as TFormData
        // );
        return {
          ...prevState,
          sch: newYupSchema,
          frm: newYupSchema ? (newYupSchema.getDefault() as TFormData) : null,
          err: {} as IDictionary,
        };
      default:
        throw new Error();
    }
  }

  const initialState: IFormState = {
    sch: yupSchema,
    frm: yupSchema ? (yupSchema.getDefault() as TFormData) : null,
    err: {} as IDictionary,
  };

  const [formState, dispatchForm] = useReducer<Reducer<any, any>>(
    reducer,
    initialState
  );

  const changeField: fnChangeField = (fieldPath: string, value: any) => {
    dispatchForm({ type: "changeField", payload: { fieldPath, value } });
  };

  const getError: fnGetError = (fieldPath: string) => {
    const errors = formState.err;
    if (
      errors &&
      fieldPath in errors &&
      errors[fieldPath] &&
      errors[fieldPath].length > 0
    )
      return errors[fieldPath];
    return null;
  };

  const getAllErrors: fngetAllErrors = () => {
    const errMsg = formState.sch
      ? getAllValidationErrMsg(formState.sch, formState.frm)
      : "";
    return errMsg;
  };

  const clearToDefaults = useCallback(() => {
    dispatchForm({ type: "clearToDefault" });
  }, []); //dispatchForm

  const setFormData = useCallback((frm: TFormData) => {
    dispatchForm({ type: "setForm", payload: frm });
  }, []); //dispatchForm

  const setSchema = useCallback((yupSchema: TSchema) => {
    dispatchForm({ type: "setSchema", payload: yupSchema });
  }, []); //dispatchForm

  return [
    //frm
    formState.frm,
    changeField,
    getError,
    getAllErrors,
    clearToDefaults,
    setFormData,
    setSchema,
    curFormSet,
  ];
}
