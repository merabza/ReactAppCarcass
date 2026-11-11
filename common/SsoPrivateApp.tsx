//SsoPrivateApp.tsx

import { type FC, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Alert, Button } from "react-bootstrap";

import { useLazyGetBffUserQuery } from "../redux/api/userRightsApi";
import { useAppSelector } from "../redux/hooks";
import WaitPage from "./WaitPage";

function isUnauthorized(error: unknown): boolean {
    return typeof error === "object" && error !== null && "status" in error && error.status === 401;
}

//Sso რეჟიმის PrivateApp: მომხმარებელი ჰოსტის /bff/user-იდან მოდის (ტოკენი ბრაუზერში არ არის). სესიის გარეშე
//jwtBaseQuery ბრაუზერს /bff/login-ზე გადაიყვანს. სხვა შეცდომაზე (ჰოსტი მიუწვდომელია) შეტყობინება ჩანს და არა
//გადამისამართება, რომ ბრაუზერი გადამისამართებების წრეში არ მოხვდეს
const SsoPrivateApp: FC = () => {
    const { user, userValidationChecked } = useAppSelector((state) => state.userState);
    const [loadUser, { isError, isFetching, error }] = useLazyGetBffUserQuery();

    useEffect(() => {
        if (!userValidationChecked) loadUser();
    }, [userValidationChecked, loadUser]);

    if (user) {
        return (
            <div>
                <Outlet />
            </div>
        );
    }

    if (isError && !isFetching && !isUnauthorized(error)) {
        return (
            <Alert variant="danger" className="m-3">
                მომხმარებლის მონაცემები ვერ ჩაიტვირთა. სცადეთ მოგვიანებით.{" "}
                <Button variant="outline-danger" size="sm" onClick={() => loadUser()}>
                    თავიდან ცდა
                </Button>
            </Alert>
        );
    }

    return <WaitPage />;
};

export default SsoPrivateApp;
