import networkx as nx
from typing import List, Dict, Any

class CFGBuilder:
    @classmethod
    def build_cfg(cls, instructions: List[Dict[str, Any]], fn_name: str = "main") -> Dict[str, Any]:
        if not instructions:
            return {
                "function_name": fn_name,
                "cyclomatic_complexity": 1,
                "basic_blocks": [],
                "elements": {"nodes": [], "edges": []}
            }

        # Step 1: Identify leader addresses
        leaders = set()
        leaders.add(instructions[0]["address"]) # First instruction is leader

        addr_to_idx = {insn["address"]: i for i, insn in enumerate(instructions)}

        for i, insn in enumerate(instructions):
            mnem = insn["mnemonic"].upper()
            op = insn.get("op_str", "").strip()

            # Jumps, calls, rets create leaders
            if mnem in ("JMP", "JZ", "JNZ", "JE", "JNE", "JA", "JAE", "JB", "JBE", "JG", "JGE", "JL", "JLE", "CALL"):
                # Target of jump is leader
                if op.startswith("0x"):
                    try:
                        target = int(op, 16)
                        if target in addr_to_idx:
                            leaders.add(target)
                    except ValueError:
                        pass
                # Next instruction after branch is leader
                if i + 1 < len(instructions):
                    leaders.add(instructions[i + 1]["address"])

        sorted_leaders = sorted(list(leaders))

        # Step 2: Form Basic Blocks
        blocks = []
        block_map = {} # addr -> block_id

        for idx, leader_addr in enumerate(sorted_leaders):
            start_i = addr_to_idx[leader_addr]
            end_i = len(instructions)
            if idx + 1 < len(sorted_leaders):
                end_i = addr_to_idx[sorted_leaders[idx + 1]]

            block_insns = instructions[start_i:end_i]
            block_id = f"BB_{hex(leader_addr)[2:]}"
            
            for insn in block_insns:
                block_map[insn["address"]] = block_id

            blocks.append({
                "id": block_id,
                "start_address": leader_addr,
                "end_address": block_insns[-1]["address"],
                "instructions": [f"{i['address']:X}: {i['mnemonic']} {i['op_str']}" for i in block_insns]
            })

        # Step 3: Build Graph Edges
        G = nx.DiGraph()
        for b in blocks:
            G.add_node(b["id"], label="\n".join(b["instructions"][:3])) # First 3 insns as preview

        for b in blocks:
            last_insn_addr = b["end_address"]
            last_i = addr_to_idx[last_insn_addr]
            insn = instructions[last_i]
            mnem = insn["mnemonic"].upper()
            op = insn.get("op_str", "").strip()

            # Check branch targets
            if mnem in ("JMP", "JZ", "JNZ", "JE", "JNE", "JA", "JAE", "JB", "JBE", "JG", "JGE", "JL", "JLE"):
                if op.startswith("0x"):
                    try:
                        target = int(op, 16)
                        if target in block_map:
                            G.add_edge(b["id"], block_map[target], type="branch")
                    except ValueError:
                        pass
                # Fallthrough for conditional jumps
                if mnem != "JMP" and last_i + 1 < len(instructions):
                    next_addr = instructions[last_i + 1]["address"]
                    if next_addr in block_map:
                        G.add_edge(b["id"], block_map[next_addr], type="fallthrough")
            elif mnem not in ("RET", "RETN"):
                if last_i + 1 < len(instructions):
                    next_addr = instructions[last_i + 1]["address"]
                    if next_addr in block_map:
                        G.add_edge(b["id"], block_map[next_addr], type="normal")

        # Cyclomatic complexity = E - V + 2
        V = G.number_of_nodes()
        E = G.number_of_edges()
        complexity = max(1, E - V + 2)

        # Cytoscape elements
        nodes = []
        edges = []
        for node in G.nodes():
            b_info = next((b for b in blocks if b["id"] == node), None)
            code_text = "\n".join(b_info["instructions"]) if b_info else node
            nodes.append({
                "data": {
                    "id": node,
                    "label": f"{node}\n{code_text[:40]}..."
                }
            })

        e_idx = 0
        for u, v, data in G.edges(data=True):
            edges.append({
                "data": {
                    "id": f"e_{e_idx}",
                    "source": u,
                    "target": v,
                    "type": data.get("type", "normal")
                }
            })
            e_idx += 1

        return {
            "function_name": fn_name,
            "basic_block_count": len(blocks),
            "cyclomatic_complexity": complexity,
            "basic_blocks": blocks,
            "elements": {
                "nodes": nodes,
                "edges": edges
            }
        }
