import os
import importlib.util
from typing import List, Dict, Any

PLUGINS_DIR = os.path.dirname(__file__)

class PluginManager:
    @classmethod
    def list_plugins(cls) -> List[Dict[str, str]]:
        plugins = []
        for file in os.listdir(PLUGINS_DIR):
            if file.endswith(".py") and not file.startswith("__") and file != "plugin_manager.py":
                plugin_name = file[:-3]
                plugins.append({
                    "id": plugin_name,
                    "filename": file,
                    "name": plugin_name.replace("_", " ").title()
                })
        return plugins

    @classmethod
    def run_plugin(cls, plugin_id: str, file_bytes: bytes, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        plugin_file = os.path.join(PLUGINS_DIR, f"{plugin_id}.py")
        if not os.path.exists(plugin_file):
            return {"error": f"Plugin '{plugin_id}' not found."}

        try:
            spec = importlib.util.spec_from_file_location(plugin_id, plugin_file)
            mod = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(mod)

            if hasattr(mod, "run"):
                return mod.run(file_bytes, analysis_data)
            else:
                return {"error": "Plugin entry point 'run(file_bytes, analysis_data)' not found."}
        except Exception as e:
            return {"error": str(e)}
