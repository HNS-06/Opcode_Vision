from typing import Dict, Any

def run(file_bytes: bytes, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    sections = analysis_data.get("sections", [])
    overall_entropy = analysis_data.get("entropy", {}).get("overall", 0.0)

    anomalies = []
    for sec in sections:
        ent = sec.get("entropy", 0.0)
        name = sec.get("name", "")
        if ent > 7.2:
            anomalies.append({
                "section": name,
                "entropy": ent,
                "risk": "HIGH",
                "finding": "Section has high entropy (>7.2) indicating packing, encryption, or compressed payload."
            })
        elif ent < 1.0 and sec.get("raw_size", 0) > 1024:
            anomalies.append({
                "section": name,
                "entropy": ent,
                "risk": "LOW",
                "finding": "Section contains large block of uniform null bytes or zero padding."
            })

    return {
        "plugin_name": "Entropy Anomaly Detector",
        "overall_entropy": overall_entropy,
        "is_high_entropy": overall_entropy > 7.0,
        "anomalies_detected": anomalies
    }
