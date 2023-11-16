//MasterDataFilterComboBox.tsx

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import { ILookup } from "../redux/types/masterdataTypes";
// import { ValueType } from "react-select/lib/types";

interface IMasterDataFilterType {
  type: number;
  display: string | null;
}

interface IMasterDataOptionValue {
  type: number;
  id: number | null;
  display: string;
}

export const MasterDataFilterOptionType = {
  All: { type: 0, display: "(ყველა)" } as IMasterDataFilterType,
  Empty: { type: 1, display: "(ცარიელი)" } as IMasterDataFilterType,
  SomeValue: { type: 2, display: null } as IMasterDataFilterType,
} as const;

type MasterDataFilterComboBoxProps = {
  controlId?: string;
  lookupTable: ILookup[];
  isNullable?: boolean | undefined;
  onChangeValue: (newValue: number | null | undefined) => void;
};

const MasterDataFilterComboBox: FC<MasterDataFilterComboBoxProps> = (props) => {
  const { controlId, lookupTable, isNullable, onChangeValue } = props;
  // console.log("MasterDataFilterComboBox props=", props);

  // const [curValue, setCurValue] = useState<string>(
  //   firstOptionAsDefaultVelue &&
  //     dataMember &&
  //     Array.isArray(dataMember) &&
  //     dataMember.length > 0
  //     ? dataMember[0]
  //     : ""
  // );

  const defaultValue = JSON.stringify({
    type: MasterDataFilterOptionType.All.type,
    id: null,
    display: MasterDataFilterOptionType.All.display,
  } as IMasterDataOptionValue);

  const [curValue, setCurValue] = useState<string>(defaultValue);

  // let dataArray: Array<string> = [] as Array<string>;
  // let dataArrayContainsEmpyValues: boolean = false;

  const masterDataTableSorted = lookupTable
    .slice()
    .sort((a, b) => a.display.localeCompare(b.display));

  //console.log("MasterDataFilterComboBox dataArray=", dataArray);
  // console.log("MasterDataFilterComboBox firstItem=", firstItem);
  // console.log("MasterDataFilterComboBox valueMember=", valueMember);

  // console.log("MasterDataFilterComboBox name=", name);
  // console.log("MasterDataFilterComboBox curValue=", curValue);

  return (
    <Form.Group key={controlId} className="mb-1" as={Row} controlId={controlId}>
      <Col sm="8">
        <Form.Select
          value={curValue}
          onChange={(e) => {
            e.preventDefault();
            // console.log("MasterDataFilterComboBox onChange e=", e);
            // console.log("MasterDataFilterComboBox onChange e.target=", e.target);
            // console.log(
            //   "MasterDataFilterComboBox onChange e.target.value=",
            //   e.target.value
            // );
            // console.log(
            //   "MasterDataFilterComboBox onChange e.target.selectedIndex=",
            //   e.target.selectedIndex
            // );
            // const typeOfValue = typeof e.target.value;
            // console.log("MasterDataFilterComboBox onChange typeOfValue=", typeOfValue);

            // console.log("MasterDataFilterComboBox onChange e.target.selectedIndex=", e.target.selectedIndex);
            // console.log(
            //   "MasterDataFilterComboBox onChange e.target.value=",
            //   e.target.value === "" ? undefined : e.target.value
            // );
            // const sel = e.target as select.
            const newValue = e.target.value; // === "" ? undefined : e.target.value;
            setCurValue(newValue);

            const newOptionValue = newValue
              ? (JSON.parse(newValue) as IMasterDataOptionValue)
              : null;

            let returnValue: any = undefined;
            if (newOptionValue) {
              if (newOptionValue.type === 1) returnValue = null;
              if (newOptionValue.type > 1) returnValue = newOptionValue.id;
            }
            onChangeValue(returnValue);
          }}
        >
          <option
            key={MasterDataFilterOptionType.All.display}
            value={defaultValue}
          >
            {MasterDataFilterOptionType.All.display}
          </option>
          {isNullable && (
            <option
              key={MasterDataFilterOptionType.Empty.display}
              value={JSON.stringify({
                type: MasterDataFilterOptionType.Empty.type,
                id: null,
                display: MasterDataFilterOptionType.Empty.display,
              } as IMasterDataOptionValue)}
            >
              {MasterDataFilterOptionType.Empty.display}
            </option>
          )}
          {masterDataTableSorted &&
            masterDataTableSorted.map((mdItm) => (
              <option
                key={mdItm.key}
                value={JSON.stringify({
                  type: MasterDataFilterOptionType.SomeValue.type,
                  id: mdItm.id,
                  display: mdItm.display,
                } as IMasterDataOptionValue)}
              >
                {mdItm.display}
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
            setCurValue(defaultValue);
            onChangeValue(undefined);
          }}
        >
          <FontAwesomeIcon icon="minus" />
        </Button>
      </Col>
    </Form.Group>
  );
};

export default MasterDataFilterComboBox;
