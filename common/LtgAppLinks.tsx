//LtgAppLinks.tsx

import type { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

import { type ILtgApp, useLtgApps } from "./ltgApps";

//სხვა LTG აპის ბმული იმავე ჩანართში: აპი sso-ს სესიით პაროლის გარეშე შედის (G8)
export const LtgAppLink: FC<{ app: ILtgApp }> = ({ app }) => (
    <a href={app.url}>
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> {app.name}
    </a>
);

//სხვა LTG აპების სია საწყისი გვერდისთვის; Local რეჟიმში, ცარიელი სიით ან შეცდომისას არაფერი ჩანს
const LtgAppLinks: FC<{ title?: string }> = ({ title = "LTG-ის სხვა აპები" }) => {
    const apps = useLtgApps();
    if (apps.length === 0) return null;

    return (
        <section aria-label={title}>
            <h5>{title}</h5>
            <ul className="list-unstyled">
                {apps.map((app) => (
                    <li key={app.url}>
                        <LtgAppLink app={app} />
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default LtgAppLinks;
