//OneSaveCancelButtons.tsx

import { Row, Col, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FC } from "react";

type OneSaveCancelButtonsProps = {
    curIdVal: number | undefined;
    haveErrors: boolean;
    savingNow: boolean;
    onCloseClick?: () => void;
    allowEdit?: boolean;
};

const OneSaveCancelButtons: FC<OneSaveCancelButtonsProps> = (props) => {
    const { curIdVal, haveErrors, savingNow, onCloseClick, allowEdit } = props;

    // console.log("OneSaveCancelButtons props=", props);

    return (
        <Row className="mb-1 mt-1">
            <Col sm="10" align="right">
                {allowEdit && (
                    <Button
                        type="submit"
                        className="mr-1"
                        disabled={haveErrors}
                    >
                        <FontAwesomeIcon icon="save" />
                        {curIdVal ? " შენახვა" : " შექმნა"}
                        {savingNow && (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        )}
                    </Button>
                )}
                {!!onCloseClick && (
                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            e.preventDefault();
                            onCloseClick();
                        }}
                    >
                        <FontAwesomeIcon icon="window-close" /> უარი
                    </Button>
                )}
            </Col>
        </Row>
    );
};

export default OneSaveCancelButtons;
