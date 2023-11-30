export interface Err {
  errorCode: string;
  errorMessage: string;
}

export function buildErrorMessage(error: any, additionalErro?: Err): Err[] {
  console.log("buildErrorMessage error=", error);
  var err1 = error as any;
  console.log("buildErrorMessage err=", err);
  var err = err1.error as any;
  console.log("buildErrorMessage err=", err);
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
