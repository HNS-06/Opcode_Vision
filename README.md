# 🔍 OpcodeVision (OpcodeScope)

> **A Cross-Platform Static Binary Analysis & Real-Time Telemetry Disassembler Platform**

OpcodeVision is an enterprise-grade static binary analysis engine and interactive dashboard that disassembles executables (PE, ELF, raw binary), computes Shannon entropy profiles, categorizes instruction sets, detects compiler patterns & security evasions, visualizes Call & Control Flow Graphs (CFG), compares binary similarities, and streams real-time disassembly telemetry.

---

## ⚡ Key Feature Highlights

- ⚙️ **Multi-Format Binary Parser**: Supports Windows PE (`.exe`, `.dll`, `.sys`), Linux ELF, and raw binary streams. Extracts PE/ELF headers, section tables, entry points, and security mitigations (**ASLR**, **DEP/NX**, **SafeSEH**).
- 🧩 **Capstone Disassembly Engine**: Machine code disassembly across x86, x64, ARM, and ARM64 with instruction address mapping, hex bytes, and operand decoding.
- 📊 **Opcode Categorization & Frequency Statistics**: Categorizes every instruction into **Arithmetic**, **Flow Control**, **Stack**, **Memory**, **Comparison**, **String**, and **SIMD/Vector** families.
- 📈 **Shannon Entropy Engine**: Calculates overall Shannon entropy ($0.0$ to $8.0$ bits/byte), per-section entropy, and multi-point sliding-window entropy curves to pinpoint packed or encrypted byte sequences.
- 📡 **Real-Time Telemetry & CPU Register Simulator**: Real-time instruction stream disassembler with live x86_64 CPU register tracing (`EAX`, `EBX`, `ECX`, `EDX`, `ESI`, `EDI`, `EBP`, `ESP`, `EIP`) and oscillating threat risk dials.
- 🌿 **Interactive Cytoscape.js Graphs**: Interactive Inter-procedural Call Graphs and per-function Control Flow Graphs (CFG) decomposing assembly into basic blocks with Cyclomatic Complexity ($E - V + 2$).
- 🛡️ **Anti-Analysis & Evasion Detector**: Identifies anti-debugging APIs (`IsDebuggerPresent`, `CheckRemoteDebuggerPresent`), hypervisor checks (`CPUID`, `RDTSC`, `SIDT`), and direct `SYSCALL` bypasses.
- 🔓 **FLOSS & XOR String Extractor**: Extracts ASCII and UTF-16 strings alongside single-byte XOR deobfuscated strings (`0x01`–`0xFF`).
- 🧩 **C++ Symbol Demangler**: Demangles MSVC C++ mangled symbols (`?Name@Class@@...`) and GCC / Clang Itanium ABI symbols (`_Z...`).
- 🔄 **Binary Similarity & Diffing**: Compares two binaries side-by-side using Opcode Cosine Similarity, Jaccard Index, and shared import overlap.
- 📄 **Multi-Format Report Generator**: One-click exporting into **PDF** (via ReportLab), **HTML**, **Markdown**, and **JSON**.

---

## 🛠️ Technology Stack

### Backend Analysis Engine
- **Language**: Python 3.13
- **Framework**: FastAPI + Uvicorn
- **Disassembly Engine**: Capstone Engine (`capstone`)
- **Parsers**: `pefile` (PE/COFF), `pyelftools` (ELF)
- **Graphing & Math**: `networkx`, `numpy`, `scikit-learn`
- **PDF Exporter**: `reportlab`
- **Database**: SQLite 3

### Frontend Dashboard
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4 + Dark Glassmorphism
- **Iconography**: Lucide React
- **Charts**: Chart.js + `react-chartjs-2`
- **Graph Canvas**: Cytoscape.js + `cytoscape-dagre`

---

## 📂 Project Structure

```
OpcodeVision/
├── backend/
│   ├── main.py                     # FastAPI entry point & API routes
│   ├── database/
│   │   ├── schema.sql              # SQLite schema definition
│   │   └── db_manager.py           # Database persistence manager
│   ├── parser/
│   │   ├── binary_loader.py        # File magic byte & hash detector
│   │   ├── pe_parser.py            # Windows PE header & import parser
│   │   └── elf_parser.py           # Linux ELF parser
│   ├── disassembler/
│   │   ├── capstone_engine.py      # Capstone disassembler wrapper
│   │   └── opcode_extractor.py     # Opcode extraction & categorization
│   ├── entropy/
│   │   └── entropy_engine.py       # Shannon entropy & sliding window
│   ├── statistics/
│   │   ├── frequency_analyzer.py   # Code/Data ratio & instruction density
│   │   └── compiler_heuristics.py  # Compiler toolchain detector
│   ├── graph/
│   │   ├── call_graph.py           # Inter-procedural Call Graph generator
│   │   └── cfg_builder.py          # Control Flow Graph basic block builder
│   ├── analysis/
│   │   ├── import_analyzer.py      # Domain API call classifier
│   │   ├── function_analyzer.py    # Function boundary extractor
│   │   ├── similarity_module.py    # Jaccard & Cosine similarity engine
│   │   ├── demangler.py            # C++ symbol demangler
│   │   └── evasion_detector.py     # Anti-debug & anti-VM detector
│   ├── plugins/
│   │   ├── plugin_manager.py       # Plugin loader
│   │   ├── strings_plugin.py       # FLOSS & XOR string extractor
│   │   ├── yara_plugin.py          # YARA rule scanner
│   │   └── entropy_plugin.py       # Entropy anomaly detector
│   └── reports/
│       └── report_generator.py     # PDF, HTML, Markdown & JSON exporter
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                 # Central React App component
│       ├── index.css               # Tailwind CSS design system
│       ├── components/             # Dashboard tab components
│       └── services/
│           └── api.js              # REST API client
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python**: 3.10+
- **Node.js**: 18+ & npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/HNS-06/Opcode_Vision.git
cd Opcode_Vision

# Install Python dependencies
py -m pip install capstone lief networkx reportlab fastapi uvicorn pefile pyelftools scikit-learn numpy pandas

# Start FastAPI Backend Server
py -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend API server will run at: `http://127.0.0.1:8000` (Swagger Docs: `http://127.0.0.1:8000/docs`)

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node packages
npm install

# Start Vite Development Server
npm run dev
```
Web Dashboard will run at: `http://localhost:5173`

---

## 📖 Operational Guide

1. Open `http://localhost:5173/` in your browser.
2. Drag and drop any PE/ELF binary or click **"Demo Executable"** for an instant real-time analysis walkthrough.
3. Explore the dashboard tabs:
   - **Overview**: Metadata, hashes, mitigations, and compiler signatures.
   - **Live Monitor**: Real-time instruction disassembler stream with x86_64 register simulation.
   - **Opcode Charts**: Top 10 frequency bar chart and category breakdown pie chart.
   - **Entropy Engine**: Sliding window entropy curve and section risk breakdown.
   - **Sections & API Imports**: Executable memory headers and domain-classified system calls.
   - **Evasion Detector**: Anti-debugging, anti-VM, and direct syscall detection.
   - **Demangler & Hex Inspector**: C++ symbol demangler and low-level 16-byte hex inspector.
   - **Graphs & CFG**: Interactive Call Graphs and function Control Flow Graphs.
   - **Compare & Reports**: Side-by-side binary similarity diffing and one-click PDF/HTML/Markdown exports.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

Developed for static binary analysis, reverse engineering, and threat intelligence research.
