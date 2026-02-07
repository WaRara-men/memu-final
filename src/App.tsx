import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { GlitchCore } from './components/GlitchCore';
import { memuApi, MemoryItem } from './services/memu';
import { Search, BrainCircuit, Terminal, Save, Database, HardDrive } from 'lucide-react';

function App() {
  const [query, setQuery] = useState('');
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [mode, setMode] = useState<'retrieve' | 'memorize'>('retrieve');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [memoryCount, setMemoryCount] = useState(6); // Default to Chaos Mode (Level 3)
  const [logs, setLogs] = useState<string[]>([]); // System logs
  const [isExploding, setIsExploding] = useState(false); // Explosion trigger

  // Calculate memory level (0, 1, 2)
  const memoryLevel = memoryCount < 3 ? 0 : memoryCount < 6 ? 1 : 2;

  // Glitched Voice Synthesis
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 0.5 + Math.random() * 0.5; // Deep robotic pitch
    utterance.rate = 0.8 + Math.random() * 0.4;  // Unstable speed
    utterance.volume = 1.0;
    // Try to find a robotic voice
    const voices = window.speechSynthesis.getVoices();
    const robotVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Desktop')) || voices[0];
    if (robotVoice) utterance.voice = robotVoice;
    
    window.speechSynthesis.cancel(); // Stop previous
    window.speechSynthesis.speak(utterance);
  };

  // Hack-style log generator
  const addLog = (msg: string) => {
    // Zalgo text generator
    const zalgoChars = ['̶', '̵', '̴', '̵', '̼', '̢', '͎', '͚', '͛', '͜', '͝', '͞', '͟', '͠', '͡', '͢', 'ͣ', 'ͤ', 'ͥ', 'ͦ', 'ͧ', 'ͨ', 'ͩ', 'ͪ', 'ͫ', 'ͬ', 'ͭ', 'ͮ', 'ͯ'];
    const corruptedMsg = msg.split('').map(char => char + (Math.random() > 0.7 ? zalgoChars[Math.floor(Math.random() * zalgoChars.length)] : '')).join('');
    setLogs(prev => [`> ${corruptedMsg}`, ...prev].slice(0, 8));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setIsGlitching(true);
    setMemories([]);
    setStatusMessage(null);
    setLogs([]); // Clear previous logs

    // Sound Effect: Glitch Noise
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {}); // Ignore autoplay errors
    
    // Speak status
    speak(mode === 'retrieve' ? "Accessing Neural Network" : "Initiating Memory Sequence");

    // Fake Hacking Logs
    const fakeLogs = [
        "Connecting to neural network...",
        "Bypassing firewalls...",
        "Synapse firing sequence initiated...",
        "Searching deep memory archives...",
        "Decrypting memory fragments...",
        "Access granted."
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
        if (logIndex < fakeLogs.length) {
            addLog(fakeLogs[logIndex]);
            logIndex++;
        } else {
            clearInterval(logInterval);
        }
    }, 150);

    try {
      // Simulate "scanning" delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (mode === 'retrieve') {
        const result = await memuApi.retrieve(query);
        setMemories(result.items);
        speak("Memory Fragments Found");
      } else {
        await memuApi.memorize(query);
        setStatusMessage("MEMORY_FRAGMENT_STORED_SUCCESSFULLY");
        speak("Memory Stored Successfully");
        setMemoryCount(prev => prev + 1); // Increase memory count on save
        
        // Level Up Sound if evolved
        if (memoryCount === 2 || memoryCount === 5) {
             const levelUpAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
             levelUpAudio.play().catch(() => {});
        }

        setQuery(''); // Clear input after save
      }
    } catch (err) {
      console.error(err);
      if (mode === 'retrieve') {
        // Fallback/Mock data if API fails (so the demo always looks cool)
        setMemories([
          { memory_type: 'ERROR_LOG', content: 'Connection instability detected in neural link...' },
          { memory_type: 'SYSTEM', content: 'Retrying handshake with MemU Core...' },
          { memory_type: 'CACHE', content: 'Displaying residual memory fragments.' }
        ]);
      } else {
        setStatusMessage("ERROR: MEMORY_WRITE_FAILED");
      }
    } finally {
      setLoading(false);
      // Keep glitching a bit longer then stop
      setTimeout(() => setIsGlitching(false), 500);
    }
  };

  const handleCoreClick = () => {
      setIsExploding(true);
      speak("System Critical. Explosion Imminent.");
      // Reset explosion after animation
      setTimeout(() => setIsExploding(false), 500);
  };

  return (
    <div className={`relative w-full h-full bg-black text-cyan-400 font-mono overflow-hidden ${memoryLevel === 2 ? 'chaos-mode' : ''} ${isGlitching && memoryLevel === 2 ? 'chaos-flash' : ''}`}>
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0 cursor-pointer" onClick={handleCoreClick}>
        <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <GlitchCore isGlitching={isGlitching} isExploding={isExploding} intensity={loading ? 2.5 : 0.5} memoryLevel={memoryLevel} />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5 + (memoryLevel * 0.5)} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-8 pointer-events-none">
        
        {/* System Logs (Top Left) */}
        <div className="absolute top-24 left-8 w-64 text-xs font-mono text-cyan-800 pointer-events-none">
            {logs.map((log, i) => (
                <div key={i} className="animate-fadeIn opacity-70">{log}</div>
            ))}
        </div>

        {/* Header */}
        <header className="w-full max-w-4xl flex justify-between items-center opacity-80">
            <div className="flex items-center gap-2">
                <BrainCircuit className={`w-8 h-8 ${memoryLevel === 2 ? 'text-red-500 animate-bounce' : memoryLevel === 1 ? 'text-purple-500 animate-pulse' : 'text-cyan-400 animate-pulse'}`} />
                <h1 className={`text-2xl font-bold tracking-widest uppercase glow-text ${memoryLevel === 2 ? 'text-red-500' : memoryLevel === 1 ? 'text-purple-400' : ''}`}>俺の最強AI Ver.2</h1>
            </div>
            <div className="text-xs text-cyan-700 border border-cyan-900 px-2 py-1 rounded">
                SYSTEM: {memoryLevel === 2 ? 'CRITICAL (LV.3)' : memoryLevel === 1 ? 'EVOLVING (LV.2)' : 'ONLINE (LV.1)'}
            </div>
        </header>

        {/* Results Area (Middle) */}
        <main className="flex-1 w-full max-w-2xl flex flex-col justify-center items-center gap-4 overflow-hidden py-10">
           {loading && (
               <div className="text-xl text-red-500 font-bold animate-bounce tracking-widest">
                   {mode === 'retrieve' ? 'SCANNING NEURAL PATHWAYS...' : 'WRITING TO CORE MEMORY...'}
               </div>
           )}

           {statusMessage && !loading && (
              <div className="text-xl text-green-500 font-bold animate-pulse tracking-widest border border-green-500/50 p-4 rounded bg-green-500/10">
                  {statusMessage}
              </div>
           )}
           
           {!loading && memories.length > 0 && mode === 'retrieve' && (
               <div className="w-full bg-black/50 backdrop-blur-sm border border-cyan-500/30 p-6 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.2)] pointer-events-auto max-h-[60vh] overflow-y-auto custom-scrollbar">
                   <h2 className="text-sm text-cyan-600 mb-4 border-b border-cyan-800 pb-2">RETRIEVED FRAGMENTS:</h2>
                   <div className="space-y-4">
                       {memories.map((m, i) => (
                           <div key={i} className="flex gap-3 group animate-fadeIn" style={{animationDelay: `${i * 100}ms`}}>
                               <span className="text-xs text-cyan-700 mt-1">[{i.toString().padStart(2, '0')}]</span>
                               <div className="flex-1">
                                   <div className="text-xs text-pink-500 uppercase mb-1">{m.memory_type}</div>
                                   <p className="text-white/90 group-hover:text-cyan-300 transition-colors">
                                       {m.content}
                                   </p>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}
        </main>

        {/* Input Area (Bottom) */}
        <div className="w-full max-w-xl pointer-events-auto pb-8 flex flex-col gap-4">
            
            {/* Mode Switcher */}
            <div className="flex justify-center gap-4">
                <button 
                    onClick={() => setMode('retrieve')}
                    className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${mode === 'retrieve' ? 'bg-cyan-900/50 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'bg-black/50 border-cyan-900 text-cyan-700 hover:text-cyan-500'}`}
                >
                    <Search className="w-4 h-4" />
                    <span>RETRIEVE</span>
                </button>
                <button 
                    onClick={() => setMode('memorize')}
                    className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${mode === 'memorize' ? 'bg-pink-900/50 border-pink-400 text-pink-300 shadow-[0_0_10px_rgba(255,0,255,0.3)]' : 'bg-black/50 border-cyan-900 text-cyan-700 hover:text-pink-500'}`}
                >
                    <HardDrive className="w-4 h-4" />
                    <span>MEMORIZE</span>
                </button>
            </div>

            <form onSubmit={handleSearch} className="relative group">
                <div className={`absolute inset-0 blur-md rounded-lg transition-all duration-500 ${mode === 'retrieve' ? 'bg-cyan-500/20 group-hover:bg-cyan-500/30' : 'bg-pink-500/20 group-hover:bg-pink-500/30'}`}></div>
                <div className={`relative flex items-center bg-black/80 border rounded-lg overflow-hidden p-1 transition-colors ${mode === 'retrieve' ? 'border-cyan-500/50' : 'border-pink-500/50'}`}>
                    <Terminal className={`w-5 h-5 ml-3 ${mode === 'retrieve' ? 'text-cyan-600' : 'text-pink-600'}`} />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={mode === 'retrieve' ? "Initialize query sequence..." : "Input memory data for storage..."}
                        className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-white placeholder-cyan-800/50"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className={`p-3 rounded-md transition-colors disabled:opacity-50 ${mode === 'retrieve' ? 'hover:bg-cyan-500/20 text-cyan-400' : 'hover:bg-pink-500/20 text-pink-400'}`}
                    >
                        {mode === 'retrieve' ? <Search className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    </button>
                </div>
            </form>
        </div>
      </div>

      
      <style>{`
        .glow-text {
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* CHAOS ANIMATIONS */
        @keyframes glitch-anim {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        @keyframes rgb-shift {
          0% { text-shadow: 2px 0 red, -2px 0 blue; }
          50% { text-shadow: -2px 0 red, 2px 0 blue; }
          100% { text-shadow: 2px 0 red, -2px 0 blue; }
        }
        @keyframes bg-flash {
            0% { filter: invert(0); }
            10% { filter: invert(1); }
            20% { filter: invert(0); }
            100% { filter: invert(0); }
        }
        
        /* Apply chaos when Level 3 */
        .chaos-mode {
            animation: glitch-anim 0.2s infinite, rgb-shift 0.1s infinite;
        }
        .chaos-flash {
            animation: bg-flash 0.5s;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.5);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #0891b2;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}

export default App;
