import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { Power, Fan, Lightbulb, Lock, Unlock, ShieldAlert } from 'lucide-react';

// !!! IMPORTANT: Paste your actual deployed Contract Address and ABI here !!!
const CONTRACT_ADDRESS = "0x6fa956F6a1337c397F293A8dE241905A7799DCC8";
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_action",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_user",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_timestamp",
				"type": "uint256"
			}
		],
		"name": "addLog",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLogs",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "action",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "user",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					}
				],
				"internalType": "struct HomeSecurity.Log[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "securityLogs",
		"outputs": [
			{
				"internalType": "string",
				"name": "action",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "user",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

function App() {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // --- Visual State Tracking ---
  // We use this to animate the icons on the screen instantly
  const [deviceStatus, setDeviceStatus] = useState({
    door: 'locked', // 'locked' or 'unlocked'
    light: false,   // true (on) or false (off)
    fan: false,     // true (spinning) or false (stopped)
    mcb: true       // true (normal) or false (lockdown)
  });

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const rawLogs = await contract.getLogs();
      
      const formattedLogs = rawLogs.map(log => ({
        action: log.action,
        user: log.user,
        timestamp: Number(log.timestamp) * 1000
      })).reverse();

      setLogs(formattedLogs);
    } catch (error) {
      console.error("Blockchain read error:", error);
    }
    setLoadingLogs(false);
  };

  useEffect(() => {
    if (CONTRACT_ADDRESS !== "PASTE_YOUR_0x_ADDRESS_HERE") {
      fetchLogs();
    }
  }, []);

  const sendCommand = async (device, command) => {
    if (!deviceStatus.mcb && command !== "MCB_ON") {
      alert("SYSTEM IN LOCKDOWN: Cannot send commands until MCB is restored.");
      return;
    }

    setActionLoading(command);
    
    // Optimistically update the visuals
    if (command === "DOOR_OPEN") setDeviceStatus(prev => ({ ...prev, door: 'unlocked' }));
    if (command === "DOOR_CLOSE") setDeviceStatus(prev => ({ ...prev, door: 'locked' }));
    if (command === "LIGHT_ON") setDeviceStatus(prev => ({ ...prev, light: true }));
    if (command === "LIGHT_OFF") setDeviceStatus(prev => ({ ...prev, light: false }));
    if (command === "FAN_ON") setDeviceStatus(prev => ({ ...prev, fan: true }));
    if (command === "FAN_OFF") setDeviceStatus(prev => ({ ...prev, fan: false }));
    if (command === "MCB_OFF") setDeviceStatus({ door: 'locked', light: false, fan: false, mcb: false });
    if (command === "MCB_ON") setDeviceStatus(prev => ({ ...prev, mcb: true }));

    try {
      await axios.post('http://localhost:5000/api/device/control', {
        device: device,
        command: command,
        user: "Admin (Vansh)"
      });
      setTimeout(fetchLogs, 1500);
    } catch (error) {
      console.error("Backend error:", error);
    }
    setActionLoading(null);
  };

  return (
    <div className={`min-h-screen p-8 font-sans transition-colors duration-500 ${!deviceStatus.mcb ? 'bg-red-950' : 'bg-gray-900'} text-white`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-end border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-4xl font-black text-blue-400 tracking-tight flex items-center gap-3">
              <Power className={!deviceStatus.mcb ? 'text-red-500 animate-pulse' : 'text-blue-400'} size={36} />
              Smart Home Command
            </h1>
            <p className="text-gray-400 mt-2 text-lg">Live Visualization & Blockchain Audit</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold border ${deviceStatus.mcb ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-red-900/50 border-red-500 text-red-500 animate-pulse'}`}>
            {deviceStatus.mcb ? 'SYSTEM ONLINE' : 'CRITICAL LOCKDOWN'}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- VISUAL DASHBOARD (LEFT SIDE) --- */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* DOOR CARD */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col items-center justify-between">
              <div className="w-full flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-gray-300">Main Door</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${deviceStatus.door === 'unlocked' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                  {deviceStatus.door.toUpperCase()}
                </span>
              </div>
              <div className="py-8">
                {deviceStatus.door === 'unlocked' ? (
                  <Unlock size={80} className="text-green-500" />
                ) : (
                  <Lock size={80} className="text-red-500" />
                )}
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button onClick={() => sendCommand("Main Door", "DOOR_OPEN")} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition">Unlock</button>
                <button onClick={() => sendCommand("Main Door", "DOOR_CLOSE")} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition">Lock</button>
              </div>
            </div>

            {/* LIGHTING CARD */}
            <div className={`bg-gray-800 p-6 rounded-2xl border ${deviceStatus.light ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'border-gray-700 shadow-xl'} flex flex-col items-center justify-between transition-all duration-500`}>
              <div className="w-full flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-gray-300">Living Room Light</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${deviceStatus.light ? 'bg-yellow-900/50 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
                  {deviceStatus.light ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="py-8">
                <Lightbulb size={80} className={`transition-all duration-500 ${deviceStatus.light ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'text-gray-600'}`} />
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button onClick={() => sendCommand("Living Room Light", "LIGHT_ON")} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition">Turn On</button>
                <button onClick={() => sendCommand("Living Room Light", "LIGHT_OFF")} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition">Turn Off</button>
              </div>
            </div>

            {/* FAN CARD */}
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col items-center justify-between">
              <div className="w-full flex justify-between items-center mb-4">
                <span className="text-xl font-bold text-gray-300">Climate Fan</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${deviceStatus.fan ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                  {deviceStatus.fan ? 'SPINNING' : 'STOPPED'}
                </span>
              </div>
              <div className="py-8">
                <Fan size={80} className={`${deviceStatus.fan ? 'text-blue-400 animate-spin' : 'text-gray-600'} transition-colors duration-500`} style={{ animationDuration: '0.8s' }} />
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button onClick={() => sendCommand("Ceiling Fan", "FAN_ON")} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition">Start</button>
                <button onClick={() => sendCommand("Ceiling Fan", "FAN_OFF")} className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-bold transition">Stop</button>
              </div>
            </div>

            {/* MCB MASTER SWITCH */}
            <div className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-center items-center text-center ${deviceStatus.mcb ? 'bg-gray-800 border-gray-700' : 'bg-red-900/30 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}>
              <ShieldAlert size={64} className={`mb-4 ${deviceStatus.mcb ? 'text-gray-600' : 'text-red-500 animate-bounce'}`} />
              <h3 className="text-xl font-black mb-2">{deviceStatus.mcb ? 'Master Power' : 'SYSTEM HALTED'}</h3>
              <p className="text-sm text-gray-400 mb-6">Triggers physical alarm and cuts hardware power.</p>
              
              {deviceStatus.mcb ? (
                <button 
                  onClick={() => sendCommand("Master System", "MCB_OFF")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl transition shadow-lg"
                >
                  TRIP MCB (LOCKDOWN)
                </button>
              ) : (
                <button 
                  onClick={() => sendCommand("Master System", "MCB_ON")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl transition shadow-lg animate-pulse"
                >
                  RESTORE POWER
                </button>
              )}
            </div>

          </div>

          {/* --- BLOCKCHAIN AUDIT (RIGHT SIDE) --- */}
          <div className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl flex flex-col h-[800px]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
              <h2 className="text-xl font-bold text-white">Blockchain Ledger</h2>
              <button onClick={fetchLogs} className="text-xs bg-blue-600 hover:bg-blue-500 font-bold px-3 py-1.5 rounded transition">
                {loadingLogs ? "Syncing..." : "Refresh"}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center text-gray-500 italic mt-10">
                  Ledger is empty. Make sure Ganache is running and connected.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-500 mb-1">{new Date(log.timestamp).toLocaleString()}</div>
                    <div className="font-mono text-green-400 text-sm">{log.action}</div>
                    <div className="text-xs text-blue-400 mt-2 text-right">by {log.user}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;