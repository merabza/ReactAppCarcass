//RowSourceLookupColumn.tsx

import { FC } from "react";

type RowSourceLookupColumnProps = {
  rowSource: string;
  value?: any;
};

const RowSourceLookupColumn: FC<RowSourceLookupColumnProps> = (props) => {
  const { rowSource, value } = props;

  // console.log("RowSourceLookupColumn props=", props);
  // console.log("RowSourceLookupColumn value=", value);

  var rsarr = rowSource.split(";");
  var ind = rsarr.indexOf(value.toString()) + 1;
  if (ind > 0 && ind < rsarr.length && !!rsarr[ind]) return rsarr[ind];
  return value;
};

export default RowSourceLookupColumn;
