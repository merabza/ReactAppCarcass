//SsoRedirect.tsx

import { type FC, useEffect } from "react";
import { Alert, Spinner } from "react-bootstrap";

import { browserNavigation } from "./authMode";

//Sso რეჟიმში აპის შესვლისა და პაროლის გვერდები აღარ გამოიყენება: ბრაუზერი sso.ltg.ge-ის შესაბამის გვერდზე
//(ან ჰოსტის /bff/login-ზე) გადადის. to = null ნიშნავს, რომ sso-ს მისამართი (VITE_SSO_URL) მითითებული არ არის
const SsoRedirect: FC<{ to: string | null }> = ({ to }) => {
    useEffect(() => {
        if (to) browserNavigation.replace(to);
    }, [to]);

    if (!to) {
        return (
            <Alert variant="danger" className="m-3">
                sso.ltg.ge-ის მისამართი (VITE_SSO_URL) მითითებული არ არის
            </Alert>
        );
    }

    return (
        <div className="m-3">
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> გადამისამართება...
        </div>
    );
};

export default SsoRedirect;
