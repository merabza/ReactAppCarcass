//FilterButton.tsx

import { FC } from "react";
import { Button } from "react-bootstrap";

type FilterButtonProps = {
  onButtonClick: () => void;
};

const FilterButton: FC<FilterButtonProps> = (props) => {
  const { onButtonClick } = props;
  // console.log("FilterButton props=", props);

  function handleButtonClick(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.preventDefault();
    onButtonClick();
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleButtonClick}>
      {/* <FontAwesomeIcon icon="minus" /> */}
      <svg width="14" height="14" viewBox="0 0 14 14">
        <path d="M13.222 2H.778C.348 2 0 1.552 0 1s.348-1 .778-1h12.444c.43 0 .778.448.778 1s-.348 1-.778 1zM1.556 3.111l3.888 4.667v5.444c0 .43.349.778.778.778h1.556c.43 0 .778-.348.778-.778V7.778l3.888-4.667H1.556z"></path>
      </svg>
    </Button>
  );
};

export default FilterButton;
