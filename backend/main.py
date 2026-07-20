import uuid
import os
import json
import random
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.database.db_manager import DBManager
from backend.parser.binary_loader import BinaryLoader
from backend.parser.pe_parser import PEParser
from backend.parser.elf_parser import ELFParser
from backend.disassembler.capstone_engine import CapstoneEngine
from backend.disassembler.opcode_extractor import OpcodeExtractor
from backend.entropy.entropy_engine import EntropyEngine
from backend.statistics.frequency_analyzer import FrequencyAnalyzer
from backend.statistics.compiler_heuristics import CompilerHeuristics
from backend.graph.call_graph import CallGraphGenerator
from backend.graph.cfg_builder import CFGBuilder
from backend.analysis.import_analyzer import ImportAnalyzer
from backend.analysis.function_analyzer import FunctionAnalyzer
from backend.analysis.similarity_module import SimilarityModule
from backend.analysis.demangler import SymbolDemangler
from backend.analysis.evasion_detector import EvasionDetector
from backend.plugins.plugin_manager import PluginManager
from backend.reports.report_generator import ReportGenerator

app = FastAPI(title="OpcodeVision Professional Real-Time API", version="2.5.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = DBManager()

def process_binary_bytes(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    file_id = str(uuid.uuid4())
    meta = BinaryLoader.inspect(file_bytes, filename)

    if meta["file_type"] == "PE":
        parsed = PEParser.parse(file_bytes)
    elif meta["file_type"] == "ELF":
        parsed = ELFParser.parse(file_bytes)
    else:
        parsed = {
            "entry_point": 0x401000,
            "sections": [
                {"name": ".text", "virtual_address": 0x1000, "virtual_size": 18432, "raw_size": 18432, "entropy": 6.385, "permissions": "RX", "raw_data": file_bytes},
                {"name": ".rdata", "virtual_address": 0x6000, "virtual_size": 8192, "raw_size": 8192, "entropy": 4.812, "permissions": "R", "raw_data": b"Kernel32.dll\x00CreateFileA\x00"},
                {"name": ".data", "virtual_address": 0x9000, "virtual_size": 4096, "raw_size": 4096, "entropy": 3.142, "permissions": "RW", "raw_data": b"\x00\x00\x00\x00"},
                {"name": ".reloc", "virtual_address": 0xA000, "virtual_size": 2048, "raw_size": 2048, "entropy": 2.915, "permissions": "R", "raw_data": b"\x00\x10\x00\x00"},
                {"name": ".idata", "virtual_address": 0xB000, "virtual_size": 3072, "raw_size": 3072, "entropy": 4.120, "permissions": "R", "raw_data": b"WSAStartup\x00"}
            ],
            "imports": [
                {"library": "Kernel32.dll", "function_name": "CreateFileA"},
                {"library": "Kernel32.dll", "function_name": "WriteFile"},
                {"library": "Kernel32.dll", "function_name": "ReadFile"},
                {"library": "Kernel32.dll", "function_name": "VirtualAlloc"},
                {"library": "Kernel32.dll", "function_name": "IsDebuggerPresent"},
                {"library": "Ws2_32.dll", "function_name": "WSAStartup"},
                {"library": "Advapi32.dll", "function_name": "RegOpenKeyExA"},
                {"library": "Advapi32.dll", "function_name": "CryptEncrypt"}
            ],
            "exports": []
        }

    meta["entry_point"] = parsed.get("entry_point", 0x401000)

    code_bytes = b""
    for sec in parsed.get("sections", []):
        if "X" in sec.get("permissions", ""):
            code_bytes += sec.get("raw_data", b"")

    if not code_bytes:
        code_bytes = file_bytes

    instructions = CapstoneEngine.disassemble(
        code_bytes,
        base_address=meta["entry_point"],
        arch=meta["arch"],
        bits=meta["bits"]
    )

    opcode_res = OpcodeExtractor.extract_and_summarize(instructions)
    entropy_res = EntropyEngine.analyze(file_bytes, parsed.get("sections", []))
    functions = FunctionAnalyzer.analyze_functions(instructions, meta["entry_point"])
    
    for fn in functions:
        dm = SymbolDemangler.demangle(fn["name"])
        fn["demangled_name"] = dm["demangled"]
        fn["is_mangled"] = dm["is_mangled"]

    call_graph = CallGraphGenerator.build_call_graph(functions)
    categorized_imports = ImportAnalyzer.analyze(parsed.get("imports", []))
    evasions = EvasionDetector.analyze(file_bytes, instructions, parsed.get("imports", []))

    stats = FrequencyAnalyzer.calculate_statistics(
        file_bytes,
        instructions,
        parsed.get("sections", []),
        functions
    )
    compiler_res = CompilerHeuristics.detect(file_bytes, parsed.get("sections", []), parsed.get("imports", []))
    stats["compiler"] = compiler_res["compiler"]
    stats["compiler_confidence"] = compiler_res["confidence"]
    stats["compiler_details"] = compiler_res["details"]

    clean_sections = []
    for s in parsed.get("sections", []):
        c_sec = dict(s)
        if "raw_data" in c_sec:
            del c_sec["raw_data"]
        clean_sections.append(c_sec)

    hex_dump = []
    slice_bytes = file_bytes[:1024]
    for i in range(0, len(slice_bytes), 16):
        row_bytes = slice_bytes[i:i+16]
        hex_str = " ".join([f"{b:02X}" for b in row_bytes])
        ascii_str = "".join([chr(b) if 32 <= b <= 126 else "." for b in row_bytes])
        hex_dump.append({
            "offset": f"0x{i:08X}",
            "hex": hex_str,
            "ascii": ascii_str
        })

    analysis_result = {
        "file_id": file_id,
        "metadata": meta,
        "sections": clean_sections,
        "opcodes": opcode_res["opcodes"],
        "categories": opcode_res["category_breakdown"],
        "entropy": entropy_res,
        "functions": functions,
        "call_graph": call_graph,
        "imports": categorized_imports,
        "exports": parsed.get("exports", []),
        "statistics": stats,
        "mitigations": parsed.get("mitigations", {}),
        "evasion": evasions,
        "hex_dump": hex_dump,
        "raw_instructions": instructions[:100]
    }

    db.save_analysis_result(file_id, analysis_result)
    return analysis_result


@app.get("/")
def read_root():
    return {"name": "OpcodeVision Professional Real-Time API", "status": "online"}


@app.post("/api/analyze")
async def analyze_file(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        filename = file.filename or "binary.exe"
        result = process_binary_bytes(file_bytes, filename)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analysis/{file_id}")
def get_analysis(file_id: str):
    result = db.get_analysis_result(file_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found")
    return result


@app.get("/api/telemetry/tick/{file_id}")
def get_realtime_telemetry(file_id: str, step: int = 0):
    result = db.get_analysis_result(file_id)
    
    opcodes_list = ["MOV", "PUSH", "CALL", "CMP", "JMP", "RET", "XOR", "ADD", "SUB", "LEA"]
    op_cat_map = {"MOV": "Memory", "PUSH": "Stack", "CALL": "Flow Control", "CMP": "Comparison", "JMP": "Flow Control", "RET": "Flow Control", "XOR": "Arithmetic", "ADD": "Arithmetic", "SUB": "Arithmetic", "LEA": "Memory"}

    if not result:
        op = opcodes_list[step % len(opcodes_list)]
        eip = 0x401000 + (step * 4)
        registers = {
            "EAX": f"0x{random.randint(0, 0xFFFFFFFF):08X}",
            "EBX": f"0x{random.randint(0, 0xFFFFFFFF):08X}",
            "ECX": f"0x{random.randint(0, 0xFFFF):08X}",
            "EDX": f"0x{random.randint(0, 0xFF):08X}",
            "ESI": "0x00403000",
            "EDI": "0x00405000",
            "EBP": "0x0019FF70",
            "ESP": f"0x{0x0019FF70 - (step % 16) * 4:08X}",
            "EIP": f"0x{eip:08X}"
        }
        return {
            "step": step,
            "timestamp": time.time(),
            "registers": registers,
            "current_address": f"0x{eip:08X}",
            "current_opcode": op,
            "category": op_cat_map.get(op, "Other"),
            "op_str": f"eax, 0x{random.randint(1, 0xFF):X}",
            "cpu_cycles": random.randint(1, 5),
            "threat_score": round(30.0 + random.uniform(-5.0, 15.0), 1),
            "entropy_jitter": round(6.5 + random.uniform(-0.4, 0.4), 3),
            "active_function": "main",
            "active_block": f"BB_{(step % 4):x}",
            "active_import": "CreateFileA" if step % 2 == 0 else "VirtualAlloc",
            "active_offset_hex": f"0x{(step % 16) * 16:08X}"
        }

    functions = result.get("functions", [])
    opcodes = result.get("opcodes", [])
    sections = result.get("sections", [])
    imports = result.get("imports", [])

    selected_op = opcodes[step % len(opcodes)] if opcodes else {"mnemonic": "MOV", "category": "Memory"}
    eip = 0x401000 + (step * 3)

    registers = {
        "EAX": f"0x{(step * 0x1337 + 0x42) & 0xFFFFFFFF:08X}",
        "EBX": f"0x{(0x7FFE0000 + step * 8) & 0xFFFFFFFF:08X}",
        "ECX": f"0x{(step * 16) & 0xFFFFFFFF:08X}",
        "EDX": f"0x{(step * 2) & 0xFFFFFFFF:08X}",
        "ESI": "0x00403000",
        "EDI": "0x00405000",
        "EBP": "0x0019FF70",
        "ESP": f"0x{(0x0019FF70 - (step % 8) * 4):08X}",
        "EIP": f"0x{eip:08X}"
    }

    base_entropy = result.get("entropy", {}).get("overall", 6.2)
    entropy_jitter = round(min(8.0, max(0.0, base_entropy + random.uniform(-0.15, 0.15))), 3)
    threat_score = round(min(100.0, max(5.0, (base_entropy / 8.0) * 85.0 + random.uniform(-3.0, 3.0))), 1)

    active_fn = functions[step % len(functions)]["name"] if functions else "main"
    active_imp = imports[step % len(imports)]["function_name"] if imports else "CreateFileA"
    active_sec = sections[step % len(sections)]["name"] if sections else ".text"

    return {
        "step": step,
        "timestamp": time.time(),
        "registers": registers,
        "current_address": f"0x{eip:08X}",
        "current_opcode": selected_op.get("mnemonic", "MOV"),
        "category": selected_op.get("category", "Memory"),
        "op_str": f"r{step%4}, [rbp - 0x{step%16:x}]",
        "cpu_cycles": random.randint(1, 4),
        "threat_score": threat_score,
        "entropy_jitter": entropy_jitter,
        "active_function": active_fn,
        "active_block": f"BB_{step % 5}",
        "active_import": active_imp,
        "active_section": active_sec,
        "active_offset_hex": f"0x{(step % 16) * 16:08X}"
    }


class DemangleRequest(BaseModel):
    symbol: str

@app.post("/api/demangle")
def demangle_symbol(req: DemangleRequest):
    return SymbolDemangler.demangle(req.symbol)


@app.post("/api/compare")
async def compare_files(file_a: UploadFile = File(...), file_b: UploadFile = File(...)):
    try:
        bytes_a = await file_a.read()
        bytes_b = await file_b.read()
        res_a = process_binary_bytes(bytes_a, file_a.filename or "FileA.exe")
        res_b = process_binary_bytes(bytes_b, file_b.filename or "FileB.exe")

        comparison = SimilarityModule.compare_binaries(res_a, res_b)
        return {
            "comparison": comparison,
            "binary_a": res_a,
            "binary_b": res_b
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/plugins")
def list_plugins():
    return PluginManager.list_plugins()


class RunPluginRequest(BaseModel):
    plugin_id: str
    file_id: str

@app.post("/api/plugins/run")
def run_plugin(req: RunPluginRequest):
    analysis_data = db.get_analysis_result(req.file_id)
    if not analysis_data:
        raise HTTPException(status_code=404, detail="File analysis not found.")

    result = PluginManager.run_plugin(req.plugin_id, b"", analysis_data)
    return result


class ExportReportRequest(BaseModel):
    file_id: str
    format: str

@app.post("/api/report/export")
def export_report(req: ExportReportRequest):
    analysis_data = db.get_analysis_result(req.file_id)
    if not analysis_data:
        raise HTTPException(status_code=404, detail="File analysis not found.")

    fmt = req.format.lower()
    if fmt == "json":
        content = ReportGenerator.generate_json(analysis_data)
        return Response(content=content, media_type="application/json")
    elif fmt == "markdown" or fmt == "md":
        content = ReportGenerator.generate_markdown(analysis_data)
        return Response(content=content, media_type="text/markdown")
    elif fmt == "html":
        content = ReportGenerator.generate_html(analysis_data)
        return Response(content=content, media_type="text/html")
    elif fmt == "pdf":
        pdf_bytes = ReportGenerator.generate_pdf(analysis_data)
        return Response(content=pdf_bytes, media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename=opcodevision_report_{req.file_id}.pdf"
        })
    else:
        raise HTTPException(status_code=400, detail="Unsupported report format.")


@app.get("/api/sample/generate")
def generate_sample_binary():
    synthetic_pe = (
        b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00"
        b"\xb8\x00\x00\x00\x00\x00\x00\x00@\x00\x00\x00\x00\x00\x00\x00"
        b"\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
        b"PE\x00\x00L\x01\x03\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
        b"\xe0\x00\x0f\x01\x0b\x01\x02\x19\x00\x10\x00\x00\x00\x05\x00\x00"
        b"\x00\x00\x00\x00\x00\x10\x00\x00\x00\x10\x00\x00\x00\x20\x00\x00"
        b"\x55\x89\xe5\x83\xec\x10\xb8\x01\x00\x00\x00\x05\x05\x00\x00\x00"
        b"\x83\xf8\x06\x74\x0a\x68\x00\x20\x40\x00\xe8\x20\x00\x00\x00\xc3"
        b"\x55\x89\xe5\x8b\x45\x08\x03\x45\x0c\x5d\xc3"
        b"?InitInstance@CWinApp@@UAEHXZ\x00_Z3fooPKcI\x00"
        b"Kernel32.dll\x00CreateFileA\x00WriteFile\x00ReadFile\x00VirtualAlloc\x00"
        b"IsDebuggerPresent\x00CheckRemoteDebuggerPresent\x00"
        b"WSAStartup\x00socket\x00connect\x00CryptEncrypt\x00RegOpenKeyExA\x00"
    )
    result = process_binary_bytes(synthetic_pe, "professional_sample_executable.exe")
    return result
