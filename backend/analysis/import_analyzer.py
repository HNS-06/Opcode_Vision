from typing import List, Dict, Any

API_DOMAINS = {
    "Networking": ["WSAStartup", "socket", "send", "recv", "connect", "InternetOpen", "HttpOpenRequest", "WinHttpOpen", "curl", "URLDownloadToFile"],
    "Crypto": ["CryptAcquireContext", "CryptEncrypt", "CryptDecrypt", "BCrypt", "AES", "MD5", "SHA256", "CryptGenKey"],
    "Process & Thread": ["CreateProcess", "OpenProcess", "CreateThread", "VirtualAllocEx", "WriteProcessMemory", "CreateRemoteThread", "TerminateProcess", "fork", "execve"],
    "Memory Management": ["VirtualAlloc", "VirtualProtect", "HeapAlloc", "LocalAlloc", "malloc", "free", "mmap", "mprotect"],
    "Registry": ["RegOpenKey", "RegQueryValue", "RegSetValue", "RegCreateKey", "RegDeleteKey"],
    "File I/O": ["CreateFile", "WriteFile", "ReadFile", "DeleteFile", "CopyFile", "fopen", "fwrite", "fread", "remove"]
}

class ImportAnalyzer:
    @staticmethod
    def classify_api(function_name: str) -> str:
        fn_lower = function_name.lower()
        for category, keywords in API_DOMAINS.items():
            for kw in keywords:
                if kw.lower() in fn_lower:
                    return category
        return "System / Utility"

    @classmethod
    def analyze(cls, raw_imports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        categorized = []
        for imp in raw_imports:
            fn_name = imp.get("function_name", "")
            lib = imp.get("library", "Unknown")
            cat = cls.classify_api(fn_name)
            categorized.append({
                "library": lib,
                "function_name": fn_name,
                "category": cat
            })
        return categorized
