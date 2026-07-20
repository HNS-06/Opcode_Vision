from typing import Dict, Any

YARA_RULES = [
    {
        "rule_name": "UPX_Packer_Signature",
        "category": "Packer",
        "patterns": [b"UPX!", b"UPX0", b"UPX1"]
    },
    {
        "rule_name": "Suspicious_Process_Injection_APIs",
        "category": "High Risk API",
        "patterns": [b"VirtualAllocEx", b"WriteProcessMemory", b"CreateRemoteThread"]
    },
    {
        "rule_name": "Network_Beacon_Patterns",
        "category": "Network",
        "patterns": [b"WSAStartup", b"InternetOpenA", b"WinHttpOpen"]
    },
    {
        "rule_name": "Anti_Debugging_Check",
        "category": "Evasion",
        "patterns": [b"IsDebuggerPresent", b"CheckRemoteDebuggerPresent"]
    }
]

def run(file_bytes: bytes, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    matches = []
    for rule in YARA_RULES:
        hit_patterns = []
        for pat in rule["patterns"]:
            if pat in file_bytes:
                hit_patterns.append(pat.decode('ascii', errors='ignore'))
        if hit_patterns:
            matches.append({
                "rule": rule["rule_name"],
                "category": rule["category"],
                "matched_patterns": hit_patterns
            })

    return {
        "plugin_name": "YARA Pattern Scanner",
        "rules_evaluated": len(YARA_RULES),
        "total_matches": len(matches),
        "matched_rules": matches
    }
