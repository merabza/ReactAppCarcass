//WaitPage.tsx

import type { FC } from "react";
import { Spinner } from "react-bootstrap";

const WaitPage: FC = () => {
    return (
        <div className="jumbotron">
            <div className="container">
                <div className="col-sm-8 col-sm-offset-2">
                    <Spinner animation="border" role="status" />
                    <h3>მოიცადე...</h3>
                </div>
            </div>
        </div>
    );
};

export default WaitPage;
