import { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { AlertCircle, CheckCircle2, Upload, XCircle } from 'lucide-react'

const VideoConverter = () => {
  const [status, setStatus] = useState('')
  const [finalUrl, setFinalUrl] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const ffmpegRef = useRef(new FFmpeg())
  const [loaded, setLoaded] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  const load = async () => {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
    const ffmpeg = ffmpegRef.current
    ffmpeg.on('log', ({ message }) => {
      addLog(message)
    })
    
    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      setLoaded(true)
      addLog('FFmpeg loaded successfully')
    } catch (error) {
      addLog('Failed to load FFmpeg')
      // setError('Failed to initialize converter')
    }
  }

  const uploadToAnonDrop = async (blob: Blob, filename: string) => {
    addLog(`Uploading ${filename} to AnonDrop...`)
    const formData = new FormData()
    formData.append('file', blob, filename)

    try {
      const response = await fetch('https://anondrop.net/upload', {
        method: 'POST',
        body: formData
      })
      const html = await response.text()
      const match = html.match(/href='([^']+)'/)
      if (match) {
        addLog(`Successfully uploaded ${filename}`)
        return match[1]
      }
      throw new Error('Could not extract URL from response')
    } catch (error) {
      addLog(`Failed to upload ${filename}`)
      throw error
    }
  }

  const convertFile = async (file: File) => {
    try {
      setError('')
      setFinalUrl('')
      setProgress(0)
      setLogs([])
      
      const ffmpeg = ffmpegRef.current
      await ffmpeg.load()
      setLoaded(true)
      if (!loaded) await load()

      addLog(`Starting conversion of ${file.name}`)
      setStatus('Starting conversion...')
      setProgress(10)

      // use ffmpegs vfs
      addLog('Writing input file to virtual filesystem')
      await ffmpeg.writeFile('input.mp4', await fetchFile(file))
      setProgress(20)
      
      // convert to HLS
      setStatus('Converting to HLS...')
      addLog('Beginning HLS conversion')
      await ffmpeg.exec([
          '-i', 'input.mp4',
          '-hls_time', '10',
          '-hls_list_size', '0',
          '-c:v', 'libx264',
          '-preset', 'ultrafast',  
          '-c:a', 'aac',
          '-f', 'hls',
          '-threads', '4', 
          'output.m3u8'
        ])
      setProgress(50)

      // parse the file
      addLog('Reading generated m3u8 file')
      const m3u8Data = await ffmpeg.readFile('output.m3u8')
      let m3u8Content = new TextDecoder().decode(m3u8Data)
      
      // upload each ts segment
      const segmentRegex = /output\d+\.ts/g
      const segments = m3u8Content.match(segmentRegex) || []
      const segmentUrls = []
      let segmentProgress = 50

      for (const segment of segments) {
        setStatus(`Uploading segment ${segment}...`)
        const segmentData = await ffmpeg.readFile(segment)
        const segmentBlob = new Blob([segmentData], { type: 'video/MP2T' })
        const segmentUrl = await uploadToAnonDrop(segmentBlob, segment)
        segmentUrls.push({ original: segment, url: segmentUrl + '/file.ts' })
        
        segmentProgress += Math.floor(40 / segments.length)
        setProgress(segmentProgress)
      }

      addLog('Updating m3u8 with uploaded segment URLs')
      for (const { original, url } of segmentUrls) {
        m3u8Content = m3u8Content.replace(original, url)
      }

      // upload final m3u8
      setStatus('Uploading playlist...')
      const m3u8Blob = new Blob([m3u8Content], { type: 'application/x-mpegURL' })
      const playlistUrl = await uploadToAnonDrop(m3u8Blob, 'playlist.m3u8')
      
      setFinalUrl(playlistUrl + '/playlist.m3u8')
      setStatus('Conversion complete!')
      setProgress(100)
      addLog('Conversion process completed successfully')
    } catch (error) {
      console.error('Conversion error:', error)
      setStatus('Error during conversion!')
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      addLog('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // debug logs
  useEffect(() => {
    const element = document.getElementById('logs')
    if (element) {
      element.scrollTop = element.scrollHeight
    }
  }, [logs])

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* File Upload Section */}
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="video/mp4"
            onChange={(e) => e.target.files?.[0] && convertFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="mr-2 h-5 w-5" />
            Choose MP4 File
          </label>
          
          {/* Progress Bar */}
          {progress > 0 && progress < 100 && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{status}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center">
              <XCircle className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {finalUrl && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle2 className="text-green-500 mr-2" />
                <p className="font-medium">Conversion Complete!</p>
              </div>
              <p className="font-medium">Playlist URL:</p>
              <a 
                href={finalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 break-all hover:underline"
              >
                {finalUrl}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Debug Logs Section */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold">Debug Logs</h3>
        </div>
        <div
          id="logs"
          className="bg-gray-900 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm"
        >
          {logs.map((log, index) => (
            <div key={index} className="text-gray-300">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VideoConverter
