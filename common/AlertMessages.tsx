//AlertMessages.tsx

import { FC } from "react";
import { Alert } from "react-bootstrap";
import { useAppSelector } from "../redux/hooks";
import { EAlertKind } from "../redux/slices/alertSlice";

type AlertMessagesProps = { alertKind: EAlertKind };

const AlertMessages: FC<AlertMessagesProps> = (props) => {
  const { alertKind } = props;
  const { alert } = useAppSelector((state) => state.alertState);

  // console.log("AlertMessages alertKind=", alertKind);
  // console.log("AlertMessages alert=", alert);

  if (
    EAlertKind[alertKind] in alert &&
    alert[EAlertKind[alertKind]] &&
    alert[EAlertKind[alertKind]].length > 0
  )
    // console.log(
    //   "AlertMessages alert[EAlertKind[alertKind]]=",
    //   alert[EAlertKind[alertKind]]
    // );

    return (
      <div>
        {alert[EAlertKind[alertKind]].map((err, index) => {
          // console.log("AlertMessages map err=", err);
          // console.log("AlertMessages map index=", index);
          // console.log("AlertMessages map err.errorMessage=", err.errorMessage);
          return (
            <Alert key={`${EAlertKind[alertKind]}${index}`} variant="danger">
              {err.errorMessage}
            </Alert>
          );
        })}
      </div>
    );

  return <></>;
};

export default AlertMessages;
