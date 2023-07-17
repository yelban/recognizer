import './FileUpload.css';

import React, { useEffect, useRef, useState } from 'react';

import shutterSoundFile from './assets/technology_camera_shutter_release_nikon_f4_002.mp3';

function FileUpload() {
    const fileInput = useRef();
    const [cardInfo, setCardInfo] = useState(null);
    const [cardUrl, setCardUrl] = useState(null);
    const videoRef = useRef();
    const canvasRef = useRef();
    const [cameraStarted, setCameraStarted] = useState(false);
    const [showFlash, setShowFlash] = useState(false);
    const shutterSound = useRef(new Audio(shutterSoundFile));

    useEffect(() => {
        // After `showFlash` is set to `true`, set it back to `false` after 500 milliseconds
        if (showFlash) {
            const timer = setTimeout(() => setShowFlash(false), 250);
            return () => clearTimeout(timer); // Clean up the timeout when unmounting the component
        }
    }, [showFlash]);

    useEffect(() => {
        shutterSound.current.load();
    }, []);

    const uploadFile = async () => {
        const file = fileInput.current.files[0];
        if (!file) {
            alert('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://abcorc.twampd.workers.dev', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            alert('Upload failed');
            return;
        }

        const result = await response.json();
        console.log('File uploaded successfully: ', result);
        setCardInfo(result.analyzeResult.documentResults[0].fields);
        setCardUrl(result.cardUrl);
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices
                .getUserMedia({
                    video: {
                        width: { ideal: 1080 },
                        height: { ideal: 1080 },
                        // width: { min: 1024 },
                        // height: { min: 768 },
                        facingMode: { exact: 'environment' },
                    },
                })
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();

                    setCameraStarted(true);
                })
                .catch((err) => {
                    // 如果使用後鏡頭失敗，嘗試使用前鏡頭
                    navigator.mediaDevices
                        .getUserMedia({
                            video: {
                                facingMode: 'user',
                            },
                        })
                        .then((stream) => {
                            videoRef.current.srcObject = stream;
                            videoRef.current.play();

                            setCameraStarted(true);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                });

            // videoRef.current.srcObject = stream;
            // videoRef.current.play();
            // setCameraStarted(true);
        } catch (err) {
            console.error('Error accessing the camera', err);
        }
    };

    const capturePhoto = async () => {
        console.log(videoRef.current.videoWidth, videoRef.current.videoHeight);

        // Set canvas size to match video size
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        const context = canvasRef.current.getContext('2d');
        context.drawImage(
            videoRef.current,
            0,
            0,
            videoRef.current.videoWidth,
            videoRef.current.videoHeight
        );

        // Pause the video stream
        videoRef.current.pause();
        videoRef.current.srcObject.getTracks()[0].stop();

        // Show the flash
        setShowFlash(true);

        // Play the shutter sound
        shutterSound.current.play();
        //
        // const shutterSound = new Audio(shutterSoundFile);
        // shutterSound.play();
        //
        // const shutterSound = document.getElementById('shutterSound');
        // if (shutterSound.readyState >= 3) {
        //     // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
        //     shutterSound.play();
        // } else {
        //     console.warn('Sound not ready');
        // }

        canvasRef.current.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('file', blob, 'photo.jpg');

            // alert('Upload successful');

            const response = await fetch('https://abcorc.twampd.workers.dev', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                alert('Upload failed');
                return;
            }

            const result = await response.json();
            console.log('File uploaded successfully: ', result);
            setCardInfo(result.analyzeResult.documentResults[0].fields);
            setCardUrl(result.cardUrl);
        });
    };

    const handleButtonClick = () => {
        fileInput.current.click();
    };

    return (
        <div>
            {showFlash && (
                <div
                    id='flash'
                    style={{
                        animation: 'flash 0.25s',
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                    }}
                />
            )}

            <div>
                <button onClick={startCamera} disabled={cameraStarted}>
                    Start Camera
                </button>
                <button onClick={capturePhoto} disabled={!cameraStarted}>
                    Capture Photo
                </button>
                <input
                    type='file'
                    accept='image/*'
                    ref={fileInput}
                    capture='camera'
                    style={{ display: 'none' }}
                />
                <button onClick={handleButtonClick}>掃描名片</button>
                <button onClick={uploadFile}>Upload</button>
            </div>

            <video ref={videoRef} style={{ width: '100%', height: 'auto' }} />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {cardUrl && (
                <div>
                    <img src={cardUrl} alt='Business Card' style={{ maxWidth: '250px' }} />
                </div>
            )}

            {cardInfo && (
                <div>
                    <h2>名片資訊</h2>
                    <p>公司名稱: {cardInfo.CompanyNames?.valueArray[0]?.valueString}</p>
                    <p>
                        姓名:{' '}
                        {`${cardInfo.ContactNames?.valueArray[0]?.valueObject.FirstName.valueString} ${cardInfo.ContactNames?.valueArray[0]?.valueObject.LastName.valueString}`}
                    </p>
                    <p>職稱: {cardInfo.JobTitles?.valueArray[0]?.valueString}</p>
                    <p>公司電話: {cardInfo.WorkPhones?.valueArray[0]?.text}</p>
                    <p>傳真: {cardInfo.Faxes?.valueArray[0]?.text}</p>
                    <p>地址: {cardInfo.Addresses?.valueArray[0]?.valueString}</p>
                    <p>網址: {cardInfo.Websites?.valueArray[0]?.valueString}</p>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
