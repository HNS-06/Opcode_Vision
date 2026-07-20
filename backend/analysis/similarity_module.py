import math
from typing import Dict, Any, List

class SimilarityModule:
    @staticmethod
    def jaccard_similarity(set1: set, set2: set) -> float:
        if not set1 and not set2:
            return 1.0
        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        return round(intersection / union, 4) if union > 0 else 0.0

    @staticmethod
    def cosine_similarity(vec1: Dict[str, float], vec2: Dict[str, float]) -> float:
        all_keys = set(vec1.keys()).union(set(vec2.keys()))
        if not all_keys:
            return 1.0

        dot_product = sum(vec1.get(k, 0.0) * vec2.get(k, 0.0) for k in all_keys)
        mag1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
        mag2 = math.sqrt(sum(v ** 2 for v in vec2.values()))

        if mag1 == 0 or mag2 == 0:
            return 0.0

        return round(dot_product / (mag1 * mag2), 4)

    @classmethod
    def compare_binaries(cls, file_a: Dict[str, Any], file_b: Dict[str, Any]) -> Dict[str, Any]:
        # Opcode Sets & Vectors
        opcodes_a = {op["mnemonic"]: op["percentage"] for op in file_a.get("opcodes", [])}
        opcodes_b = {op["mnemonic"]: op["percentage"] for op in file_b.get("opcodes", [])}

        set_a = set(opcodes_a.keys())
        set_b = set(opcodes_b.keys())

        jaccard_opcodes = cls.jaccard_similarity(set_a, set_b)
        cosine_opcodes = cls.cosine_similarity(opcodes_a, opcodes_b)

        # Import Similarity
        imports_a = set(f"{i['library']}:{i['function_name']}" for i in file_a.get("imports", []))
        imports_b = set(f"{i['library']}:{i['function_name']}" for i in file_b.get("imports", []))
        jaccard_imports = cls.jaccard_similarity(imports_a, imports_b)

        # Section Similarity
        sec_a = set(s["name"] for s in file_a.get("sections", []))
        sec_b = set(s["name"] for s in file_b.get("sections", []))
        jaccard_sections = cls.jaccard_similarity(sec_a, sec_b)

        # Weighted Overall Similarity Score
        overall_score = round(
            (cosine_opcodes * 0.50) + (jaccard_imports * 0.30) + (jaccard_sections * 0.20),
            4
        ) * 100

        return {
            "file_a_name": file_a.get("metadata", {}).get("filename", "File A"),
            "file_b_name": file_b.get("metadata", {}).get("filename", "File B"),
            "overall_similarity_percentage": round(overall_score, 2),
            "metrics": {
                "opcode_cosine_similarity": cosine_opcodes,
                "opcode_jaccard_index": jaccard_opcodes,
                "import_similarity": jaccard_imports,
                "section_similarity": jaccard_sections
            },
            "shared_opcodes": list(set_a.intersection(set_b)),
            "shared_imports_count": len(imports_a.intersection(imports_b))
        }
