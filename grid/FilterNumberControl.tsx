//FilterNumberControl.tsx

import { FC, useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import FilterButton from "./FilterButton";
import { NzInt } from "../common/myFunctions";

type FilterNumberControlProps = {
  controlId?: string;
  isNullable?: boolean | undefined;
  onChangeValue: (newValue: number | null | undefined) => void;
};

const FilterNumberControl: FC<FilterNumberControlProps> = (props) => {
  const { controlId, isNullable, onChangeValue } = props;
  // console.log("FilterNumberControl props=", props);

  const [curValue, setCurValue] = useState<number | null | undefined>(
    undefined
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const newStrValue = e.target.value; // === "" ? undefined : e.target.value;

    if (newStrValue === "") {
      setCurValue(undefined);
      onChangeValue(undefined);
    } else {
      const newValue = NzInt(newStrValue);
      setCurValue(newValue);
      onChangeValue(newValue);
    }
  }

  function handleButtonClick() {
    if (curValue === undefined && isNullable) {
      setCurValue(null);
      onChangeValue(null);
    } else {
      setCurValue(undefined);
      onChangeValue(undefined);
    }
  }

  return (
    <Form.Group key={controlId} className="mb-1" as={Row} controlId={controlId}>
      <Col sm="8">
        <Form.Control
          type="number"
          value={curValue ?? ""}
          onChange={handleChange}
          autoComplete="off"
        />
      </Col>
      <Col sm="1">
        <FilterButton onButtonClick={handleButtonClick}></FilterButton>
      </Col>
    </Form.Group>
  );
};

export default FilterNumberControl;
