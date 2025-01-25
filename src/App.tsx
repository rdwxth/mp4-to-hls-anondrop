import VideoConverter from './components/VideoConverter'
import { FileVideo } from 'lucide-react'
import './index.css'
import { useState } from 'react'

function App() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);


  return (
    <div className="min-h-screen flex flex-col items-center justify-start gap-6 bg-gray-50 p-8">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileVideo className="w-12 h-12 text-blue-600" />
          <h1 className="text-4xl font-bold">MP4 to HLS Converter</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Convert MP4 videos to HLS format and upload to AnonDrop
        </p>
      </div>
      
      <VideoConverter/>
      
      {loading && <div className="loader">Loading...</div>}
      <div className="status">{status}</div>
      
      <footer className="text-center text-gray-500 text-sm mt-8">
      <div className="mt-6 text-center text-gray-500 text-sm">
    created by <a href="https://github.com/rdwxth" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">github.com/rdwxth</a> | 
    join us on <a href="https://discord.gg/streamflix" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">discord.gg/streamflix</a> | 
    sponsored by <a href="https://anondrop.net" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">anondrop.net</a>
  </div>
        All processing happens in your browser • No files are stored on our servers
      </footer>
    </div>

  )
}

export default App
