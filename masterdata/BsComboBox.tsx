//BsComboBox.tsx

import { FC } from "react";
import { Form } from "react-bootstrap";
import { NzInt } from "../common/myFunctions";
import { fnGetError } from "../hooks/useForman";

type BsComboBoxProps = {
  controlId?: string;
  name: string;
  dataMember?: Array<any>;
  valueMember: string;
  displayMember: string;
  secondDisplayMember?: string;
  value?: number | null | undefined;
  error?: string | null | undefined;
  getError?: fnGetError;
  defaultValue?: number;
  onChangeValue: (name: string, newValue: number) => void;
  firstItem?: { id: number; name: string } | undefined;
  firstItemIsSelectable: boolean;
  sortByDisplayMember?: boolean;
};

const BsComboBox: FC<BsComboBoxProps> = (props) => {
  const {
    controlId,
    name,
    dataMember,
    valueMember,
    displayMember,
    secondDisplayMember,
    value,
    error,
    getError,
    defaultValue,
    onChangeValue,
    firstItem,
    firstItemIsSelectable,
    sortByDisplayMember,
  } = props;
  // console.log("BsComboBox props=", props);

  let bsError = error;
  if (!bsError && getError && controlId) bsError = getError(controlId);

  const defValue = defaultValue || defaultValue === 0 ? defaultValue : -1;
  const needSort =
    sortByDisplayMember === undefined ? true : sortByDisplayMember;

  let dataArray = null;
  if (dataMember && Array.isArray(dataMember)) {
    //მოწოდებულია მასივი და მასტერდატაში ნახვა საჭირო აღარ არის.
    dataArray = dataMember;
  }

  // console.log("BsComboBox needSort=", needSort);
  if (needSort && dataArray)
    dataArray = dataArray
      .slice()
      .sort((a, b) =>
        (!!a[displayMember] ? a[displayMember] : "").localeCompare(
          !!b[displayMember] ? b[displayMember] : ""
        )
      );

  // console.log("BsComboBox dataArray=", dataArray);
  // console.log("BsComboBox firstItem=", firstItem);
  // console.log("BsComboBox valueMember=", valueMember);

  return (
    <Form.Control
      as="select"
      value={value || value === 0 ? value.toString() : defValue.toString()}
      className={!!bsError ? "is-invalid" : undefined}
      onChange={(e) => {
        e.preventDefault();
        const newValue = NzInt(e.target.value, defValue);
        if (firstItem && !firstItemIsSelectable && firstItem.id === newValue)
          return;
        onChangeValue(name, newValue);
      }}
    >
      {firstItem && (
        <option key={firstItem.id} value={firstItem.id}>
          {firstItem.name}
        </option>
      )}
      {dataArray &&
        dataArray.map((mdItm) => {
          // console.log("BsComboBox dataArray.map mdItm=", mdItm);
          // console.log("BsComboBox dataArray.map index=", index);
          return (
            <option key={mdItm[valueMember]} value={mdItm[valueMember]}>
              {mdItm[displayMember]}
              {secondDisplayMember && `-${mdItm[secondDisplayMember]}`}
            </option>
          );
        })}
    </Form.Control>
  );
};

export default BsComboBox;
