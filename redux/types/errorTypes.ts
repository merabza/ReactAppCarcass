//errorTypes.ts

export interface Err {
    errorCode: string;
    errorMessage: string;
}

const createFallbackErr = (): Err => ({
    errorCode: "ServerSideError",
    errorMessage: "სერვერის შეცდომა",
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const asNonEmptyString = (value: unknown): string | undefined =>
    typeof value === "string" && value.length > 0 ? value : undefined;

// ერთი შეცდომის ელემენტი ნებისმიერი ცნობილი ფორმით -> Err (ან null):
//   { errorCode, errorMessage } — უკვე ნორმალიზებული
//   { code, description }       — Result-პატერნის Error (ვალიდაციის ელემენტებიც)
//   { code, name }              — ძველი ფორმატი (rights ფილტრები, UseExceptionHandler)
const toErr = (item: unknown): Err | null => {
    if (!isRecord(item)) return null;
    const errorCode =
        asNonEmptyString(item.errorCode) ?? asNonEmptyString(item.code);
    const errorMessage =
        asNonEmptyString(item.errorMessage) ??
        asNonEmptyString(item.description) ??
        asNonEmptyString(item.name);
    if (!errorMessage) return null;
    return { errorCode: errorCode ?? "UnknownError", errorMessage };
};

// HTTP შეცდომის body -> Err[]; ცარიელი შედეგი = ამოუცნობი ფორმა.
const normalizeErrorData = (data: unknown, httpStatus: unknown): Err[] => {
    if (Array.isArray(data)) {
        return data.map(toErr).filter((e): e is Err => e !== null);
    }

    if (!isRecord(data)) return [];

    // ProblemDetails + ვალიდაცია: root-ზე errors:[{code,description,type}].
    // envelope-ის title/detail გენერიკული ინგლისურია — მხოლოდ ელემენტები ვაჩვენოთ.
    if (Array.isArray(data.errors)) {
        const items = data.errors
            .map(toErr)
            .filter((e): e is Err => e !== null);
        if (items.length > 0) return items;
    }

    // ProblemDetails: {type,title,status,detail}. 500-ზე გენერიკული
    // "Server failure" მოდის — სტანდარტულ fallback-ზე გადავიყვანოთ.
    const title = asNonEmptyString(data.title);
    const detail = asNonEmptyString(data.detail);
    const message = detail ?? title;
    if (message) {
        const status =
            typeof data.status === "number"
                ? data.status
                : typeof httpStatus === "number"
                  ? httpStatus
                  : 0;
        if (status >= 500) return [createFallbackErr()];
        return [{ errorCode: title ?? "UnknownError", errorMessage: message }];
    }

    // ერთი Result-პატერნის Error: {code,description,type}.
    const single = toErr(data);
    if (single) return [single];

    return [];
};

// ცენტრალური ნორმალიზატორი. იღებს onQueryStarted-ის envelope-ს
// { error: FetchBaseQueryError | SerializedError, ... } ან .unwrap()-ის
// შიშველ შეცდომას. ყოველთვის აბრუნებს UI-ს Err[] ფორმატს.
export function buildErrorMessage(error: unknown, additionalErro?: Err): Err[] {
    if (!error) return [];

    // envelope-ის .error ობიექტია; შიშველ FETCH_ERROR/PARSING_ERROR/CUSTOM_ERROR
    // შეცდომებს .error სტრიქონად აქვთ — მათ არ ვხსნით.
    let err: unknown = error;
    if (isRecord(error) && isRecord(error.error)) {
        err = error.error;
    }

    let errors: Err[] = [];
    if (isRecord(err)) {
        errors = normalizeErrorData(err.data, err.status);
    }

    // ამოუცნობი ფორმა, ცარიელი 401/403 body, სტრიქონი data (jwtBaseQuery),
    // ქსელური/პარსინგის შეცდომები, SerializedError — fallback.
    if (errors.length === 0) {
        errors = [createFallbackErr()];
    }

    if (additionalErro) {
        errors = [...errors, additionalErro];
    }
    return errors;
}
