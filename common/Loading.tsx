//Loading.tsx

import { Spinner } from "react-bootstrap";

const Loading = () => (
    <div>
        <span>მიმდინარეობს ჩატვირთვა...</span>
        <Spinner animation="border" role="status" />
    </div>
);

export default Loading;
