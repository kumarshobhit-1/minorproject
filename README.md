# Steps<p align="center">
  <img src="https://github.com/user-attachments/assets/737b9488-faca-4d11-8f56-d99f877b5995" alt="Smart Home Dashboard" width="100%">
</p>

<h1 align="center">Decentralized Smart Home Relayer System</h1>

<p align="center">
  <strong>A hybrid Web2/Web3 IoT architecture bridging ultra-fast hardware control with immutable blockchain security.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity">
  <img src="https://img.shields.io/badge/MQTT-660066?style=for-the-badge&logo=mqtt&logoColor=white" alt="MQTT">
</p>

---

## 📖 Overview
Modern IoT architectures force a compromise between speed and security. Centralized databases are fast but vulnerable to tampering, while standard Web3 decentralized applications (dApps) introduce severe latency and user friction (like MetaMask popups). 

This project solves the "Latency-Security Bottleneck" by introducing an **Admin Relayer Middleware**. When a user clicks a button, the system simultaneously publishes a lightweight MQTT payload for instantaneous physical actuation (<200ms) while asynchronously mining an unalterable security log to an Ethereum blockchain (~2s) in the background.

## ✨ Key Features
* ⚡ **Zero-Friction UI:** Control devices seamlessly without needing a Web3 wallet.
* 🔒 **Immutable Audit Trail:** Every state change is cryptographically signed and stored permanently on-chain.
* 🤖 **Dual-Stream Execution:** Parallel processing prevents slow blockchain consensus from lagging the physical hardware.
* 🔌 **Real-time Simulation:** Complete physical hardware emulation via Wokwi (ESP32, Servos, DHT22, Relays).

---

## 🏗️ System Architecture

1. **Frontend (React.js):** Provides a standard Web2 dashboard and a read-only Web3 ledger viewer.
2. **Backend Relayer (Node.js/Express):** The core routing engine. Secures the admin private key, formats commands, and handles dual-stream dispatch.
3. **Hardware (Wokwi/ESP32):** Subscribes to the HiveMQ public broker and actuates physical GPIO pins based on incoming payloads.
4. **Blockchain (Ganache/Solidity):** A local Ethereum testnet running the `HomeSecurity` smart contract to permanently record access logs.

---

## 🚀 Step-by-Step Running Guide

Follow these instructions strictly to run the full-stack architecture on your local machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [Ganache](https://trufflesuite.com/ganache/) (Local Ethereum Workspace)
* A [Wokwi](https://wokwi.com) account

### Step 1: Clone and Install
Clone the repository and install the necessary dependencies for both the frontend and backend.
```bash
git clone [https://github.com/your-username/minorproject.git](https://github.com/your-username/minorproject.git)
cd minorproject

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
cd ..

### Step 2: Boot the Blockchain
1. Open the **Ganache** application and start a local workspace (RPC Server: `HTTP://127.0.0.1:7545`).
2. Open your browser and navigate to [Remix IDE](https://remix.ethereum.org/).
3. Create a new file in Remix and paste the code from `/blockchain/HomeSecurity.sol`.
4. Compile the contract using compiler version `0.8.x`.
5. Go to the "Deploy & Run Transactions" tab in Remix. Change the Environment to **"Dev - Ganache Provider"**.
6. Click **Deploy**.
7. Copy the deployed **Contract Address** from the console/bottom-left panel.

### Step 3: Configure the Backend Relayer
1. Navigate to the `/backend` folder.
2. Create a file named `.env` and configure your keys:
```env
PORT=5000
CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
PRIVATE_KEY=0xYourGanacheAccountPrivateKeyHere
```
3. Open a dedicated terminal for the backend and start the server:
```bash
cd backend
node index.js
```
*(You should see "Wallet loaded" and "MQTT Connected" in the console).*

### Step 4: Start the IoT Simulation
1. Go to [Wokwi](https://wokwi.com) and create a new ESP32 project.
2. Upload the 4 files located in the `/iot` folder (`sketch.ino`, `diagram.json`, `libraries.txt`, `wokwi-project.txt`) to the simulation environment.
3. Click the green **Play** button. Wait for the terminal to print `WiFi connected!` and `Connected to HiveMQ!`.

### Step 5: Boot the Frontend Dashboard
1. Navigate to the `/frontend` folder and open `src/App.jsx` (or wherever you defined the contract address).
2. Ensure the `CONTRACT_ADDRESS` variable matches the one you deployed in Step 2.
3. Open a **second, separate terminal** for the frontend and run the development server:
```bash
cd frontend
npm run dev
```
4. Open your browser to `http://localhost:5173`.

---

## 🎮 Usage Instructions
With both servers running and Wokwi active:
1. Arrange your windows so you can see the React Dashboard and the Wokwi simulation side-by-side.
2. Click **"Unlock"** on the Main Door card.
3. Watch the Wokwi servo motor actuate instantly.
4. Check the backend terminal to see the Ethers.js transaction confirmation.
5. Click **"Refresh"** on the frontend Blockchain Ledger to view the immutable cryptographic log.

---

## 👥 Team
* **Abhikalp Shikhar** (1230440002) - Frontend Development
* **Shobhit Kumar** (1230440050) - Backend / Relayer API
* **Suryansh Soni** (1230440054) - Blockchain / Smart Contracts
* **Vansh Dixit** (1230440060) - IoT Hardware Simulation

**Babu Banarasi Das University, Lucknow** *B.Tech CSE (IOTBC-3A) | Minor Project 2025* *Under the supervision of Assistant Professor Saurabh Pandey*