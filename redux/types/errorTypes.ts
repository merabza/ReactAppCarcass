export interface Err {
  errorCode: string;
  errorMessage: string;
}

export function buildErrorMessage(error: any, additionalErro?: Err): Err[] {
  // console.log("buildErrorMessage error=", error);
  if (!error) return [] as Err[];
  var err1 = error as any;

  // console.log("buildErrorMessage err1=", err1);
  if (!err1) return [] as Err[];

  var err = err1.error as any;
  // console.log("buildErrorMessage err=", err);
  if (!err) return [] as Err[];

  if (err.data) {
    let errors = err.data as Err[];
    if (!additionalErro) return errors;
    errors = [...errors];
    errors.push(additionalErro);
    return errors;
  }
  const errors = [] as Err[];
  errors.push({
    errorCode: "ServerSideError",
    errorMessage: "სერვერის შეცდომა",
  } as Err);
  return errors;
}
