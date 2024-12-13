/*
 * @LastEditors: jizai jizai.zhu@tuya.com
 * @Date: 2024-12-13 14:36:25
 * @LastEditTime: 2024-12-13 16:56:33
 * @FilePath: /lyrics-to-cartoon/src/App.js
 * @Description: 
 */
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [images, setImages] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            url: e.target.result,
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    }
  });

  return (
    <div className="App">
      <header className="cartoon-header">
        <h1 className="cartoon-title">
          <span className="title-word">Lyrics</span>
          <span className="title-separator">to</span>
          <span className="title-word">Cartoon</span>
        </h1>
      </header>
      
      <div className="main-container">
        <div className="upload-section">
          <div 
            {...getRootProps()} 
            className={`upload-container ${isDragActive ? 'dragging' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="upload-area">
              <div className="upload-icon">📸</div>
              <p>拖拽图片到这里或者点击上传</p>
            </div>
          </div>
        </div>

        <div className="preview-section">
          {/* 预览区域内容 */}
        </div>
      </div>
    </div>
  );
}

export default App; 