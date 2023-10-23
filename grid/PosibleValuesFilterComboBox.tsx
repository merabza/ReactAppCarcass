//PosibleValuesFilterComboBox.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

interface IFilterOption {
  optionValue: number;
  optionDisplay: string | null;
}

export const FilterOptionType = {
  All: { optionValue: 0, optionDisplay: "(ყველა)" } as IFilterOption,
  Empty: { optionValue: 1, optionDisplay: "(ცარიელი)" } as IFilterOption,
  SomeValue: { optionValue: 2, optionDisplay: null } as IFilterOption,
} as const;

type PosibleValuesFilterComboBoxProps = {
  controlId?: string;
  dataMember?: Array<any>;
  onChangeValue: (newValue: any) => void;
};

const PosibleValuesFilterComboBox: FC<PosibleValuesFilterComboBoxProps> = (
  props
) => {
  const { controlId, dataMember, onChangeValue } = props;
  // console.log("PosibleValuesFilterComboBox props=", props);

  // const [curValue, setCurValue] = useState<string>(
  //   firstOptionAsDefaultVelue &&
  //     dataMember &&
  //     Array.isArray(dataMember) &&
  //     dataMember.length > 0
  //     ? dataMember[0]
  //     : ""
  // );

  const [curValue, setCurValue] = useState<number>(0);

  let dataArray: Array<string> = [] as Array<string>;
  let dataArrayContainsEmpyValues: boolean = false;
  if (dataMember && Array.isArray(dataMember)) {
    //მოწოდებულია მასივი და მასტერდატაში ნახვა საჭირო აღარ არის.

    // console.log("PosibleValuesFilterComboBox needSort=", needSort);
    dataArrayContainsEmpyValues =
      dataMember.includes(null) || dataMember.includes("");
    dataArray = dataMember
      .filter((f) => !!f && f !== "")
      //.sort((a, b) => a.toString().localeCompare(b.toString()));
      .sort();
  }
  //console.log("PosibleValuesFilterComboBox dataArray=", dataArray);
  // console.log("PosibleValuesFilterComboBox firstItem=", firstItem);
  // console.log("PosibleValuesFilterComboBox valueMember=", valueMember);

  // console.log("PosibleValuesFilterComboBox name=", name);
  // console.log("PosibleValuesFilterComboBox curValue=", curValue);

  return (
    <Form.Group key={controlId} className="mb-1" as={Row} controlId={controlId}>
      <Col sm="8">
        <Form.Select
          value={curValue}
          onChange={(e) => {
            e.preventDefault();
            // console.log("PosibleValuesFilterComboBox onChange e=", e);
            // console.log("PosibleValuesFilterComboBox onChange e.target=", e.target);
            // console.log(
            //   "PosibleValuesFilterComboBox onChange e.target.value=",
            //   e.target.value
            // );
            // console.log(
            //   "PosibleValuesFilterComboBox onChange e.target.selectedIndex=",
            //   e.target.selectedIndex
            // );
            // const typeOfValue = typeof e.target.value;
            // console.log("PosibleValuesFilterComboBox onChange typeOfValue=", typeOfValue);

            // console.log("PosibleValuesFilterComboBox onChange e.target.selectedIndex=", e.target.selectedIndex);
            // console.log(
            //   "PosibleValuesFilterComboBox onChange e.target.value=",
            //   e.target.value === "" ? undefined : e.target.value
            // );
            // const sel = e.target as select.
            const newValue = parseInt(e.target.value); // === "" ? undefined : e.target.value;
            setCurValue(newValue);
            let returnValue: any = undefined;
            if (newValue === 1) returnValue = null;
            if (newValue > 1) returnValue = dataArray[newValue - 2];
            onChangeValue(returnValue);
          }}
        >
          <option
            key={FilterOptionType.All.optionDisplay}
            value={FilterOptionType.All.optionValue}
          >
            {FilterOptionType.All.optionDisplay}
          </option>
          {dataArrayContainsEmpyValues && (
            <option
              key={FilterOptionType.Empty.optionDisplay}
              value={FilterOptionType.Empty.optionValue}
            >
              {FilterOptionType.Empty.optionDisplay}
            </option>
          )}
          {dataArray &&
            dataArray.map((mdItm, index) => (
              <option
                key={mdItm}
                value={FilterOptionType.SomeValue.optionValue + index}
              >
                {mdItm}
              </option>
            ))}
        </Form.Select>
      </Col>
      <Col sm="1">
        <Button
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            setCurValue(FilterOptionType.All.optionValue);
            onChangeValue(undefined);
          }}
        >
          <FontAwesomeIcon icon="minus" />
        </Button>
      </Col>
    </Form.Group>
  );
};

export default PosibleValuesFilterComboBox;
