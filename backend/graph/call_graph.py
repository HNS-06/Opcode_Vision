import networkx as nx
from typing import List, Dict, Any

class CallGraphGenerator:
    @classmethod
    def build_call_graph(cls, functions: List[Dict[str, Any]]) -> Dict[str, Any]:
        G = nx.DiGraph()

        fn_map = {fn["address"]: fn["name"] for fn in functions}

        for fn in functions:
            fn_addr = fn["address"]
            fn_name = fn["name"]
            G.add_node(fn_name, address=hex(fn_addr), size=fn.get("size", 0), complexity=fn.get("cyclomatic_complexity", 1))

            calls = fn.get("calls", [])
            for target_addr in calls:
                target_name = fn_map.get(target_addr, f"sub_{hex(target_addr)[2:]}")
                G.add_edge(fn_name, target_name)

        # Cytoscape JSON output
        nodes = []
        edges = []

        for node, data in G.nodes(data=True):
            nodes.append({
                "data": {
                    "id": node,
                    "label": node,
                    "address": data.get("address", "0x0"),
                    "complexity": data.get("complexity", 1)
                }
            })

        edge_id = 0
        for u, v in G.edges():
            edges.append({
                "data": {
                    "id": f"e{edge_id}",
                    "source": u,
                    "target": v
                }
            })
            edge_id += 1

        return {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "elements": {
                "nodes": nodes,
                "edges": edges
            }
        }
