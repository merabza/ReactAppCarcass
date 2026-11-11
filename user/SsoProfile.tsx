//SsoProfile.tsx

import type { FC } from "react";
import { Alert, Button, Col, Row, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useAppSelector } from "../redux/hooks";
import { ssoAccountPages, ssoPageUrl } from "../common/authMode";

//Sso რეჟიმის პროფილი: ანგარიში sso.ltg.ge-ზე იმართება (სახელი და გვარი, მომხმარებლის სახელი, ელფოსტა, პაროლი და
//ანგარიშის გაუქმება, G15), აქ მხოლოდ მონაცემები და ბმული ჩანს. sso-ზე შეცვლილი მონაცემები აპში შემდეგი შესვლისას
//აისახება (D13)
const SsoProfile: FC = () => {
    const user = useAppSelector((state) => state.userState.user);
    const accountUrl = ssoPageUrl(ssoAccountPages.profile);

    if (!user) return null;

    return (
        <Row id="SsoProfile">
            <Col md="6">
                <Table size="sm" borderless>
                    <tbody>
                        <tr>
                            <th scope="row">მომხმარებელი</th>
                            <td>{user.userName}</td>
                        </tr>
                        <tr>
                            <th scope="row">ელფოსტა</th>
                            <td>{user.email}</td>
                        </tr>
                        <tr>
                            <th scope="row">სახელი</th>
                            <td>{user.firstName}</td>
                        </tr>
                        <tr>
                            <th scope="row">გვარი</th>
                            <td>{user.lastName}</td>
                        </tr>
                        <tr>
                            <th scope="row">როლები</th>
                            <td>{user.roleName || "—"}</td>
                        </tr>
                    </tbody>
                </Table>
                {accountUrl ? (
                    <Button href={accountUrl} variant="primary">
                        <FontAwesomeIcon icon="user" /> ანგარიშის მართვა sso.ltg.ge-ზე
                    </Button>
                ) : (
                    <Alert variant="danger">sso.ltg.ge-ის მისამართი (VITE_SSO_URL) მითითებული არ არის</Alert>
                )}
                <p className="text-muted mt-3">
                    სახელის, გვარის, მომხმარებლის სახელის, ელფოსტისა და პაროლის შეცვლა და ანგარიშის გაუქმება
                    sso.ltg.ge-ზე ხდება. ცვლილებები აქ შემდეგი შესვლისას გამოჩნდება.
                </p>
            </Col>
        </Row>
    );
};

export default SsoProfile;
