import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState();
  const [gif, setGif] = useState();
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg log:', message);
    });

    try {
      setLoadingMessage('Loading FFmpeg...');
      console.log('Starting FFmpeg load...');
      
      await ffmpeg.load();
      
      console.log('FFmpeg loaded successfully!');
      setReady(true);
    } catch (err) {
      console.error('Error loading FFmpeg:', err);
      setError(`Failed to load FFmpeg: ${err.message}`);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const convertToGif = async () => {
    if (!video) return;
    
    setConverting(true);
    const ffmpeg = ffmpegRef.current;

    try {
      console.log('Writing video file...');
      await ffmpeg.writeFile('input.mp4', await fetchFile(video));

      console.log('Converting to GIF...');
      await ffmpeg.exec(['-i', 'input.mp4', '-t', '2.5', '-ss', '1.0', '-f', 'gif', 'output.gif']);

      console.log('Reading output...');
      const data = await ffmpeg.readFile('output.gif');
      const url = URL.createObjectURL(new Blob([data.buffer], { type: 'image/gif' }));
      setGif(url);
      console.log('Conversion complete!');
    } catch (error) {
      console.error('Error converting video:', error);
      setError('Error converting video. Check console for details.');
    } finally {
      setConverting(false);
    }
  };

  if (error) {
    return (
      <div className="App">
        <p style={{color: 'red'}}>{error}</p>
        <p>Check the browser console (F12) for detailed error information.</p>
      </div>
    );
  }

  return ready ? (
    <div className="App">
      <h1>Video → GIF Converter</h1>
      <input type="file" accept="video/*" onChange={(e) => setVideo(e.target.files?.item(0))} />

      {video && (
        <div>
          <video width="300" controls src={URL.createObjectURL(video)}></video>
          <button onClick={convertToGif} disabled={converting}>
            {converting ? 'Converting...' : 'Convert to GIF'}
          </button>
        </div>
      )}

      {gif && (
        <div>
          <h2>GIF Preview</h2>
          <img src={gif} alt="Generated GIF" />
        </div>
      )}
    </div>
  ) : (
    <div>
      <p>{loadingMessage}</p>
      <p style={{fontSize: '12px', color: '#666'}}>This may take a moment...</p>
    </div>
  );
}

export default App;