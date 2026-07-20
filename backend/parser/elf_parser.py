import math
from typing import Dict, Any, List

class ELFParser:
    @staticmethod
    def calculate_entropy(data: bytes) -> float:
        if not data:
            return 0.0
        entropy = 0.0
        length = len(data)
        counts = {}
        for b in data:
            counts[b] = counts.get(b, 0) + 1
        for count in counts.values():
            p = count / length
            entropy -= p * math.log2(p)
        return round(entropy, 4)

    @classmethod
    def parse(cls, file_bytes: bytes) -> Dict[str, Any]:
        result = {
            "entry_point": 0,
            "sections": [],
            "imports": [],
            "exports": [],
            "mitigations": {
                "ASLR": True,
                "DEP": True,
                "SafeSEH": False
            }
        }

        try:
            from elftools.elf.elffile import ELFFile
            import io

            f = io.BytesIO(file_bytes)
            elffile = ELFFile(f)
            result["entry_point"] = elffile.header.e_entry

            for section in elffile.iter_sections():
                sec_name = section.name
                if not sec_name:
                    continue
                sec_data = section.data()
                sec_entropy = cls.calculate_entropy(sec_data)
                
                flags = section.header.sh_flags
                perms = ""
                if flags & 0x1: perms += "W"
                if flags & 0x2: perms += "R"
                if flags & 0x4: perms += "X"

                result["sections"].append({
                    "name": sec_name,
                    "virtual_address": section.header.sh_addr,
                    "virtual_size": section.header.sh_size,
                    "raw_size": len(sec_data),
                    "entropy": sec_entropy,
                    "permissions": perms or "R",
                    "raw_data": sec_data
                })

                # Extract dynamic symbols (imports/exports)
                if section.header.sh_type in ('SHT_DYNSYM', 'SHT_SYMTAB'):
                    for symbol in section.iter_symbols():
                        if symbol.name:
                            if symbol['st_shndx'] == 'SHN_UNDEF':
                                result["imports"].append({
                                    "library": "libc.so",
                                    "function_name": symbol.name
                                })
                            else:
                                result["exports"].append({
                                    "function_name": symbol.name,
                                    "address": symbol['st_value']
                                })

        except Exception as e:
            result["error"] = str(e)

        return result
