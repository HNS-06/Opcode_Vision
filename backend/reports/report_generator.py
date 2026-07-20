import json
import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable

class ReportGenerator:
    @classmethod
    def generate_json(cls, analysis_data: Dict[str, Any]) -> str:
        return json.dumps(analysis_data, indent=2)

    @classmethod
    def generate_markdown(cls, analysis_data: Dict[str, Any]) -> str:
        meta = analysis_data.get("metadata", {})
        stats = analysis_data.get("statistics", {})
        entropy = analysis_data.get("entropy", {})
        compiler = stats.get("compiler", "Unknown")

        md = []
        md.append(f"# OpcodeVision Analysis Report - {meta.get('filename', 'Binary')}\n")
        md.append("## Binary Overview")
        md.append(f"- **Filename**: `{meta.get('filename')}`")
        md.append(f"- **File Size**: {meta.get('file_size')} bytes")
        md.append(f"- **Type**: {meta.get('file_type')} ({meta.get('arch')}, {meta.get('bits')}-bit)")
        md.append(f"- **MD5**: `{meta.get('md5')}`")
        md.append(f"- **SHA256**: `{meta.get('sha256')}`")
        md.append(f"- **Compiler Detected**: `{compiler}`")
        md.append(f"- **Overall Entropy**: `{entropy.get('overall')}` / 8.0\n")

        md.append("## Instruction & Opcode Statistics")
        md.append(f"- **Total Instructions**: {stats.get('total_instructions', 0)}")
        md.append(f"- **Unique Opcodes**: {stats.get('unique_instructions', 0)}")
        md.append(f"- **Instruction Density**: {stats.get('instruction_density', 0)}")
        md.append(f"- **Code/Data Ratio**: {stats.get('code_data_ratio', 0)}\n")

        md.append("### Top Opcodes")
        md.append("| Mnemonic | Category | Frequency | Percentage |")
        md.append("| --- | --- | --- | --- |")
        for op in analysis_data.get("opcodes", [])[:10]:
            md.append(f"| `{op['mnemonic']}` | {op['category']} | {op['frequency']} | {op['percentage']}% |")
        md.append("\n")

        md.append("## Section Breakdown")
        md.append("| Section | Virtual Size | Raw Size | Permissions | Entropy |")
        md.append("| --- | --- | --- | --- | --- |")
        for sec in analysis_data.get("sections", []):
            md.append(f"| `{sec['name']}` | {sec['virtual_size']} | {sec['raw_size']} | {sec['permissions']} | {sec['entropy']} |")
        md.append("\n")

        md.append("## API Imports Summary")
        imports = analysis_data.get("imports", [])
        md.append(f"Total API Imports: **{len(imports)}**\n")
        for imp in imports[:15]:
            md.append(f"- `{imp['library']}` $\\rightarrow$ `{imp['function_name']}` ({imp['category']})")

        return "\n".join(md)

    @classmethod
    def generate_html(cls, analysis_data: Dict[str, Any]) -> str:
        meta = analysis_data.get("metadata", {})
        stats = analysis_data.get("statistics", {})
        entropy = analysis_data.get("entropy", {})

        opcodes_rows = "".join([
            f"<tr><td style='padding:8px;border-bottom:1px solid #334155;'><code>{op['mnemonic']}</code></td>"
            f"<td style='padding:8px;border-bottom:1px solid #334155;'>{op['category']}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #334155;'>{op['frequency']}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #334155;'>{op['percentage']}%</td></tr>"
            for op in analysis_data.get("opcodes", [])[:10]
        ])

        sections_rows = "".join([
            f"<tr><td style='padding:8px;border-bottom:1px solid #334155;'><code>{sec['name']}</code></td>"
            f"<td style='padding:8px;border-bottom:1px solid #334155;'>{sec['virtual_size']}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #334155;'>{sec['raw_size']}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #334155;'>{sec['permissions']}</td>"
            f"<td style='padding:8px;border-bottom:1px solid #334155;'>{sec['entropy']}</td></tr>"
            for sec in analysis_data.get("sections", [])
        ])

        return f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>OpcodeVision Report - {meta.get('filename')}</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px; line-height: 1.6; }}
        .card {{ background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #334155; }}
        h1 {{ color: #38bdf8; font-size: 28px; margin-bottom: 8px; }}
        h2 {{ color: #a855f7; font-size: 20px; border-bottom: 1px solid #334155; padding-bottom: 8px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
        th {{ text-align: left; background: #0f172a; color: #94a3b8; padding: 10px; font-weight: 600; }}
        code {{ background: #020617; padding: 2px 6px; border-radius: 4px; color: #38bdf8; font-family: monospace; }}
        .badge {{ background: #0284c7; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; }}
    </style>
</head>
<body>
    <div class="card">
        <h1>OpcodeVision Binary Report</h1>
        <p>Target: <strong>{meta.get('filename')}</strong> <span class="badge">{meta.get('file_type')} {meta.get('arch')}</span></p>
        <p>MD5: <code>{meta.get('md5')}</code> | SHA256: <code>{meta.get('sha256')}</code></p>
    </div>

    <div class="card">
        <h2>Executive Summary & Metrics</h2>
        <p>Compiler Toolchain: <strong>{stats.get('compiler', 'Unknown')}</strong></p>
        <p>Overall Shannon Entropy: <strong>{entropy.get('overall')}</strong> / 8.0</p>
        <p>Total Instructions Analyzed: <strong>{stats.get('total_instructions')}</strong> | Unique Opcodes: <strong>{stats.get('unique_instructions')}</strong></p>
    </div>

    <div class="card">
        <h2>Top Opcode Frequencies</h2>
        <table>
            <thead>
                <tr><th>Mnemonic</th><th>Category</th><th>Frequency</th><th>Percentage</th></tr>
            </thead>
            <tbody>{opcodes_rows}</tbody>
        </table>
    </div>

    <div class="card">
        <h2>Memory Sections</h2>
        <table>
            <thead>
                <tr><th>Section</th><th>Virtual Size</th><th>Raw Size</th><th>Permissions</th><th>Entropy</th></tr>
            </thead>
            <tbody>{sections_rows}</tbody>
        </table>
    </div>
</body>
</html>"""

    @classmethod
    def generate_pdf(cls, analysis_data: Dict[str, Any]) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        story = []

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle('TitleStyle', parent=styles['Title'], textColor=colors.HexColor('#0284c7'), fontSize=22, leading=26, alignment=0)
        h2_style = ParagraphStyle('H2Style', parent=styles['Heading2'], textColor=colors.HexColor('#9333ea'), fontSize=14, leading=18, spaceBefore=12, spaceAfter=6)
        body_style = ParagraphStyle('BodyStyle', parent=styles['Normal'], textColor=colors.HexColor('#1e293b'), fontSize=10, leading=14)

        meta = analysis_data.get("metadata", {})
        stats = analysis_data.get("statistics", {})
        entropy = analysis_data.get("entropy", {})

        # Header
        story.append(Paragraph("OpcodeVision Static Binary Report", title_style))
        story.append(Spacer(1, 8))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0284c7'), spaceAfter=12))

        # Overview Table
        story.append(Paragraph("Binary Overview & Metadata", h2_style))
        overview_data = [
            ["Filename:", meta.get("filename", "")],
            ["File Size:", f"{meta.get('file_size', 0)} bytes"],
            ["Format / Arch:", f"{meta.get('file_type', '')} ({meta.get('arch', '')}, {meta.get('bits', 64)}-bit)"],
            ["Compiler Detected:", stats.get("compiler", "Unknown")],
            ["Overall Entropy:", f"{entropy.get('overall', 0.0)} / 8.0"],
            ["MD5 Hash:", meta.get("md5", "")],
            ["SHA256 Hash:", meta.get("sha256", "")]
        ]
        t_overview = Table(overview_data, colWidths=[120, 400])
        t_overview.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#0f172a')),
            ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t_overview)
        story.append(Spacer(1, 14))

        # Top Opcodes
        story.append(Paragraph("Top Opcode Frequency Distribution", h2_style))
        op_table_data = [["Mnemonic", "Category", "Frequency", "Percentage"]]
        for op in analysis_data.get("opcodes", [])[:8]:
            op_table_data.append([op["mnemonic"], op["category"], str(op["frequency"]), f"{op['percentage']}%"])

        t_opcodes = Table(op_table_data, colWidths=[120, 150, 120, 130])
        t_opcodes.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284c7')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_opcodes)
        story.append(Spacer(1, 14))

        # Sections Table
        story.append(Paragraph("Executable Sections & Entropy", h2_style))
        sec_table_data = [["Section Name", "Virtual Size", "Raw Size", "Perms", "Entropy"]]
        for sec in analysis_data.get("sections", []):
            sec_table_data.append([sec["name"], str(sec["virtual_size"]), str(sec["raw_size"]), sec["permissions"], str(sec["entropy"])])

        t_sec = Table(sec_table_data, colWidths=[120, 100, 100, 80, 120])
        t_sec.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#9333ea')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_sec)

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
