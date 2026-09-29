//mdSchemaFunctions.ts

//mdSchemaFunctions.ts
import type {
    DateCell,
    GridModel,
    IntegerCell,
    MixedCell,
    NumberCell,
    StringCell,
} from "../redux/types/gridTypes";
import * as yup from "yup";

//თარიღის უჯრედი, რომელიც მხოლოდ დროს აჩვენებს (ბექენდის DateCell.TimeOnly(); false მნიშვნელობა JSON-ში არ იწერება)
export function IsTimeOnlyCell(col: DateCell): boolean {
    return !col.showDate && !!col.showTime;
}

export function countMdSchema(gridRules: GridModel) {
    const fields = {} as any;
    gridRules.cells.forEach((col) => {
        let yupResult;

        switch (col.typeName) {
            case "Integer":
            case "RsLookup":
            case "Lookup":
            case "MdLookup":
                yupResult = yup.number();
                const IntegerCol = col as IntegerCell;
                if (IntegerCol.isIntegerErr)
                    yupResult = yupResult.integer(
                        IntegerCol.isIntegerErr.description
                    );
                else yupResult = yupResult.integer();
                if (IntegerCol.minValRule) {
                    yupResult = yupResult.min(IntegerCol.minValRule.val);
                }
                if (IntegerCol.isPositiveErr) {
                    yupResult = yupResult.positive(
                        IntegerCol.isPositiveErr.description
                    );
                }
                if (IntegerCol.def || IntegerCol.def === 0) {
                    // console.log("1 yupResult=", yupResult);
                    yupResult = yupResult.default(IntegerCol.def);
                    // console.log("IntegerCol.def=", IntegerCol.def);
                    // console.log("2 yupResult=", yupResult);
                }
                break;
            case "Number": {
                yupResult = yup.number();
                const NumberCol = col as NumberCell;
                if (NumberCol.isPositiveErr) {
                    yupResult = yupResult.positive(
                        NumberCol.isPositiveErr.description
                    );
                }
                break;
            }
            case "Boolean":
                yupResult = yup.boolean();
                break;
            case "Date":
                //მხოლოდ დროის უჯრედის მნიშვნელობა "HH:mm:ss" სტრიქონია და თარიღად ვერ გარდაიქმნება
                yupResult = IsTimeOnlyCell(col as DateCell)
                    ? yup.string()
                    : yup.date();
                break;
            case "String":
                const StringCol = col as StringCell;
                // console.log("StringCol=", StringCol);
                yupResult = yup.string();
                if (StringCol.def || StringCol.def === "") {
                    yupResult = yupResult.default(StringCol.def);
                }
                if (StringCol.maxLenRule) {
                    yupResult = yupResult.max(
                        StringCol.maxLenRule.val,
                        StringCol.maxLenRule.error.description
                    );
                }
                //ცარიელ მნიშვნელობას მინიმალური სიგრძე და ფორმატი არ ამოწმებს (როგორც ბექენდში)
                if (StringCol.minLenRule) {
                    const minLenRule = StringCol.minLenRule;
                    yupResult = yupResult.test(
                        "minLen",
                        minLenRule.error.description,
                        (value) => !value || value.length >= minLenRule.val
                    );
                }
                if (StringCol.patternRule) {
                    yupResult = yupResult.matches(
                        new RegExp(StringCol.patternRule.val),
                        {
                            message: StringCol.patternRule.error.description,
                            excludeEmptyString: true,
                        }
                    );
                }
                break;
            default:
                throw new Error();
        }

        const mixedCol = col as MixedCell;

        if (mixedCol.isRequiredErr) {
            yupResult = yupResult.required(mixedCol.isRequiredErr.description);
        }
        if (mixedCol.isNullable) {
            yupResult = yupResult.nullable();
        }

        fields[col.fieldName] = yupResult;
    });
    return yup.object().shape(fields);
}
