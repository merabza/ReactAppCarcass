//GridTableHeader.tsx

import type { FC } from "react";
import type { IGridColumn, ISortField } from "./GridViewTypes";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconName } from "@fortawesome/fontawesome-svg-core";
import MasterDataFilterComboBox from "./MasterDataFilterComboBox";
import FilterTextBox from "./FilterTextBox";
import FilterNumberControl from "./FilterNumberControl";
import FilterYesNoComboBox from "./FilterYesNoComboBox";

type GridTableHeaderProps = {
    showCountColumn: boolean;
    columns: IGridColumn[];
    sortFieldNames: ISortField[];
    toggleSortForColumn: (fieldName: string, shiftKeyIsUsed: boolean) => void;
    changeFilterField: (fieldName: string, value: any) => void;
};

const GridTableHeader: FC<GridTableHeaderProps> = (props) => {
    const { showCountColumn, columns, sortFieldNames, toggleSortForColumn, changeFilterField } =
        props;

    // const [curSortFieldNames, setCurSortFieldNames] = useState<ISortField[]>(

    return (
        <thead>
            <tr>
                {!!showCountColumn && (
                    <th>
                        <span>N</span>
                    </th>
                )}
                {columns
                    .filter((col) => col.visible)
                    .map((col) => {
                        const caption = col.caption ? col.caption : "";
                        const sortable = !!col.sortable;

                        // console.log("GridView getTableHeader col=", col);
                        // console.log("GridView getTableHeader caption=", caption);

                        if (sortable) {
                            let ascDescVal = 0;
                            const sortField = sortFieldNames.find(
                                (f) => f.fieldName === col.fieldName
                            );
                            if (sortField) ascDescVal = sortField.ascending ? 1 : -1;

                            let sortIconName = "sort";
                            if (ascDescVal > 0) sortIconName = "sort-up";
                            else if (ascDescVal < 0) sortIconName = "sort-down";
                            return (
                                <th key={caption}>
                                    <Link
                                        to="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleSortForColumn(col.fieldName, e.shiftKey);
                                        }}
                                    >
                                        {caption}{" "}
                                        <FontAwesomeIcon icon={sortIconName as IconName} />
                                    </Link>
                                    {!!(col.dropdownOptions && col.dropdownOptions.length > 0) && (
                                        <MasterDataFilterComboBox
                                            controlId={col.fieldName}
                                            dropdownOptions={col.dropdownOptions}
                                            isNullable={col.nullable}
                                            onChangeValue={(
                                                newValue: number | null | undefined
                                            ) => {
                                                changeFilterField(col.fieldName, newValue);
                                            }}
                                        ></MasterDataFilterComboBox>
                                    )}
                                    {col.typeName === "String" && (
                                        <FilterTextBox
                                            controlId={col.fieldName}
                                            isNullable={col.nullable}
                                            onChangeValue={(
                                                newValue: string | null | undefined
                                            ) => {
                                                changeFilterField(col.fieldName, newValue);
                                            }}
                                        ></FilterTextBox>
                                    )}
                                    {col.typeName === "Integer" && (
                                        <FilterNumberControl
                                            controlId={col.fieldName}
                                            isNullable={col.nullable}
                                            onChangeValue={(
                                                newValue: number | null | undefined
                                            ) => {
                                                changeFilterField(col.fieldName, newValue);
                                            }}
                                        ></FilterNumberControl>
                                    )}
                                    {col.typeName === "Boolean" && (
                                        <FilterYesNoComboBox
                                            controlId={col.fieldName}
                                            isNullable={col.nullable}
                                            onChangeValue={(
                                                newValue: boolean | null | undefined
                                            ) => {
                                                changeFilterField(col.fieldName, newValue);
                                            }}
                                        ></FilterYesNoComboBox>
                                    )}
                                </th>
                            );
                        } else {
                            return (
                                <th key={caption}>
                                    <span>{caption}</span>
                                </th>
                            );
                        }
                    })}
            </tr>
        </thead>
    );
};
export default GridTableHeader;
