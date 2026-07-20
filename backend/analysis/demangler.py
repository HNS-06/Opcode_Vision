import re
from typing import Dict, Any

class SymbolDemangler:
    @staticmethod
    def demangle_gcc(mangled: str) -> str:
        # Simplified pure Python demangler for Itanium C++ ABI (_Z...)
        if not mangled.startswith("_Z"):
            return mangled
        
        try:
            # Pattern matching for _ZN... (namespaces/classes)
            if mangled.startswith("_ZN"):
                rest = mangled[3:]
                parts = []
                while rest and rest[0].isdigit():
                    match = re.match(r'^(\d+)', rest)
                    if not match:
                        break
                    length = int(match.group(1))
                    digits_len = len(match.group(1))
                    part = rest[digits_len:digits_len + length]
                    parts.append(part)
                    rest = rest[digits_len + length:]
                if parts:
                    return "::".join(parts) + "()"
            elif len(mangled) > 2:
                # Basic function name extraction
                match = re.search(r'(\d+)([a-zA-Z0-9_]+)', mangled)
                if match:
                    return match.group(2) + "()"
        except Exception:
            pass

        return mangled

    @staticmethod
    def demangle_msvc(mangled: str) -> str:
        # Simplified MSVC demangler for ?Name@Class@@...
        if not mangled.startswith("?"):
            return mangled

        try:
            parts = mangled[1:].split("@@")
            if len(parts) >= 1:
                subparts = parts[0].split("@")
                if len(subparts) >= 2:
                    return f"{subparts[1]}::{subparts[0]}()"
                elif len(subparts) == 1:
                    return f"{subparts[0]}()"
        except Exception:
            pass

        return mangled

    @classmethod
    def demangle(cls, symbol: str) -> Dict[str, str]:
        mangled = symbol.strip()
        is_mangled = mangled.startswith("?") or mangled.startswith("_Z")

        demangled = mangled
        scheme = "None"

        if mangled.startswith("?"):
            scheme = "MSVC C++"
            demangled = cls.demangle_msvc(mangled)
        elif mangled.startswith("_Z"):
            scheme = "GCC / LLVM Itanium"
            demangled = cls.demangle_gcc(mangled)

        return {
            "mangled": mangled,
            "demangled": demangled,
            "is_mangled": is_mangled,
            "scheme": scheme
        }
