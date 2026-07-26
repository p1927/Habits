from __future__ import annotations

import re
from dataclasses import dataclass
from difflib import get_close_matches


@dataclass
class ParsedFoodItem:
    name: str
    quantity_g: float


_QTY_RE = re.compile(
    r"(\d+(?:\.\d+)?)\s*(?:g|grams?|gram)\s+(?:of\s+)?(.+)|"
    r"(.+?)\s+(\d+(?:\.\d+)?)\s*(?:g|grams?|gram)",
    re.I,
)


def parse_meal_description(text: str) -> list[ParsedFoodItem]:
    """Parse '200g paneer and 250 grams broccoli' into structured items."""
    text = text.strip()
    if not text:
        return []

    parts = re.split(r"\s*,\s*|\s+and\s+|\s+&\s+", text, flags=re.I)
    items: list[ParsedFoodItem] = []

    for part in parts:
        part = part.strip()
        if not part:
            continue
        m = _QTY_RE.search(part)
        if m:
            if m.group(1) and m.group(2):
                qty, name = float(m.group(1)), m.group(2).strip()
            else:
                name, qty = m.group(3).strip(), float(m.group(4))
            items.append(ParsedFoodItem(name=name, quantity_g=qty))
            continue
        # no quantity — default 100g
        items.append(ParsedFoodItem(name=part, quantity_g=100.0))

    return items


def fuzzy_match_food(name: str, db_names: list[str], cutoff: float = 0.45) -> str | None:
    name_l = name.lower().strip()
    lookup = {n.lower(): n for n in db_names}
    if name_l in lookup:
        return lookup[name_l]
    # substring match
    for key, original in lookup.items():
        if name_l in key or key in name_l:
            return original
    matches = get_close_matches(name_l, list(lookup.keys()), n=1, cutoff=cutoff)
    if matches:
        return lookup[matches[0]]
    return None
