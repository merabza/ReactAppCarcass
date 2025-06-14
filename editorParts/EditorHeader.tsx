//EditorHeader.tsx

import { type FC, useState } from "react";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MessageBox from "../common/MessageBox";

type EditorHeaderRowProps = {
    EditorName: string;
    EditorNameGenitive: string;
    EditedObjectName: string;
    curIdVal: number | undefined;
    workingOnDelete: boolean;
    DeleteFailure: boolean;
    onDelete: () => void;
    onClearDeletingFailure?: () => void;
    allowDelete: boolean;
};

const EditorHeader: FC<EditorHeaderRowProps> = (props) => {
    const [showDeleteConfirmMessage, setShowDeleteConfirmMessage] =
        useState(false);

    const {
        EditorName,
        EditorNameGenitive,
        EditedObjectName,
        curIdVal,
        workingOnDelete,
        DeleteFailure,
        onDelete,
        onClearDeletingFailure,
        allowDelete,
    } = props;
    //console.log("EditorHeader props=", props);

    return (
        <div>
            {curIdVal !== undefined && (
                <Row className="ml-1 mb-1 mt-1">
                    <Col sm="6">
                        <h5>{`${EditorNameGenitive} რედაქტორი`}</h5>
                    </Col>
                    <Col sm="4" align="right">
                        {allowDelete && (
                            <Button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowDeleteConfirmMessage(true);
                                }}
                                variant="danger"
                            >
                                <FontAwesomeIcon icon="trash" />
                                {` ამ ${EditorNameGenitive}  წაშლა`}
                                {workingOnDelete && (
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
                    </Col>
                </Row>
            )}

            {curIdVal !== undefined && (
                <MessageBox
                    show={showDeleteConfirmMessage}
                    title={`იშლება ${EditorName}`}
                    text={`დარწმუნებული ხართ, რომ გსურთ წაშალოთ ${EditorName} "${EditedObjectName}"`}
                    primaryButtonText="დიახ"
                    secondaryButtonText="არა"
                    onConfirmed={() => {
                        setShowDeleteConfirmMessage(false);
                        onDelete();
                    }}
                    onClosed={() => setShowDeleteConfirmMessage(false)}
                />
            )}

            {curIdVal !== undefined && (
                <MessageBox
                    show={DeleteFailure}
                    title="შეცდომა"
                    text={`${EditorNameGenitive} წაშლაისას მოხდა შეცდომა, წაშლა ვერ მოხერხდა`}
                    primaryButtonText="კარგი"
                    onConfirmed={() => {
                        if (onClearDeletingFailure) onClearDeletingFailure();
                    }}
                    onClosed={() => {
                        if (onClearDeletingFailure) onClearDeletingFailure();
                    }}
                />
            )}

            {curIdVal === undefined && (
                <Row>
                    <Col sm="10">
                        <Form.Label>
                            <h5>{`იქმნება ახალი ${EditorName}`}</h5>
                        </Form.Label>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default EditorHeader;
