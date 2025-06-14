//LookupColumn.tsx

import type { FC } from "react";
import type { ILookup } from "../redux/types/masterdataTypes";

type lookupColumnProps = {
    lookupTable: ILookup[];
    value?: any;
};

const LookupColumn: FC<lookupColumnProps> = (props) => {
    const { lookupTable, value } = props;

    // console.log("LookupColumn props=", props);
    // console.log("LookupColumn value=", value);

    if (!!lookupTable) {
        const fval = lookupTable.find((mdItm) => mdItm.id === value);
        if (!!fval && !!fval.name) return fval.name;
    }

    return value;
};

export default LookupColumn;
