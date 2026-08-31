//mdSchemaFunctions.ts

//mdSchemaFunctions.ts
import type {
    GridModel,
    IntegerCell,
    MixedCell,
    StringCell,
} from "../redux/types/gridTypes";
import * as yup from "yup";

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
                        IntegerCol.isIntegerErr.errorMessage
                    );
                else yupResult = yupResult.integer();
                if (IntegerCol.minValRule) {
                    yupResult = yupResult.min(IntegerCol.minValRule.val);
                }
                if (IntegerCol.isPositiveErr) {
                    yupResult = yupResult.positive(
                        IntegerCol.isPositiveErr.errorMessage
                    );
                }
                if (IntegerCol.def || IntegerCol.def === 0) {
                    // console.log("1 yupResult=", yupResult);
                    yupResult = yupResult.default(IntegerCol.def);
                    // console.log("IntegerCol.def=", IntegerCol.def);
                    // console.log("2 yupResult=", yupResult);
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
                // console.log("StringCol=", StringCol);
                yupResult = yup.string();
                if (StringCol.def || StringCol.def === "") {
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
