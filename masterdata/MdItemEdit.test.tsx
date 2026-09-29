//MdItemEdit.test.tsx

import { configureStore } from "@reduxjs/toolkit";
import { act, createEvent, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { describe, expect, it } from "vitest";

import MdItemEdit from "./MdItemEdit";
import { dataTypesApi } from "../redux/api/dataTypesApi";
import { masterdataApi } from "../redux/api/masterdataApi";
import alertReducer, { setAlertApiMutationError } from "../redux/slices/alertSlice";
import appParametersReducer from "../redux/slices/appParametersSlice";
import dataTypesReducer from "../redux/slices/dataTypesSlice";
import masterDataReducer, { type IMasterDataState, setItemEditorTables } from "../redux/slices/masterdataSlice";
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
    keyFieldName: "code",
    nameFieldName: "name",
    create: true,
    update: true,
    delete: true,
};

const othersDataType: DataTypeFfModel = { ...thingsDataType, dtTable: "Others" };

function required(caption: string) {
    return { code: `${caption} შევსებული უნდა იყოს`, description: `${caption} შევსებული უნდა იყოს`, type: 2 };
}

// one visible cell of every kind the editor draws, and a hidden id
const thingsGrid = {
    cells: [
        { typeName: "Integer", fieldName: "thingId", caption: null, visible: false, def: 0 },
        { typeName: "String", fieldName: "code", caption: "კოდი", visible: true, def: "", isRequiredErr: required("კოდი") },
        {
            typeName: "String",
            fieldName: "name",
            caption: "სახელი",
            visible: true,
            def: "",
            isRequiredErr: required("სახელი"),
        },
        {
            typeName: "RsLookup",
            fieldName: "kind",
            caption: "სახე",
            visible: true,
            rowSource: "1;პირველი;2;მეორე",
            isNullable: true,
        },
        {
            typeName: "MdLookup",
            fieldName: "parentId",
            caption: "მშობელი",
            visible: true,
            dtTable: "Parents",
            isNullable: true,
        },
        { typeName: "MdLookup", fieldName: "orphanId", caption: "ობოლი", visible: true, isNullable: true },
        {
            typeName: "Lookup",
            fieldName: "oldId",
            caption: "ძველი",
            visible: true,
            dataMember: "Olds",
            valueMember: "oldId",
            displayMember: "oldName",
            isNullable: true,
        },
        { typeName: "Lookup", fieldName: "brokenId", caption: "გატეხილი", visible: true, isNullable: true },
        { typeName: "Boolean", fieldName: "active", caption: "აქტიური", visible: true, def: false },
        { typeName: "Date", fieldName: "startTime", caption: "დრო", visible: true, showTime: true, isNullable: true },
        { typeName: "Integer", fieldName: "count", caption: "რაოდენობა", visible: true, def: 0 },
        { typeName: "Number", fieldName: "price", caption: "ფასი", visible: true, isNullable: true },
    ],
} as unknown as GridModel;

const parents = [
    { id: 1, name: "ხელფასი" },
    { id: 2, name: "პენსია" },
];

const olds = [
    { oldId: 10, oldName: "ძველი ათი" },
    { oldId: 11, oldName: "ძველი თერთმეტი" },
];

const thingFive = {
    thingId: 5,
    code: "A1",
    name: "ნივთი",
    kind: 2,
    parentId: 1,
    orphanId: null,
    oldId: 10,
    brokenId: null,
    active: true,
    startTime: "08:30:00",
    count: 3,
    price: 5.25,
};

const loadedLists: Partial<IMasterDataState> = {
    itemEditorTables: { Things: ["Olds"], Others: ["Olds"] },
    itemEditorLookupTables: { Things: ["Parents"], Others: ["Parents"] },
    mdLookupRepo: { Parents: parents },
    mdataRepo: { Olds: olds },
};

type StoreOptions = {
    masterData?: Partial<IMasterDataState>;
    dataTypes?: DataTypeFfModel[];
    gridRules?: { [key: string]: GridModel };
};

// the editor reads its data type, grid rules and lookup lists from the store and loads what is missing
function createStore({ masterData = loadedLists, dataTypes = [thingsDataType], gridRules }: StoreOptions = {}) {
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
                gridRules: gridRules ?? Object.fromEntries(dataTypes.map((dt) => [dt.dtTable, thingsGrid])),
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

type Store = ReturnType<typeof createStore>;

// the pages the editor navigates to show where they were opened
function ListPage() {
    const { tableName, recName } = useParams();
    return <p>{`list ${tableName} ${recName ?? "-"}`}</p>;
}

function CustomPage() {
    const { tableName, recName } = useParams();
    return <p>{`custom ${tableName} ${recName ?? "-"}`}</p>;
}

// lets a test move to another route while the editor stays open
function GoButton({ to }: { to: string }) {
    const navigate = useNavigate();
    return (
        <button type="button" onClick={() => navigate(to)}>
            {`go ${to}`}
        </button>
    );
}

type RenderOptions = {
    goTo?: string[];
    // the app runs in StrictMode, which runs every effect twice in development
    strict?: boolean;
};

function renderEditor(store: Store, path: string, { goTo = [], strict = false }: RenderOptions = {}) {
    const tree = (
        <Provider store={store}>
            <MemoryRouter initialEntries={[path]}>
                {goTo.map((to) => (
                    <GoButton key={to} to={to} />
                ))}
                <Routes>
                    <Route path="/mdItemEdit/:tableName/:mdIdValue" element={<MdItemEdit />} />
                    <Route path="/mdItemEdit/:tableName" element={<MdItemEdit />} />
                    <Route path="/mdList/:tableName/:recName" element={<ListPage />} />
                    <Route path="/mdList/:tableName" element={<ListPage />} />
                    <Route path="/custom/:tableName/:recName" element={<CustomPage />} />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
    return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}

// the server answers "METHOD /path" requests; any other request gets a 404
function mockServer(routes: { [request: string]: FetchReply | ((call: FetchCall) => FetchReply | Promise<FetchReply>) }) {
    return mockFetch((call) => {
        const request = `${call.method} ${call.url.replace(testBaseUrl, "")}`;
        const reply = routes[request];
        if (reply === undefined) return { status: 404, body: { title: "NotFound", detail: request } };
        return typeof reply === "function" ? reply(call) : reply;
    });
}

function optionsOf(label: string): HTMLOptionElement[] {
    return within(screen.getByLabelText(label)).getAllByRole("option") as HTMLOptionElement[];
}

function change(label: string, value: string) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

// the labels of the controls (the header of a new record is a label too, but of no control)
function labels(): (string | null)[] {
    return [...document.querySelectorAll("form label[for]")].map((label) => label.textContent);
}

async function openThingFive(
    store: Store,
    routes: Parameters<typeof mockServer>[0] = {},
    options: RenderOptions = {}
) {
    const calls = mockServer({ "GET /masterdata/Things/5": { status: 200, body: { entry: thingFive } }, ...routes });
    renderEditor(store, "/mdItemEdit/Things/5", options);
    await waitFor(() => expect(screen.getByLabelText("კოდი")).toHaveValue("A1"));
    return calls;
}

function raiseMutationAlert(store: Store) {
    act(() => {
        store.dispatch(setAlertApiMutationError([{ errorCode: "Old", errorMessage: "ძველი შეცდომა" }]));
    });
    expect(store.getState().alertState.alert).not.toEqual({});
}

describe("MdItemEdit loading", () => {
    it("shows the wait page while the lists load", () => {
        mockServer({});

        renderEditor(createStore({ masterData: { ...loadedLists, mdWorkingOnLoadingListData: true } }), "/mdItemEdit/Things");

        expect(screen.getByText("მოიცადე...")).toBeInTheDocument();
    });

    it("does not ask for the record while the lists load", () => {
        mockServer({});
        const store = createStore({ masterData: { ...loadedLists, mdWorkingOnLoadingListData: true } });

        renderEditor(store, "/mdItemEdit/Things/5");

        expect(Object.keys(store.getState().masterdataApi.queries)).toEqual([]);
    });

    it("shows the wait page while the record loads", async () => {
        const calls = mockServer({ "GET /masterdata/Things/5": () => new Promise<FetchReply>(() => {}) });

        renderEditor(createStore(), "/mdItemEdit/Things/5");

        await waitFor(() => expect(calls).toHaveLength(1));
        expect(screen.getByText("მოიცადე...")).toBeInTheDocument();
    });

    it("loads the data types when it does not know the table", async () => {
        const calls = mockServer({ "GET /datatypes/getdatatypes": { status: 200, body: [thingsDataType] } });

        renderEditor(createStore({ dataTypes: [], gridRules: { Things: thingsGrid } }), "/mdItemEdit/Things");

        expect(await screen.findByRole("button", { name: /შექმნა/ })).toBeInTheDocument();
        expect(calls.map((call) => call.url)).toEqual([`${testBaseUrl}/datatypes/getdatatypes`]);
    });

    it("loads the grid rules of the table when they are missing", async () => {
        const calls = mockServer({
            "GET /datatypes/getgridmodel/Things": { status: 200, body: JSON.stringify(thingsGrid) },
        });

        renderEditor(createStore({ gridRules: {} }), "/mdItemEdit/Things");

        expect(await screen.findByRole("button", { name: /შექმნა/ })).toBeInTheDocument();
        expect(calls.map((call) => call.url)).toEqual([`${testBaseUrl}/datatypes/getgridmodel/Things`]);
    });

    it("loads the tables of the lookups when they are missing", async () => {
        const calls = mockServer({
            "GET /masterdata/gettables?tables=Olds": { status: 200, body: { entities: { Olds: olds } } },
        });

        renderEditor(
            createStore({
                masterData: { ...loadedLists, itemEditorTables: {}, mdataRepo: {} },
            }),
            "/mdItemEdit/Things"
        );

        expect(await screen.findByRole("option", { name: "ძველი ათი" })).toBeInTheDocument();
        expect(calls.map((call) => call.url)).toEqual([`${testBaseUrl}/masterdata/gettables?tables=Olds`]);
    });

    it("loads the lookup lists when they are missing", async () => {
        const calls = mockServer({
            "GET /masterdata/getlookuptables?tables=Parents": { status: 200, body: { srv: { Parents: parents } } },
        });

        renderEditor(
            createStore({
                masterData: { ...loadedLists, itemEditorLookupTables: {}, mdLookupRepo: {} },
            }),
            "/mdItemEdit/Things"
        );

        expect(await screen.findByRole("option", { name: "ხელფასი" })).toBeInTheDocument();
        expect(calls.map((call) => call.url)).toEqual([`${testBaseUrl}/masterdata/getlookuptables?tables=Parents`]);
    });

    it("loads every list the editor still needs", async () => {
        const calls = mockServer({
            "GET /masterdata/getlookuptables?tables=Parents": { status: 200, body: { srv: { Parents: parents } } },
            "GET /masterdata/gettables?tables=Olds": { status: 200, body: { entities: { Olds: olds } } },
        });

        renderEditor(
            createStore({
                masterData: { itemEditorTables: {}, itemEditorLookupTables: {}, mdLookupRepo: {}, mdataRepo: {} },
            }),
            "/mdItemEdit/Things"
        );

        expect(await screen.findByRole("option", { name: "ხელფასი" })).toBeInTheDocument();
        expect(await screen.findByRole("option", { name: "ძველი ათი" })).toBeInTheDocument();
        expect(calls.map((call) => call.url).sort()).toEqual([
            `${testBaseUrl}/masterdata/getlookuptables?tables=Parents`,
            `${testBaseUrl}/masterdata/gettables?tables=Olds`,
        ]);
    });

    it("shows the load error of the server instead of the form", async () => {
        mockServer({
            "GET /masterdata/Things/5": {
                status: 400,
                body: { title: "EntryNotFound", status: 400, detail: "ჩანაწერი ვერ მოიძებნა" },
            },
        });

        renderEditor(createStore(), "/mdItemEdit/Things/5");

        expect(await screen.findByText("ჩანაწერი ვერ მოიძებნა")).toBeInTheDocument();
        expect(screen.getByText("ჩატვირთვის პრობლემა")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /შენახვა/ })).not.toBeInTheDocument();
    });

    it("does not show a record loaded for another id", async () => {
        const calls = mockServer({ "GET /masterdata/Things/5": { status: 200, body: { entry: { ...thingFive, thingId: 6 } } } });

        renderEditor(createStore(), "/mdItemEdit/Things/5");

        await waitFor(() => expect(calls).toHaveLength(1));
        expect(await screen.findByText("ჩატვირთვის პრობლემა")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /შენახვა/ })).not.toBeInTheDocument();
    });
});

describe("MdItemEdit controls", () => {
    it("draws a control for every visible cell of a new record", async () => {
        mockServer({});

        renderEditor(createStore(), "/mdItemEdit/Things");

        await screen.findByRole("button", { name: /შექმნა/ });
        expect(labels()).toEqual([
            "კოდი",
            "სახელი",
            "სახე",
            "მშობელი",
            "ობოლი",
            "ძველი",
            "გატეხილი",
            "აქტიური",
            "დრო",
            "რაოდენობა",
            "ფასი",
        ]);
    });

    it("draws each cell type with its own control", async () => {
        mockServer({});

        renderEditor(createStore(), "/mdItemEdit/Things");

        await screen.findByRole("button", { name: /შექმნა/ });
        expect(optionsOf("სახე").map((option) => option.textContent)).toEqual(["აირჩიე სახე", "მეორე", "პირველი"]);
        expect(optionsOf("მშობელი").map((option) => option.textContent)).toEqual([
            "აირჩიე მშობელი",
            "პენსია",
            "ხელფასი",
        ]);
        expect(optionsOf("ძველი").map((option) => option.textContent)).toEqual([
            "აირჩიე ძველი",
            "ძველი ათი",
            "ძველი თერთმეტი",
        ]);
        expect(screen.getByLabelText("ობოლი")).toHaveAttribute("type", "text");
        expect(screen.getByLabelText("გატეხილი")).toHaveAttribute("type", "text");
        expect(screen.getByLabelText("აქტიური")).toHaveAttribute("type", "checkbox");
        expect(screen.getByLabelText("დრო")).toHaveAttribute("type", "time");
        expect(screen.getByLabelText("რაოდენობა")).toHaveAttribute("step", "1");
        expect(screen.getByLabelText("ფასი")).toHaveAttribute("type", "number");
        expect(screen.getByLabelText("ფასი")).toHaveAttribute("step", "0.01");
        expect(screen.getByLabelText("კოდი")).toHaveAttribute("type", "text");
    });

    it("starts every combo with a choose item that is no value", async () => {
        mockServer({});

        renderEditor(createStore(), "/mdItemEdit/Things");

        await screen.findByRole("button", { name: /შექმნა/ });
        expect(optionsOf("სახე")[0].value).toBe("-1");
        expect(optionsOf("მშობელი")[0].value).toBe("-1");
        expect(optionsOf("ძველი")[0].value).toBe("-1");
    });

    it("draws a cell without a caption or a field name with empty ones", async () => {
        mockServer({});
        const blankGrid = {
            cells: [
                { typeName: "String", fieldName: "note", caption: null, visible: true },
                { typeName: "String", fieldName: "", caption: "უსახელო", visible: true },
            ],
        } as unknown as GridModel;

        renderEditor(createStore({ gridRules: { Things: blankGrid } }), "/mdItemEdit/Things");

        await screen.findByRole("button", { name: /შექმნა/ });
        expect(labels()).toEqual(["", "უსახელო"]);
        expect(screen.getByPlaceholderText("უსახელო").id).toBe("");
    });

    it("starts a new record from the defaults of the cells", async () => {
        mockServer({});

        renderEditor(createStore(), "/mdItemEdit/Things");

        await screen.findByRole("button", { name: /შექმნა/ });
        expect(screen.getByLabelText("კოდი")).toHaveValue("");
        expect(screen.getByLabelText("აქტიური")).not.toBeChecked();
        expect(screen.getByLabelText("რაოდენობა")).toHaveValue(0);
    });

    it("fills the form with the loaded record", async () => {
        await openThingFive(createStore());

        expect(screen.getByLabelText("კოდი")).toHaveValue("A1");
        expect(screen.getByLabelText("სახელი")).toHaveValue("ნივთი");
        expect(screen.getByLabelText("სახე")).toHaveValue("2");
        expect(screen.getByLabelText("მშობელი")).toHaveValue("1");
        expect(screen.getByLabelText("ძველი")).toHaveValue("10");
        expect(screen.getByLabelText("აქტიური")).toBeChecked();
        expect(screen.getByLabelText("დრო")).toHaveValue("08:30");
        expect(screen.getByLabelText("რაოდენობა")).toHaveValue(3);
        expect(screen.getByLabelText("ფასი")).toHaveValue(5.25);
    });

    it("titles a new record as being created and offers no delete", async () => {
        mockServer({});

        renderEditor(createStore(), "/mdItemEdit/Things");

        await screen.findByRole("button", { name: /შექმნა/ });
        expect(screen.getByText("იქმნება ახალი ნივთი")).toBeInTheDocument();
        expect(screen.queryByText("ნივთის რედაქტორი")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /წაშლა/ })).not.toBeInTheDocument();
    });

    it("titles a loaded record as edited and offers the delete", async () => {
        await openThingFive(createStore());

        expect(screen.getByText("ნივთის რედაქტორი")).toBeInTheDocument();
        expect(screen.queryByText("იქმნება ახალი ნივთი")).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /წაშლა/ })).toBeInTheDocument();
    });

    it("offers no saving and no deleting to a user who may not change the table", async () => {
        await openThingFive(createStore({ dataTypes: [{ ...thingsDataType, update: false, delete: false }] }));

        expect(screen.getByRole("button", { name: /უარი/ })).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /შენახვა/ })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /წაშლა/ })).not.toBeInTheDocument();
    });
});

describe("MdItemEdit saving", () => {
    it("does not let an invalid new record be saved", async () => {
        const calls = mockServer({});
        const store = createStore();
        renderEditor(store, "/mdItemEdit/Things");
        const createButton = await screen.findByRole("button", { name: /შექმნა/ });

        fireEvent.submit(createButton.closest("form")!);

        expect(createButton).toBeDisabled();
        expect(screen.getByRole("alert")).toHaveTextContent("შევსებული უნდა იყოს");
        expect(Object.keys(store.getState().masterdataApi.mutations)).toEqual([]);
        expect(calls).toEqual([]);
    });

    it("keeps the browser from submitting the form itself", async () => {
        mockServer({});
        renderEditor(createStore(), "/mdItemEdit/Things");
        const form = (await screen.findByRole("button", { name: /შექმნა/ })).closest("form")!;
        const submit = createEvent.submit(form);

        fireEvent(form, submit);

        expect(submit.defaultPrevented).toBe(true);
    });

    it("creates the new record and opens its row in the list", async () => {
        const calls = mockServer({
            "POST /masterdata/Things": { status: 200, body: { entry: { ...thingFive, thingId: 12 } } },
        });
        renderEditor(createStore(), "/mdItemEdit/Things");
        const createButton = await screen.findByRole("button", { name: /შექმნა/ });

        change("კოდი", "B2");
        change("სახელი", "ახალი");
        change("სახე", "2");
        change("მშობელი", "1");
        change("ძველი", "11");
        fireEvent.click(screen.getByLabelText("აქტიური"));
        change("დრო", "09:15");
        change("რაოდენობა", "4");
        change("ფასი", "7.5");
        fireEvent.click(createButton);

        expect(await screen.findByText("list Things 12")).toBeInTheDocument();
        const post = calls.find((call) => call.method === "POST");
        expect(post?.url).toBe(`${testBaseUrl}/masterdata/Things`);
        expect(post?.body).toMatchObject({
            code: "B2",
            name: "ახალი",
            kind: 2,
            parentId: 1,
            oldId: 11,
            active: true,
            startTime: "09:15",
            count: "4",
            price: "7.5",
        });
    });

    it("saves the changed record and returns to its row in the list", async () => {
        const calls = await openThingFive(createStore(), { "PUT /masterdata/Things/5": { status: 204 } });

        change("სახელი", "ნივთი 2");
        fireEvent.click(screen.getByRole("button", { name: /შენახვა/ }));

        expect(await screen.findByText("list Things 5")).toBeInTheDocument();
        const put = calls.find((call) => call.method === "PUT");
        expect(put?.url).toBe(`${testBaseUrl}/masterdata/Things/5`);
        expect(put?.body).toMatchObject({ thingId: 5, name: "ნივთი 2", price: 5.25 });
    });

    it("shows the error of the server when saving fails", async () => {
        await openThingFive(createStore(), {
            "PUT /masterdata/Things/5": {
                status: 400,
                body: { title: "SuchARecordAlreadyExists", status: 400, detail: "ასეთი ჩანაწერი უკვე არსებობს" },
            },
        });

        fireEvent.click(screen.getByRole("button", { name: /შენახვა/ }));

        expect(await screen.findByText("ასეთი ჩანაწერი უკვე არსებობს")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /შენახვა/ })).toBeInTheDocument();
    });

    it("shows only the error of the latest save", async () => {
        const store = createStore();
        const calls = await openThingFive(store, {
            "PUT /masterdata/Things/5": { status: 400, body: { title: "Failed", status: 400, detail: "ვერ შეინახა" } },
        });
        fireEvent.click(screen.getByRole("button", { name: /შენახვა/ }));
        await screen.findByText("ვერ შეინახა");

        fireEvent.click(screen.getByRole("button", { name: /შენახვა/ }));

        await waitFor(() => expect(calls.filter((call) => call.method === "PUT")).toHaveLength(2));
        await waitFor(() => expect(store.getState().masterDataState.mdWorkingOnSave).toBe(false));
        expect(store.getState().alertState.alert.ApiMutation).toHaveLength(1);
        expect(screen.getAllByText("ვერ შეინახა")).toHaveLength(1);
    });
});

describe("MdItemEdit deleting", () => {
    it("deletes the record after the confirmation and returns to the list", async () => {
        const calls = await openThingFive(createStore(), { "DELETE /masterdata/Things/5": { status: 200 } });

        fireEvent.click(screen.getByRole("button", { name: /წაშლა/ }));
        fireEvent.click(await screen.findByRole("button", { name: "დიახ" }));

        expect(await screen.findByText("list Things -")).toBeInTheDocument();
        expect(calls.filter((call) => call.method === "DELETE").map((call) => call.url)).toEqual([
            `${testBaseUrl}/masterdata/Things/5`,
        ]);
    });

    it("asks about a record by its key and name", async () => {
        await openThingFive(createStore());

        fireEvent.click(screen.getByRole("button", { name: /წაშლა/ }));

        expect(
            await screen.findByText('დარწმუნებული ხართ, რომ გსურთ წაშალოთ ნივთი "A1 - ნივთი"')
        ).toBeInTheDocument();
    });

    it("asks about a record without a name by its key", async () => {
        mockServer({ "GET /masterdata/Things/5": { status: 200, body: { entry: { ...thingFive, name: "" } } } });
        renderEditor(createStore(), "/mdItemEdit/Things/5");
        await waitFor(() => expect(screen.getByLabelText("კოდი")).toHaveValue("A1"));

        fireEvent.click(screen.getByRole("button", { name: /წაშლა/ }));

        expect(await screen.findByText('დარწმუნებული ხართ, რომ გსურთ წაშალოთ ნივთი "A1"')).toBeInTheDocument();
    });

    it("asks about a record without a key by its name", async () => {
        await openThingFive(createStore({ dataTypes: [{ ...thingsDataType, keyFieldName: null }] }));

        fireEvent.click(screen.getByRole("button", { name: /წაშლა/ }));

        expect(
            await screen.findByText('დარწმუნებული ხართ, რომ გსურთ წაშალოთ ნივთი "ნივთი"')
        ).toBeInTheDocument();
    });

    it("asks about a record without a key and a name by an empty name", async () => {
        const calls = mockServer({
            "GET /masterdata/Things/5": { status: 200, body: { entry: { ...thingFive, name: "" } } },
        });
        renderEditor(createStore({ dataTypes: [{ ...thingsDataType, keyFieldName: null }] }), "/mdItemEdit/Things/5");
        await waitFor(() => expect(screen.getByLabelText("კოდი")).toHaveValue("A1"));
        expect(calls).toHaveLength(1);

        fireEvent.click(screen.getByRole("button", { name: /წაშლა/ }));

        expect(await screen.findByText('დარწმუნებული ხართ, რომ გსურთ წაშალოთ ნივთი ""')).toBeInTheDocument();
    });

    it("shows the delete as running while the record is deleted", async () => {
        await openThingFive(createStore({ masterData: { ...loadedLists, deletingKey: "Things5" } }));

        const deleteButton = screen.getByRole("button", { name: /წაშლა/ });

        expect(within(deleteButton).getByRole("status", { hidden: true })).toBeInTheDocument();
    });

    it("does not show the delete as running while nothing is deleted", async () => {
        await openThingFive(createStore());

        const deleteButton = screen.getByRole("button", { name: /წაშლა/ });

        expect(within(deleteButton).queryByRole("status", { hidden: true })).not.toBeInTheDocument();
    });

    it("reports a failed delete and clears the failure when it is acknowledged", async () => {
        const store = createStore();
        await openThingFive(store, {
            "DELETE /masterdata/Things/5": {
                status: 400,
                body: {
                    title: "TheEntryHasBeenUsedAndCannotBeDeleted",
                    status: 400,
                    detail: "ჩანაწერი გამოყენებულია და ვერ წაიშლება",
                },
            },
        });

        fireEvent.click(screen.getByRole("button", { name: /წაშლა/ }));
        fireEvent.click(await screen.findByRole("button", { name: "დიახ" }));

        expect(
            await screen.findByText("ნივთის წაშლაისას მოხდა შეცდომა, წაშლა ვერ მოხერხდა")
        ).toBeInTheDocument();
        expect(screen.getByText("ჩანაწერი გამოყენებულია და ვერ წაიშლება")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "კარგი" }));

        await waitFor(() => expect(store.getState().masterDataState.deleteFailure).toBe(false));
    });
});

describe("MdItemEdit navigation", () => {
    it("returns to the list row on cancel and forgets the alerts and the tables to clear", async () => {
        const store = createStore({ masterData: { ...loadedLists, tablesForClearAfterCrudOperations: ["Olds"] } });
        await openThingFive(store, {
            "PUT /masterdata/Things/5": { status: 400, body: { title: "Failed", status: 400, detail: "ვერ შეინახა" } },
        });
        fireEvent.click(screen.getByRole("button", { name: /შენახვა/ }));
        await screen.findByText("ვერ შეინახა");

        fireEvent.click(screen.getByRole("button", { name: /უარი/ }));

        expect(await screen.findByText("list Things 5")).toBeInTheDocument();
        expect(store.getState().alertState.alert).toEqual({});
        expect(store.getState().masterDataState.tablesForClearAfterCrudOperations).toEqual([]);
    });

    it("returns to the page the editor was opened from on cancel", async () => {
        await openThingFive(createStore({ masterData: { ...loadedLists, returnPageName: "custom" } }));

        fireEvent.click(screen.getByRole("button", { name: /უარი/ }));

        expect(await screen.findByText("custom Things 5")).toBeInTheDocument();
    });

    it("forgets the alerts when a record of another table is opened", async () => {
        mockServer({});
        const store = createStore({ dataTypes: [thingsDataType, othersDataType] });
        renderEditor(store, "/mdItemEdit/Things", { goTo: ["/mdItemEdit/Others"] });
        await screen.findByRole("button", { name: /შექმნა/ });
        raiseMutationAlert(store);

        fireEvent.click(screen.getByRole("button", { name: "go /mdItemEdit/Others" }));

        await waitFor(() => expect(store.getState().alertState.alert).toEqual({}));
    });

    it("loads the record the route moved to and forgets the alerts", async () => {
        const store = createStore();
        const calls = await openThingFive(
            store,
            { "GET /masterdata/Things/6": { status: 200, body: { entry: { ...thingFive, thingId: 6, code: "B6" } } } },
            { goTo: ["/mdItemEdit/Things/6"] }
        );
        raiseMutationAlert(store);

        fireEvent.click(screen.getByRole("button", { name: "go /mdItemEdit/Things/6" }));

        await waitFor(() => expect(screen.getByLabelText("კოდი")).toHaveValue("B6"));
        expect(calls.map((call) => call.url)).toContain(`${testBaseUrl}/masterdata/Things/6`);
        expect(store.getState().alertState.alert).toEqual({});
    });

    it("shows the wait page while the record the route moved to loads", async () => {
        await openThingFive(
            createStore(),
            { "GET /masterdata/Things/6": () => new Promise<FetchReply>(() => {}) },
            { goTo: ["/mdItemEdit/Things/6"] }
        );

        fireEvent.click(screen.getByRole("button", { name: "go /mdItemEdit/Things/6" }));

        expect(await screen.findByText("მოიცადე...")).toBeInTheDocument();
    });

    it("loads the record with the same id of the table the route moved to", async () => {
        const store = createStore({ dataTypes: [thingsDataType, othersDataType] });
        const calls = await openThingFive(
            store,
            { "GET /masterdata/Others/5": { status: 200, body: { entry: { ...thingFive, code: "O5" } } } },
            { goTo: ["/mdItemEdit/Others/5"] }
        );

        fireEvent.click(screen.getByRole("button", { name: "go /mdItemEdit/Others/5" }));

        await waitFor(() => expect(screen.getByLabelText("კოდი")).toHaveValue("O5"));
        expect(calls.map((call) => call.url)).toContain(`${testBaseUrl}/masterdata/Others/5`);
    });

    it("opens an empty form when the route moves to a new record", async () => {
        await openThingFive(createStore(), {}, { goTo: ["/mdItemEdit/Things"] });

        fireEvent.click(screen.getByRole("button", { name: "go /mdItemEdit/Things" }));

        await waitFor(() => expect(screen.getByLabelText("კოდი")).toHaveValue(""));
        expect(screen.getByRole("button", { name: /შექმნა/ })).toBeInTheDocument();
        expect(screen.getByText("იქმნება ახალი ნივთი")).toBeInTheDocument();
    });
});

// the editor state changes while the user edits, e.g. when the lists of another table are loaded
function changeEditorState(store: Store) {
    act(() => {
        store.dispatch(setItemEditorTables({ tableNamesList: [], editTableName: "Others" }));
    });
}

describe("MdItemEdit keeps the changes of the user", () => {
    it("keeps a changed field of a loaded record when the editor state changes", async () => {
        const store = createStore();
        await openThingFive(store);
        change("სახელი", "შეცვლილი");

        changeEditorState(store);

        expect(screen.getByLabelText("სახელი")).toHaveValue("შეცვლილი");
    });

    it("keeps what was typed into a new record when the editor state changes", async () => {
        mockServer({});
        const store = createStore();
        renderEditor(store, "/mdItemEdit/Things");
        await screen.findByRole("button", { name: /შექმნა/ });
        change("კოდი", "B2");

        changeEditorState(store);

        expect(screen.getByLabelText("კოდი")).toHaveValue("B2");
    });
});

describe("MdItemEdit in StrictMode", () => {
    it("loads the record once and fills the form", async () => {
        const calls = await openThingFive(createStore(), {}, { strict: true });

        expect(screen.getByLabelText("სახელი")).toHaveValue("ნივთი");
        expect(calls.filter((call) => call.url === `${testBaseUrl}/masterdata/Things/5`)).toHaveLength(1);
    });

    it("opens an empty form for a new record", async () => {
        mockServer({});

        renderEditor(createStore(), "/mdItemEdit/Things", { strict: true });

        expect(await screen.findByRole("button", { name: /შექმნა/ })).toBeInTheDocument();
        expect(screen.getByLabelText("კოდი")).toHaveValue("");
    });

    it("keeps a changed field when the editor state changes", async () => {
        const store = createStore();
        await openThingFive(store, {}, { strict: true });
        change("სახელი", "შეცვლილი");

        changeEditorState(store);

        expect(screen.getByLabelText("სახელი")).toHaveValue("შეცვლილი");
    });

    it("loads the record the route moved to", async () => {
        await openThingFive(
            createStore(),
            { "GET /masterdata/Things/6": { status: 200, body: { entry: { ...thingFive, thingId: 6, code: "B6" } } } },
            { goTo: ["/mdItemEdit/Things/6"], strict: true }
        );

        fireEvent.click(screen.getByRole("button", { name: "go /mdItemEdit/Things/6" }));

        await waitFor(() => expect(screen.getByLabelText("კოდი")).toHaveValue("B6"));
    });
});
