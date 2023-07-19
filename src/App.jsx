import './App.css';

import { React, useRef, useState } from 'react';

// import viteLogo from '../public/vite.svg';
import reactLogo from './assets/react.svg';
import FileUpload from './FileUpload';

function App() {
    const [count, setCount] = useState(0);

    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
        localStorage.theme === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    return (
        <div className='p-4'>
            <h1 className='mb-4 text-4xl font-extrabold leading-none tracking-tight text-blue-500'>
                Card Recognition
            </h1>
            <FileUpload />
        </div>
    );
}

export default App;
