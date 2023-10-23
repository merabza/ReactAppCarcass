//MdLookupColumn.tsx

import { FC } from "react";

type MdLookupColumnProps = {
  dataTable: any[];
  valueMember?: string | null;
  displayMember?: string | null;
  value?: number;
};

const MdLookupColumn: FC<MdLookupColumnProps> = (props) => {
  const { dataTable, valueMember, displayMember, value } = props;

  // console.log("MdLookupColumn props=", props);
  // console.log("MdLookupColumn value=", value);

  if (!!valueMember && !!displayMember && !!dataTable) {
    const fval = dataTable.find((mdItm) => mdItm[valueMember] === value);
    if (!!fval && !!fval[displayMember]) return fval[displayMember];
  }

  return value;
};

export default MdLookupColumn;
