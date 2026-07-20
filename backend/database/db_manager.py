import sqlite3
import os
import json
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "opcodevision.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

class DBManager:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        if os.path.exists(SCHEMA_PATH):
            with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
                schema_sql = f.read()
            with self.get_connection() as conn:
                conn.executescript(schema_sql)
                conn.commit()

    def save_analysis_result(self, file_id: str, analysis: Dict[str, Any]):
        conn = self.get_connection()
        cursor = conn.cursor()

        meta = analysis.get("metadata", {})
        cursor.execute(
            """
            INSERT OR REPLACE INTO files 
            (id, filename, file_path, file_size, file_type, arch, bits, entry_point, md5, sha256)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                file_id,
                meta.get("filename", "unknown"),
                meta.get("file_path", ""),
                meta.get("file_size", 0),
                meta.get("file_type", "PE"),
                meta.get("arch", "x86_64"),
                meta.get("bits", 64),
                meta.get("entry_point", 0),
                meta.get("md5", ""),
                meta.get("sha256", "")
            )
        )

        # Save Sections
        cursor.execute("DELETE FROM sections WHERE file_id = ?", (file_id,))
        for sec in analysis.get("sections", []):
            cursor.execute(
                """
                INSERT INTO sections 
                (file_id, name, virtual_address, virtual_size, raw_size, entropy, permissions)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    file_id,
                    sec.get("name", ""),
                    sec.get("virtual_address", 0),
                    sec.get("virtual_size", 0),
                    sec.get("raw_size", 0),
                    sec.get("entropy", 0.0),
                    sec.get("permissions", "RWX")
                )
            )

        # Save Opcodes
        cursor.execute("DELETE FROM opcodes WHERE file_id = ?", (file_id,))
        for op in analysis.get("opcodes", []):
            cursor.execute(
                """
                INSERT INTO opcodes (file_id, mnemonic, category, frequency, percentage)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    file_id,
                    op.get("mnemonic", ""),
                    op.get("category", "Other"),
                    op.get("frequency", 0),
                    op.get("percentage", 0.0)
                )
            )

        # Save Imports
        cursor.execute("DELETE FROM imports WHERE file_id = ?", (file_id,))
        for imp in analysis.get("imports", []):
            cursor.execute(
                """
                INSERT INTO imports (file_id, library, function_name, category)
                VALUES (?, ?, ?, ?)
                """,
                (
                    file_id,
                    imp.get("library", ""),
                    imp.get("function_name", ""),
                    imp.get("category", "Other")
                )
            )

        # Save Functions
        cursor.execute("DELETE FROM functions WHERE file_id = ?", (file_id,))
        for fn in analysis.get("functions", []):
            cursor.execute(
                """
                INSERT INTO functions 
                (file_id, name, address, size, basic_block_count, cyclomatic_complexity, instruction_count, calls)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    file_id,
                    fn.get("name", ""),
                    fn.get("address", 0),
                    fn.get("size", 0),
                    fn.get("basic_block_count", 1),
                    fn.get("cyclomatic_complexity", 1),
                    fn.get("instruction_count", 0),
                    json.dumps(fn.get("calls", []))
                )
            )

        # Save Entropy Stats
        cursor.execute("DELETE FROM entropy_stats WHERE file_id = ?", (file_id,))
        entropy_data = analysis.get("entropy", {})
        cursor.execute(
            """
            INSERT INTO entropy_stats (file_id, overall_entropy, sliding_window_data)
            VALUES (?, ?, ?)
            """,
            (
                file_id,
                entropy_data.get("overall", 0.0),
                json.dumps(entropy_data.get("sliding_window", []))
            )
        )

        # Save Statistics
        stats = analysis.get("statistics", {})
        cursor.execute("DELETE FROM statistics WHERE file_id = ?", (file_id,))
        cursor.execute(
            """
            INSERT INTO statistics 
            (file_id, total_instructions, unique_instructions, instruction_density, avg_function_size, code_data_ratio, compiler_detected)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                file_id,
                stats.get("total_instructions", 0),
                stats.get("unique_instructions", 0),
                stats.get("instruction_density", 0.0),
                stats.get("avg_function_size", 0.0),
                stats.get("code_data_ratio", 0.0),
                stats.get("compiler", "Unknown")
            )
        )

        conn.commit()
        conn.close()

    def get_analysis_result(self, file_id: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM files WHERE id = ?", (file_id,))
        file_row = cursor.fetchone()
        if not file_row:
            conn.close()
            return None

        # Sections
        cursor.execute("SELECT * FROM sections WHERE file_id = ?", (file_id,))
        sections = [dict(r) for r in cursor.fetchall()]

        # Opcodes
        cursor.execute("SELECT * FROM opcodes WHERE file_id = ?", (file_id,))
        opcodes = [dict(r) for r in cursor.fetchall()]

        # Imports
        cursor.execute("SELECT * FROM imports WHERE file_id = ?", (file_id,))
        imports = [dict(r) for r in cursor.fetchall()]

        # Functions
        cursor.execute("SELECT * FROM functions WHERE file_id = ?", (file_id,))
        fn_rows = cursor.fetchall()
        functions = []
        for r in fn_rows:
            d = dict(r)
            d["calls"] = json.loads(d["calls"]) if d["calls"] else []
            functions.append(d)

        # Entropy
        cursor.execute("SELECT * FROM entropy_stats WHERE file_id = ?", (file_id,))
        e_row = cursor.fetchone()
        entropy = {
            "overall": e_row["overall_entropy"] if e_row else 0.0,
            "sliding_window": json.loads(e_row["sliding_window_data"]) if e_row and e_row["sliding_window_data"] else []
        }

        # Stats
        cursor.execute("SELECT * FROM statistics WHERE file_id = ?", (file_id,))
        st_row = cursor.fetchone()
        stats = dict(st_row) if st_row else {}

        conn.close()

        return {
            "metadata": dict(file_row),
            "sections": sections,
            "opcodes": opcodes,
            "imports": imports,
            "functions": functions,
            "entropy": entropy,
            "statistics": stats
        }
