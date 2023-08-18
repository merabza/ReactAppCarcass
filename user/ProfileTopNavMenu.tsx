//ProfileTopNavMenu.tsx

import { FC, useState } from "react";
import { Nav, Button, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ChangePasswordModal from "./ChangePasswordModal";
import MessageBox from "../common/MessageBox";
import { useDeleteCurrentUserMutation } from "../redux/api/userRightsApi";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { IdeleteCurrentUserParameters } from "../redux/types/userRightsTypes";

const ProfileTopNavMenu: FC = () => {
  const [showDeleteConfirmMessage, setShowDeleteConfirmMessage] =
    useState(false);
  const [changePasswordModalShow, setChangePasswordModalShow] = useState(false);
  const [deleteCurrentUser, { isLoading: deletingRegistation }] =
    useDeleteCurrentUserMutation();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.userState);

  return (
    <Nav>
      <Nav className="mr-auto">
        <Button
          variant="warning"
          className="btn-space"
          onClick={() => {
            setChangePasswordModalShow(true);
          }}
        >
          <FontAwesomeIcon icon="key" /> პაროლის შეცვლა
        </Button>

        <ChangePasswordModal
          show={changePasswordModalShow}
          onHide={() => setChangePasswordModalShow(false)}
        />

        <Button
          variant="danger"
          className="btn-space"
          onClick={(e) => {
            e.preventDefault();
            setShowDeleteConfirmMessage(true);
          }}
        >
          <FontAwesomeIcon icon="user-minus" /> ანგარიშის წაშლა
          {deletingRegistation && (
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            />
          )}
        </Button>
      </Nav>
      <MessageBox
        show={showDeleteConfirmMessage}
        title="იშლება თქვენი ანგარიში"
        text="წაშლილი ანგარიშის აღდგენა ვეღარ მოხდება. დარწმუნებული ხართ, რომ გსურთ წაშალოთ თქვენი ანგარიში?"
        primaryButtonText="დიახ"
        secondaryButtonText="არა"
        onConfirmed={() => {
          setShowDeleteConfirmMessage(false);
          //დადგინდეს მიმდინარე მომხმარებლის იდენტიფიკატორი
          //გაიგზავნოს სერვერზე ანგარიშის წაშლის მოთხოვნა
          if (user)
            deleteCurrentUser({
              navigate,
              userName: user.userName,
            } as IdeleteCurrentUserParameters);
        }}
        onClosed={() => setShowDeleteConfirmMessage(false)}
      />
    </Nav>
  );
};

export default ProfileTopNavMenu;
