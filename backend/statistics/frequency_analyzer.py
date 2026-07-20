from typing import List, Dict, Any

class FrequencyAnalyzer:
    @staticmethod
    def calculate_statistics(
        file_bytes: bytes,
        instructions: List[Dict[str, Any]],
        sections: List[Dict[str, Any]],
        functions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        total_instructions = len(instructions)
        unique_opcodes = len(set(i["mnemonic"] for i in instructions))

        # Code size vs total size
        code_size = sum(s.get("raw_size", 0) for s in sections if "X" in s.get("permissions", ""))
        total_size = len(file_bytes) if len(file_bytes) > 0 else 1

        code_data_ratio = round(code_size / total_size, 4)
        avg_func_size = round(total_instructions / len(functions), 2) if len(functions) > 0 else total_instructions
        instruction_density = round(total_instructions / (code_size if code_size > 0 else 1), 4)

        return {
            "total_instructions": total_instructions,
            "unique_instructions": unique_opcodes,
            "instruction_density": instruction_density,
            "avg_function_size": avg_func_size,
            "code_data_ratio": code_data_ratio,
            "total_functions": len(functions)
        }
