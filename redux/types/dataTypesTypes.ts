//dataTypesTypes.ts

export interface DataTypeFfModel {
    dtTable: string;
    dtName: string;
    dtNameNominative: string;
    dtNameGenitive: string;
    idFieldName: string;
    keyFieldName: string | null;
    nameFieldName: string | null;
    create: boolean;
    update: boolean;
    delete: boolean;
}
