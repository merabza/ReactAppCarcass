//YesNoColumn.tsx

import type { FC } from "react";

type YesNoColumnProps = {
    value?: boolean;
};

const YesNoColumn: FC<YesNoColumnProps> = (props): any => {
    const { value } = props;

    // console.log("YesNoColumn props=", props);
    // console.log("YesNoColumn value=", value);

    if (value === true) return "დიახ";
    if (value === false) return "არა";
    return value;
};

export default YesNoColumn;
