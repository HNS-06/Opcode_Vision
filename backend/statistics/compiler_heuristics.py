from typing import List, Dict, Any

class CompilerHeuristics:
    @staticmethod
    def detect(file_bytes: bytes, sections: List[Dict[str, Any]], imports: List[Dict[str, Any]]) -> Dict[str, Any]:
        sec_names = [s.get("name", "").lower() for s in sections]
        imp_names = [i.get("function_name", "").lower() for i in imports]
        imp_libs = [i.get("library", "").lower() for i in imports]

        detected = "Unknown"
        confidence = 0.5
        details = []

        # Check section markers
        if any("upx" in s for s in sec_names):
            detected = "UPX Packed Executable"
            confidence = 0.95
            details.append("Found UPX section headers (.UPX0, .UPX1)")
        elif any(".gopclnt" in s or ".go.buildinfo" in s for s in sec_names):
            detected = "Go Compiler (Golang)"
            confidence = 0.90
            details.append("Found Go runtime section headers (.gopclnt)")
        elif any(".rustc" in s or "rust_" in f for s in sec_names for f in imp_names):
            detected = "Rust Compiler (rustc)"
            confidence = 0.90
            details.append("Found Rust symbols or section headers")
        elif any("mingw" in l or "msvcrt" in l for l in imp_libs) or any("mingw" in f for f in imp_names):
            detected = "MinGW (GCC for Windows)"
            confidence = 0.85
            details.append("Found MinGW runtime imports (msvcrt / __mingw_)")
        elif any(".eh_frame" in s or ".gcc_except_table" in s for s in sec_names):
            detected = "GCC / GNU Toolchain"
            confidence = 0.85
            details.append("Found GCC exception table sections (.eh_frame)")
        elif any("clang" in s for s in sec_names) or b"clang" in file_bytes.lower():
            detected = "LLVM / Clang Compiler"
            confidence = 0.80
            details.append("Found Clang string markers or symbols")
        elif any("vcruntime" in l or "msvcr" in l or "api-ms-win-crt" in l for l in imp_libs):
            detected = "Microsoft Visual C++ (MSVC)"
            confidence = 0.90
            details.append("Found MSVC CRT runtime DLL imports")
        elif any(".rdata" in s for s in sec_names):
            detected = "Microsoft Visual C++ (MSVC)"
            confidence = 0.70
            details.append("Standard MSVC section layout (.text, .rdata, .data)")

        return {
            "compiler": detected,
            "confidence": confidence,
            "details": details
        }
