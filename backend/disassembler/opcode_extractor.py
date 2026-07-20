from typing import List, Dict, Any

OPCODE_CATEGORIES = {
    "Arithmetic": {"ADD", "SUB", "INC", "DEC", "IMUL", "IDIV", "MUL", "DIV", "XOR", "AND", "OR", "SHL", "SHR", "SAL", "SAR", "NEG", "NOT"},
    "Flow Control": {"CALL", "RET", "RETN", "JMP", "JZ", "JNZ", "JE", "JNE", "JA", "JAE", "JB", "JBE", "JG", "JGE", "JL", "JLE", "LOOP", "INT", "SYSCALL", "SYSENTER"},
    "Stack": {"PUSH", "POP", "PUSHA", "POPA", "PUSHFD", "POPFD", "ENTER", "LEAVE"},
    "Memory": {"MOV", "LEA", "MOVZX", "MOVSX", "XCHG", "MOVSS", "MOVSD"},
    "Comparison": {"CMP", "TEST", "BT", "BTS", "BTR"},
    "String": {"LODS", "LODSB", "LODSW", "STOS", "STOSB", "STOSW", "CMPS", "CMPSB", "MOVS", "MOVSB", "MOVSW", "SCAS", "SCASB", "REP", "REPE", "REPNE"},
    "SIMD": {"MOVAPS", "MOVUPS", "ADDPS", "SUBPS", "MULPS", "DIVPS", "PADDW", "PADDB", "VMOVUPS", "VADDPS", "XMM", "YMM", "VPBROADCASTB"}
}

class OpcodeExtractor:
    @staticmethod
    def categorize(mnemonic: str) -> str:
        mnemonic_upper = mnemonic.upper()
        for category, opcodes in OPCODE_CATEGORIES.items():
            if mnemonic_upper in opcodes:
                return category
        return "Other"

    @classmethod
    def extract_and_summarize(cls, instructions: List[Dict[str, Any]]) -> Dict[str, Any]:
        counts = {}
        category_counts = {cat: 0 for cat in OPCODE_CATEGORIES.keys()}
        category_counts["Other"] = 0

        total_instructions = len(instructions)

        for insn in instructions:
            mnem = insn["mnemonic"].upper()
            counts[mnem] = counts.get(mnem, 0) + 1
            cat = cls.categorize(mnem)
            category_counts[cat] = category_counts.get(cat, 0) + 1

        # Sorted list of opcode frequencies
        sorted_opcodes = sorted(counts.items(), key=lambda x: x[1], reverse=True)
        opcodes_list = []
        for mnem, freq in sorted_opcodes:
            pct = round((freq / total_instructions) * 100, 2) if total_instructions > 0 else 0.0
            opcodes_list.append({
                "mnemonic": mnem,
                "category": cls.categorize(mnem),
                "frequency": freq,
                "percentage": pct
            })

        # Category breakdown percentages
        category_percentages = {}
        for cat, count in category_counts.items():
            pct = round((count / total_instructions) * 100, 2) if total_instructions > 0 else 0.0
            category_percentages[cat] = {
                "count": count,
                "percentage": pct
            }

        return {
            "total_instructions": total_instructions,
            "unique_instructions": len(counts),
            "opcodes": opcodes_list,
            "category_breakdown": category_percentages
        }
