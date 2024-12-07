//CustomColumn.tsx

import { FC } from "react";
// import { IRecord } from "./IssueTypes";

type CustomColumnProps = {
  value?: string;
  record?: any;
  index?: number;
  offset?: number;
  showRows?: number;
  children?: React.ReactNode | string;
  onGetCell?: (
    value?: string,
    record?: any,
    index?: number,
    offset?: number,
    showRows?: number
  ) => React.ReactNode;
};

const CustomColumn: FC<CustomColumnProps> = (props) => {
  const { value, record, index, offset, showRows, onGetCell } = props;

  if (onGetCell)
    return <>{onGetCell(value, record, index, offset, showRows)}</>;

  return <>{value}</>;
};

export default CustomColumn;
