import capstone
from typing import List, Dict, Any

class CapstoneEngine:
    @staticmethod
    def get_capstone(arch: str = "x64", bits: int = 64):
        if arch.lower() in ("x86", "x64", "amd64"):
            mode = capstone.CS_MODE_32 if bits == 32 else capstone.CS_MODE_64
            return capstone.Cs(capstone.CS_ARCH_X86, mode)
        elif "arm64" in arch.lower() or "aarch64" in arch.lower():
            return capstone.Cs(capstone.CS_ARCH_ARM64, capstone.CS_MODE_ARM)
        elif "arm" in arch.lower():
            return capstone.Cs(capstone.CS_ARCH_ARM, capstone.CS_MODE_ARM)
        else:
            mode = capstone.CS_MODE_32 if bits == 32 else capstone.CS_MODE_64
            return capstone.Cs(capstone.CS_ARCH_X86, mode)

    @classmethod
    def disassemble(cls, code_bytes: bytes, base_address: int = 0x401000, arch: str = "x64", bits: int = 64) -> List[Dict[str, Any]]:
        instructions = []
        try:
            md = cls.get_capstone(arch, bits)
            md.detail = True
            for insn in md.disasm(code_bytes, base_address):
                hex_bytes = "".join([f"{b:02x}" for b in insn.bytes])
                instructions.append({
                    "address": insn.address,
                    "bytes": hex_bytes,
                    "mnemonic": insn.mnemonic.upper(),
                    "op_str": insn.op_str,
                    "size": insn.size
                })
        except Exception:
            # Fallback simple disassembler for raw bytes if capstone fails
            offset = 0
            while offset < len(code_bytes):
                b = code_bytes[offset]
                instructions.append({
                    "address": base_address + offset,
                    "bytes": f"{b:02x}",
                    "mnemonic": "DB" if b < 0x20 or b > 0x7e else "NOP",
                    "op_str": f"0x{b:02x}",
                    "size": 1
                })
                offset += 1

        return instructions
