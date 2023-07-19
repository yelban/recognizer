import './FileUpload.css';

import React, { useEffect, useRef, useState } from 'react';

// 這是主要的元件，用於處理檔案上傳和顯示上傳的結果
function FileUpload() {
    const fileInput = useRef(); // 這是一個引用 (reference)，指向 input 標籤，可以用來讀取檔案

    const [cardInfo, setCardInfo] = useState(null); // 這個狀態變數用於儲存卡片的資訊
    const [cardUrl, setCardUrl] = useState(null); // 這個狀態變數用於儲存卡片圖片的 URL
    const [uploading, setUploading] = useState(false); // 這個狀態變數用於追蹤是否正在上傳檔案
    const [fileSelected, setFileSelected] = useState(false); // 這個狀態變數用於追蹤是否已選擇檔案
    const [selectedImage, setSelectedImage] = useState(null); // 這個狀態變數用於儲存被選擇的圖片的 URL

    const uploadFile = async () => {
        setUploading(true); // 將 uploading 設為 true，表示正在上傳檔案

        const file = fileInput.current.files[0]; // 從 fileInput 讀取檔案
        if (!file) {
            alert('No file selected');
            setUploading(false); // 如果沒有選擇檔案，停止上傳並提前結束函數
            return;
        }

        const formData = new FormData();
        formData.append('file', file); // 將檔案加入 formData 中

        setCardInfo(null); // 在等待回傳資訊的時候清除 cardInfo 內容

        // 使用 fetch 函數上傳檔案
        const response = await fetch('https://abcorc.twampd.workers.dev', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            alert('Upload failed');
            setUploading(false); // 如果回傳錯誤，停止上傳並提前結束函數
            return;
        }

        // 處理回傳的資訊
        try {
            const result = await response.json();
            console.log('File uploaded successfully: ', result);

            // 清除舊的卡片 URL
            if (cardUrl) {
                URL.revokeObjectURL(cardUrl);
            }

            // 清除被選擇的圖片，設置卡片資訊和卡片 URL
            setSelectedImage(null);
            setCardInfo(result.analyzeResult.documents[0].fields);
            setCardUrl(result.cardUrl);
        } catch (error) {
            console.error('Error uploading file', error);
        }

        setUploading(false); // 完成上傳後將 uploading 設為 false

        setFileSelected(false); // 重設 fileSelected 狀態

        fileInput.current.value = '';
        // 因為 fileInput 的 value 在每次上傳後沒有被清除。
        // 當您選擇相同的檔案時，onChange 事件不會觸發，因為從技術上來說，輸入的值並沒有改變。
        // 這就是為什麼 Upload 按鈕看起來沒有重新啟用，也沒有新的預覽圖像產生。
    };

    const handleButtonClick = () => {
        fileInput.current.click(); // 當按鈕被點擊時，觸發 fileInput 的點擊事件
    };

    const handleFileChange = (e) => {
        // 當檔案被選擇時，設置 fileSelected 狀態，並將被選擇的圖片的 URL 設為 selectedImage
        setFileSelected(e.target.files.length > 0);
        setSelectedImage(URL.createObjectURL(e.target.files[0]));
    };

    return (
        // 畫面的主要元件
        // 包含掃描名片按鈕、上傳按鈕、圖片預覽和名片資訊
        <div>
            {/* 省略了一些並未使用到的元件和狀態變數，例如 showFlash */}
            <div>
                <input
                    type='file'
                    accept='image/*'
                    ref={fileInput}
                    // capture='camera'
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <button
                    onClick={handleButtonClick}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[150px]'
                    type='button'>
                    Scan Card
                </button>
                <button
                    onClick={uploadFile}
                    disabled={!fileSelected}
                    className={`${
                        fileSelected ? 'bg-green-500 hover:bg-green-700' : 'bg-gray-300'
                    } text-white font-bold py-2 px-4 rounded ml-2 w-[150px]`}
                    type='button'>
                    Recognize
                </button>
            </div>

            {/* 顯示被選擇的圖片或卡片圖片 */}
            {(selectedImage || cardUrl) && (
                <div className='mt-4 relative'>
                    <img
                        src={selectedImage || cardUrl}
                        className='max-w-screen sm:max-h-[300px] rounded shadow-lg'
                        alt='Captured'
                    />
                    {/* 如果正在上傳，顯示一個 spinner */}
                    {uploading && <div className='loader' />}
                </div>
            )}

            {/* 顯示卡片資訊 */}
            {cardInfo && (
                <div className='mt-4'>
                    <h2 className='mb-2 text-xl font-bold text-blue-500'>
                        Business card information.
                    </h2>
                    <table className='min-w-full divide-y divide-gray-200'>
                        <tbody className='bg-white divide-y divide-gray-200'>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Company name
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.CompanyNames?.valueArray[0]?.content}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Job title
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.JobTitles?.valueArray[0]?.content}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Contact name
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {`${cardInfo.ContactNames?.valueArray[0]?.content}`}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Department
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.Departments?.valueArray[0]?.content}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Email
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.Emails?.valueArray[0]?.content}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Fax
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.Faxes?.valueArray[0]?.content}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    MobilePhone
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.MobilePhones?.valueArray[0]?.content}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Work phone
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.WorkPhones?.valueArray[0]?.content}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Address
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.Addresses?.valueArray[0]?.content}
                                </td>
                            </tr>
                            <tr>
                                <td className='py-2 whitespace-nowrap text-sm text-gray-500'>
                                    Website
                                </td>
                                <td className='px-2 py-2 whitespace-normal text-sm text-gray-500'>
                                    {cardInfo.Websites?.valueArray[0]?.content}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default FileUpload;
