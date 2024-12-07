//CheckboxColumn.tsx

import { Spinner } from "react-bootstrap";
import { FC } from "react";

type CheckboxColumnProps = {
  idFieldName: string;
  changing?: boolean;
  value?: boolean;
  record?: any;
  onChangeValue: (id: number, checked: boolean) => void;
};

const CheckboxColumn: FC<CheckboxColumnProps> = (props) => {
  const { idFieldName, changing, value, record, onChangeValue } = props;
  //console.log("CheckboxColumn props=", props);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { checked } = e.target;
    onChangeValue(record[idFieldName], checked);
  }

  if (changing)
    return (
      <Spinner as="span" animation="border" role="status" aria-hidden="true" />
    );

  return (
    <input
      type="checkbox"
      className="form-check-input"
      checked={value}
      onChange={handleChange}
    ></input>
  );
};

export default CheckboxColumn;
