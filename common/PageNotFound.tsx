//PageNotFound.tsx

import { FC } from "react";
import { Link } from "react-router-dom";

const PageNotFound: FC = () => {
  return (
    <div>
      <h1 style={{ color: "red", fontSize: 100 }}>404</h1>
      <h3>გვერდი არ არსებობს</h3>
      <p>
        <Link to="/">საწყისი გვერდი</Link>
      </p>
    </div>
  );
};

export default PageNotFound;
