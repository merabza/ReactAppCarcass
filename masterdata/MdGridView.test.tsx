//MdGridView.test.tsx

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import MdGridView from "./MdGridView";
import { dataTypesApi } from "../redux/api/dataTypesApi";
import { masterdataApi } from "../redux/api/masterdataApi";
import alertReducer from "../redux/slices/alertSlice";
import appParametersReducer from "../redux/slices/appParametersSlice";
import dataTypesReducer from "../redux/slices/dataTypesSlice";
import masterDataReducer, { type IMasterDataState } from "../redux/slices/masterdataSlice";
import userReducer, { setUser } from "../redux/slices/userSlice";
import type { IAppUser } from "../redux/types/authenticationTypes";
import type { DataTypeFfModel } from "../redux/types/dataTypesTypes";
import type { GridModel } from "../redux/types/gridTypes";
import { type FetchCall, type FetchReply, mockFetch, testBaseUrl } from "../../testUtils/testStore";

const thingsDataType: DataTypeFfModel = {
    dtTable: "Things",
    dtName: "ნივთები",
    dtNameNominative: "ნივთი",
    dtNameGenitive: "ნივთის",
    idFieldName: "thingId",
    keyFieldName: null,
    nameFieldName: "name",
    create: true,
    update: true,
    delete: true,
};

const thingsGrid = {
    cells: [
        { typeName: "Integer", fieldName: "thingId", caption: null, visible: false, def: 0 },
        { typeName: "String", fieldName: "name", caption: "სახელი", visible: true },
    ],
} as unknown as GridModel;

const loadedLists: Partial<IMasterDataState> = {
    itemEditorTables: { Things: [] },
    itemEditorLookupTables: { Things: [] },
};

const loadingText = "მიმდინარეობს ჩატვირთვა...";

type StoreOptions = {
    dataTypes?: DataTypeFfModel[];
    gridRules?: { [key: string]: GridModel };
    masterData?: Partial<IMasterDataState>;
};

function createStore({ dataTypes = [thingsDataType], gridRules = { Things: thingsGrid }, masterData = loadedLists }: StoreOptions = {}) {
    const store = configureStore({
        reducer: {
            [dataTypesApi.reducerPath]: dataTypesApi.reducer,
            [masterdataApi.reducerPath]: masterdataApi.reducer,
            alertState: alertReducer,
            appParametersState: appParametersReducer,
            dataTypesState: dataTypesReducer,
            masterDataState: masterDataReducer,
            userState: userReducer,
        },
        preloadedState: {
            appParametersState: { appName: "test", baseUrl: testBaseUrl },
            dataTypesState: {
                dataTypes,
                gridsDatas: {},
                gridRules,
                dataTypesByTableNames: Object.fromEntries(dataTypes.map((dt) => [dt.dtTable, dt])),
            },
            masterDataState: { ...masterDataReducer(undefined, { type: "init" }), ...masterData },
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }).concat(
                dataTypesApi.middleware,
                masterdataApi.middleware
            ),
    });
    store.dispatch(setUser({ token: "admin" } as IAppUser));
    return store;
}

// the server answers requests whose path (without the query) is listed; any other request gets a 404
function mockServer(routes: { [request: string]: FetchReply | ((call: FetchCall) => FetchReply | Promise<FetchReply>) }) {
    return mockFetch((call) => {
        const request = `${call.method} ${call.url.replace(testBaseUrl, "").split("?")[0]}`;
        const reply = routes[request];
        if (reply === undefined) return { status: 404, body: { title: "NotFound", detail: request } };
        return typeof reply === "function" ? reply(call) : reply;
    });
}

function never(): Promise<FetchReply> {
    return new Promise<FetchReply>(() => {});
}

function gridOf(store: ReturnType<typeof createStore>, tableName: string) {
    return (
        <Provider store={store}>
            <MemoryRouter>
                <MdGridView tableName={tableName} />
            </MemoryRouter>
        </Provider>
    );
}

function renderGrid(store: ReturnType<typeof createStore>) {
    return render(gridOf(store, "Things"));
}

const othersDataType = { ...thingsDataType, dtTable: "Others", dtName: "სხვები" };

const thingRows = { allRowsCount: 1, offset: 0, rows: [{ thingId: 1, name: "პირველი ნივთი" }] };

describe("MdGridView", () => {
    it("shows the loading indicator, not a problem, while the data types load", async () => {
        const calls = mockServer({ "GET /datatypes/getdatatypes": never, "GET /datatypes/getgridmodel/Things": never });

        renderGrid(createStore({ dataTypes: [], gridRules: {}, masterData: {} }));

        expect(await screen.findByText(loadingText)).toBeInTheDocument();
        expect(screen.queryByText("ჩატვირთვის პრობლემა 2")).not.toBeInTheDocument();
        expect(calls.map((call) => call.url).sort()).toEqual([
            `${testBaseUrl}/datatypes/getdatatypes`,
            `${testBaseUrl}/datatypes/getgridmodel/Things`,
        ]);
    });

    it("shows the loading indicator, not a problem, while the grid rules load", async () => {
        const calls = mockServer({ "GET /datatypes/getgridmodel/Things": never });

        renderGrid(createStore({ gridRules: {}, masterData: {} }));

        expect(await screen.findByText(loadingText)).toBeInTheDocument();
        expect(screen.queryByText("ჩატვირთვის პრობლემა 2")).not.toBeInTheDocument();
        expect(calls.map((call) => call.url)).toEqual([`${testBaseUrl}/datatypes/getgridmodel/Things`]);
    });

    it("draws the list when its data type and grid rules are there", async () => {
        mockServer({
            "GET /masterdata/gettablerowsdata/Things": {
                status: 200,
                body: { allRowsCount: 1, offset: 0, rows: [{ thingId: 1, name: "პირველი ნივთი" }] },
            },
        });

        renderGrid(createStore());

        expect(await screen.findByText("პირველი ნივთი")).toBeInTheDocument();
        expect(screen.getByText("ნივთები")).toBeInTheDocument();
    });

    it("draws the list after the data types and the grid rules load", async () => {
        mockServer({
            "GET /datatypes/getdatatypes": { status: 200, body: [thingsDataType] },
            "GET /datatypes/getgridmodel/Things": { status: 200, body: JSON.stringify(thingsGrid) },
            "GET /masterdata/gettablerowsdata/Things": {
                status: 200,
                body: { allRowsCount: 1, offset: 0, rows: [{ thingId: 1, name: "პირველი ნივთი" }] },
            },
        });

        renderGrid(createStore({ dataTypes: [], gridRules: {}, masterData: {} }));

        expect(await screen.findByText("პირველი ნივთი")).toBeInTheDocument();
    });

    it("reports the load error of the server", async () => {
        mockServer({
            "GET /datatypes/getdatatypes": {
                status: 400,
                body: { title: "Failed", status: 400, detail: "მონაცემთა ტიპები ვერ ჩაიტვირთა" },
            },
            "GET /datatypes/getgridmodel/Things": never,
        });

        renderGrid(createStore({ dataTypes: [], gridRules: {}, masterData: {} }));

        expect(await screen.findByText("მონაცემთა ტიპები ვერ ჩაიტვირთა")).toBeInTheDocument();
        expect(screen.getByText("ჩატვირთვის პრობლემა 1")).toBeInTheDocument();
    });

    it("reports a problem when the table is not among the data types of the user", async () => {
        const calls = mockServer({});

        renderGrid(createStore({ dataTypes: [othersDataType] }));

        expect(await screen.findByText("ჩატვირთვის პრობლემა 2")).toBeInTheDocument();
        expect(calls).toEqual([]);
    });

    it("reports a problem when the server has no grid rules for the table", async () => {
        mockServer({ "GET /datatypes/getgridmodel/Things": { status: 200 } });

        renderGrid(createStore({ gridRules: {}, masterData: {} }));

        expect(await screen.findByText("ჩატვირთვის პრობლემა 2")).toBeInTheDocument();
    });

    // the list page keeps the grid when another list is opened from the menu
    it("shows the loading indicator, not a problem, while the grid rules of the next table load", async () => {
        const store = createStore({ dataTypes: [thingsDataType, othersDataType], gridRules: {}, masterData: {} });
        mockServer({
            "GET /datatypes/getgridmodel/Things": { status: 200, body: JSON.stringify(thingsGrid) },
            "GET /masterdata/gettablerowsdata/Things": { status: 200, body: thingRows },
            "GET /datatypes/getgridmodel/Others": never,
        });
        const view = renderGrid(store);
        await screen.findByText("პირველი ნივთი");

        view.rerender(gridOf(store, "Others"));

        expect(await screen.findByText(loadingText)).toBeInTheDocument();
        expect(screen.queryByText("ჩატვირთვის პრობლემა 2")).not.toBeInTheDocument();
    });
});
