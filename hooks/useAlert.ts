//useAlert.ts

import { useAppSelector } from "../redux/hooks";
import { EAlertKind } from "../redux/slices/alertSlice";

export function useAlert(alertKind: EAlertKind): [haveError: boolean] {
    const { alert } = useAppSelector((state) => state.alertState);
    // console.log("useAlert alert=", alert);
    // console.log("useAlert EAlertKind[alertKind]=", EAlertKind[alertKind]);
    // console.log(
    //   "useAlert alert[EAlertKind[alertKind]]=",
    //   alert[EAlertKind[alertKind]]
    // );

    return [
        EAlertKind[alertKind] in alert &&
            alert[EAlertKind[alertKind]] &&
            alert[EAlertKind[alertKind]].length > 0,
    ];
}
