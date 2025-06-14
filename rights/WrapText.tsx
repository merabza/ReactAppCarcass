//WrapText.tsx

import type { FC } from "react";
import { useAppSelector } from "../redux/hooks";

type WrapTextProps = {
    text: string;
};

const WrapText: FC<WrapTextProps> = ({ text }) => {
    const searchText = useAppSelector((state) => state.rightsState.searchText);

    if (!searchText) return <span>{text}</span>;

    const wparts = text.split(searchText);
    const strongpart = <strong>{searchText}</strong>;

    return (
        <>
            {wparts.map((itm, indx) => {
                if (indx === 0) return <span key={indx}>{itm}</span>;
                return (
                    <span key={indx}>
                        {strongpart}
                        {itm}
                    </span>
                );
            })}
        </>
    );
};

export default WrapText;
