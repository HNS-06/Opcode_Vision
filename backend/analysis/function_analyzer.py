from typing import List, Dict, Any
from backend.graph.cfg_builder import CFGBuilder

class FunctionAnalyzer:
    @classmethod
    def analyze_functions(cls, instructions: List[Dict[str, Any]], entry_point: int = 0x401000) -> List[Dict[str, Any]]:
        functions = []
        if not instructions:
            return functions

        # Simple function prologue detection (PUSH EBP / PUSH RBP or SUB ESP / SUB RSP)
        fn_starts = set()
        fn_starts.add(instructions[0]["address"]) # Main entry point

        for i, insn in enumerate(instructions):
            mnem = insn["mnemonic"].upper()
            op = insn.get("op_str", "").upper()

            # Prologue checks: push rbp / push ebp / sub rsp, N
            if mnem == "PUSH" and ("RBP" in op or "EBP" in op):
                fn_starts.add(insn["address"])
            elif mnem == "CALL" and op.startswith("0X"):
                try:
                    target = int(op, 16)
                    fn_starts.add(target)
                except ValueError:
                    pass

        sorted_starts = sorted(list(fn_starts))
        addr_to_idx = {insn["address"]: i for i, insn in enumerate(instructions)}

        fn_id = 0
        for idx, start_addr in enumerate(sorted_starts):
            if start_addr not in addr_to_idx:
                continue
            start_i = addr_to_idx[start_addr]
            end_i = len(instructions)
            if idx + 1 < len(sorted_starts) and sorted_starts[idx + 1] in addr_to_idx:
                end_i = addr_to_idx[sorted_starts[idx + 1]]

            fn_insns = instructions[start_i:end_i]
            if not fn_insns:
                continue

            fn_name = f"sub_{hex(start_addr)[2:]}" if start_addr != entry_point else "main"
            
            # Find call targets
            calls = []
            for item in fn_insns:
                if item["mnemonic"].upper() == "CALL":
                    op_str = item.get("op_str", "").strip()
                    if op_str.startswith("0x"):
                        try:
                            c_target = int(op_str, 16)
                            calls.append(c_target)
                        except ValueError:
                            pass

            cfg_res = CFGBuilder.build_cfg(fn_insns, fn_name)

            functions.append({
                "id": fn_id,
                "name": fn_name,
                "address": start_addr,
                "size": len(fn_insns) * 2, # Approx size
                "instruction_count": len(fn_insns),
                "basic_block_count": cfg_res["basic_block_count"],
                "cyclomatic_complexity": cfg_res["cyclomatic_complexity"],
                "calls": list(set(calls)),
                "cfg": cfg_res
            })
            fn_id += 1

        return functions
