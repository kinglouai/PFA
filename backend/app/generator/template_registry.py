"""
Template registry — scans the templates/ directory, loads all .yml.j2 files,
and exposes get_template() and list_templates() functions.
"""

import os
from typing import List

from jinja2 import Environment, FileSystemLoader, TemplateNotFound

from app.core.exceptions import AppException

# Resolve templates directory relative to the backend root
_TEMPLATES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "templates",
)

_env = Environment(
    loader=FileSystemLoader(_TEMPLATES_DIR),
    trim_blocks=True,
    lstrip_blocks=True,
)


def get_template(name: str):
    """
    Load and return a Jinja2 template by name.
    Appends .yml.j2 if not already present.
    """
    if not name.endswith(".yml.j2"):
        name = f"{name}.yml.j2"

    try:
        return _env.get_template(name)
    except TemplateNotFound:
        raise AppException(
            message=f"Template not found: {name}",
            status_code=404,
        )


def list_templates() -> List[str]:
    """Return a list of all available template names (without extension)."""
    templates = []
    if os.path.exists(_TEMPLATES_DIR):
        for f in os.listdir(_TEMPLATES_DIR):
            if f.endswith(".yml.j2") and f != "cache_deps.yml.j2":
                templates.append(f.replace(".yml.j2", ""))
    return sorted(templates)
