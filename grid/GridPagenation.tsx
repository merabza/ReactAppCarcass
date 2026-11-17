//GridPagenation.tsx

import type { FC } from "react";
import { NzInt } from "../common/myFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type GridPagenationProps = {
    offset: number;
    rowsCountPerPage: number;
    allRowsCount: number;
    onChange?: (offset: number, rowsCount: number) => void;
};

const GridPagenation: FC<GridPagenationProps> = (props) => {
    const { offset, rowsCountPerPage, allRowsCount, onChange } = props;

    //ბოლო გვერდი ბოლო ჩანაწერს უნდა შეიცავდეს (21 ჩანაწერი, 10 გვერდზე → წანაცვლება 20)
    const lastPageOffset = Math.max(
        0,
        Math.floor((allRowsCount - 1) / rowsCountPerPage) * rowsCountPerPage
    );

    return (
        <>
            <div className="d-flex align-items-center justify-content-center">
                <div className="form-inline">
                    {" "}
                    გვერდზე ჩანაწერების რაოდენობა:{" "}
                    <select
                        className="ml-1 mr-1"
                        onChange={(e) => {
                            e.preventDefault();
                            const newValue = NzInt(e.target.value, rowsCountPerPage);
                            if (onChange) {
                                onChange(offset, newValue);
                            }
                        }}
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    წანაცვლება:
                    <input
                        className="ml-1 mr-1"
                        autoComplete="off"
                        type="number"
                        style={{
                            width: `${(Math.floor(Math.log10(offset + 1)) + 1) * 9 + 31}px`,
                        }}
                        value={offset}
                        min="0"
                        onChange={(e) => {
                            e.preventDefault();
                            const newValue = NzInt(e.target.value, offset);
                            if (onChange) {
                                onChange(newValue, rowsCountPerPage);
                            }
                        }}
                    />
                </div>
            </div>

            <div className="d-flex align-items-center justify-content-center mt-3">
                <button
                    className="btn-space btn btn-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onChange) {
                            onChange(0, rowsCountPerPage);
                        }
                    }}
                >
                    <FontAwesomeIcon icon="angle-double-left" />
                </button>
                <button
                    className="btn-space btn btn-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onChange) {
                            //პირველი გვერდიდან უკან არ მიდის
                            onChange(Math.max(0, offset - rowsCountPerPage), rowsCountPerPage);
                        }
                    }}
                >
                    <FontAwesomeIcon icon="angle-left" />
                </button>
                <span className="mr-1">
                    ჩანაწერები: {offset + 1}-
                    {offset + rowsCountPerPage > allRowsCount
                        ? allRowsCount
                        : offset + rowsCountPerPage}{" "}
                    სულ: {allRowsCount}{" "}
                </span>
                <button
                    className="btn-space btn btn-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onChange) {
                            //ბოლო გვერდიდან წინ არ მიდის (ცარიელ გვერდზე)
                            onChange(
                                Math.min(offset + rowsCountPerPage, Math.max(offset, lastPageOffset)),
                                rowsCountPerPage
                            );
                        }
                    }}
                >
                    <FontAwesomeIcon icon="angle-right" />
                </button>
                <button
                    className="btn-space btn btn-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        if (onChange) {
                            onChange(lastPageOffset, rowsCountPerPage);
                        }
                    }}
                >
                    <FontAwesomeIcon icon="angle-double-right" />
                </button>
            </div>
        </>
    );
};

export default GridPagenation;
