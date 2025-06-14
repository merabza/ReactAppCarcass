//useScroller.ts

import { useCallback, useEffect, useState } from "react";
import equal from "fast-deep-equal";

export function useScroller<T>(
    scrollTo: T
): [T | null, (node: HTMLElement | HTMLLIElement | null) => void] {
    const [curscrollTo, setCurscrollTo] = useState<T | null>(null);

    const backLigth = useCallback(
        (node: HTMLElement | HTMLLIElement | null) => {
            if (node) {
                node.scrollIntoView({ block: "center", inline: "nearest" });
            }
        },
        []
    );

    useEffect(() => {
        if (equal(curscrollTo, scrollTo)) return;
        setCurscrollTo(scrollTo);
    }, [scrollTo, curscrollTo]);

    return [curscrollTo, backLigth];
}
