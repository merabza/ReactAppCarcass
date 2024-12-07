//DateTimeColumn.tsx

import moment from "moment";
import { FC } from "react";

type DateTimeColumnProps = {
  showDate: boolean;
  showTime: boolean;
  value?: any;
};

const DateTimeColumn: FC<DateTimeColumnProps> = (props) => {
  const { showDate, showTime, value } = props;

  //console.log("DateTimeColumn props=", props);
  //console.log("DateTimeColumn value=", value);

  if (!showDate && !showTime) return value;

  const strFormat = `${showDate ? "DD-MMM-YYYY" : ""} ${
    showTime ? "HH:mm:ss" : ""
  }`;
  return moment(value).format(strFormat);
};

export default DateTimeColumn;
