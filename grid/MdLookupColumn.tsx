//MdLookupColumn.tsx

import { FC } from "react";
import { ILookup } from "../redux/types/masterdataTypes";

type MdLookupColumnProps = {
  lookupTable: ILookup[];
  value?: any;
};

const MdLookupColumn: FC<MdLookupColumnProps> = (props) => {
  const { lookupTable, value } = props;

  // console.log("MdLookupColumn props=", props);
  // console.log("MdLookupColumn value=", value);

  if (!!lookupTable) {
    const fval = lookupTable.find((mdItm) => mdItm.id === value);
    if (!!fval && !!fval.display) return fval.display;
  }

  return value;
};

export default MdLookupColumn;
