import './App.css';

import { React, useRef, useState } from 'react';

// import viteLogo from '../public/vite.svg';
import reactLogo from './assets/react.svg';
import FileUpload from './FileUpload';

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <h1>名片辨識</h1>
            <FileUpload />
        </>
    );
}

export default App;
