import re
from typing import Dict, Any

def run(file_bytes: bytes, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    ascii_strings = re.findall(b"[ -~]{4,}", file_bytes)
    unicode_strings = re.findall(b"(?:[\x20-\x7E]\x00){4,}", file_bytes)

    extracted_ascii = [s.decode('ascii', errors='ignore') for s in ascii_strings[:60]]
    extracted_unicode = [s.decode('utf-16le', errors='ignore') for s in unicode_strings[:60]]

    # Deobfuscate 1-byte XOR strings across byte blocks
    decoded_xor_strings = []
    for key in range(1, 256):
        xored = bytes([b ^ key for b in file_bytes[:4096]])
        matches = re.findall(b"[ -~]{6,}", xored)
        for m in matches:
            s = m.decode('ascii', errors='ignore')
            if any(kw in s.lower() for kw in ["http", "cmd", "exec", "user", "pass", "admin", "key", "token", "dll"]):
                decoded_xor_strings.append({
                    "key": f"0x{key:02X}",
                    "decoded_string": s
                })
                if len(decoded_xor_strings) >= 20:
                    break
        if len(decoded_xor_strings) >= 20:
            break

    suspicious = []
    for s in extracted_ascii + extracted_unicode:
        if any(kw in s.lower() for kw in ["http", "https", "cmd.exe", "powershell", "reg", "admin", "password", "key", "encrypt"]):
            suspicious.append(s)

    return {
        "plugin_name": "FLOSS & Deobfuscated String Extractor",
        "total_ascii_strings": len(ascii_strings),
        "total_unicode_strings": len(unicode_strings),
        "sample_ascii": extracted_ascii,
        "sample_unicode": extracted_unicode,
        "suspicious_strings": suspicious[:20],
        "decoded_xor_strings": decoded_xor_strings
    }
