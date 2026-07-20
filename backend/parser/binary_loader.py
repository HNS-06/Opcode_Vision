import os
import hashlib

class BinaryLoader:
    @staticmethod
    def inspect(file_bytes: bytes, filename: str = "binary.exe") -> dict:
        file_size = len(file_bytes)
        md5 = hashlib.md5(file_bytes).hexdigest()
        sha256 = hashlib.sha256(file_bytes).hexdigest()

        # Magic byte detection
        file_type = "UNKNOWN"
        arch = "x86_64"
        bits = 64

        if file_bytes.startswith(b'MZ'):
            file_type = "PE"
            # Read PE header offset at 0x3C
            if len(file_bytes) > 0x3C + 4:
                pe_offset = int.from_bytes(file_bytes[0x3C:0x40], 'little')
                if len(file_bytes) > pe_offset + 6:
                    machine = int.from_bytes(file_bytes[pe_offset+4:pe_offset+6], 'little')
                    if machine == 0x014c:
                        arch = "x86"
                        bits = 32
                    elif machine == 0x8664:
                        arch = "x64"
                        bits = 64
                    elif machine == 0xaa64:
                        arch = "ARM64"
                        bits = 64
                    elif machine == 0x01c0:
                        arch = "ARM"
                        bits = 32
        elif file_bytes.startswith(b'\x7fELF'):
            file_type = "ELF"
            bits = 64 if file_bytes[4] == 2 else 32
            arch_id = file_bytes[18] if len(file_bytes) > 18 else 0
            if arch_id == 0x03:
                arch = "x86"
            elif arch_id == 0x3E:
                arch = "x86_64"
            elif arch_id == 0x28:
                arch = "ARM"
            elif arch_id == 0xB7:
                arch = "ARM64"
        else:
            file_type = "RAW_BIN"

        return {
            "filename": filename,
            "file_size": file_size,
            "file_type": file_type,
            "arch": arch,
            "bits": bits,
            "md5": md5,
            "sha256": sha256
        }
