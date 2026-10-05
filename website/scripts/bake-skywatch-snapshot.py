#!/usr/bin/env python3
"""Bake a compact SKYWATCH snapshot for the /apps page.

Reads the public data bundle from a SKYWATCH checkout and writes
src/data/apps/skywatch.json: headline counts, the monthly series, and
every sighting place aggregated to its centroid (lat, lon, count,
count within 10 nm of a military installation).

    python3 scripts/bake-skywatch-snapshot.py /path/to/skywatch-oceans

Re-run whenever SKYWATCH refreshes its FAA data.
"""
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

ALERT_NM = 10  # SKYWATCH's default proximity radius
NAMED_MIN = 20  # places with at least this many reports keep a display name

src = Path(sys.argv[1]) / "public" / "data"
out = Path(__file__).resolve().parent.parent / "src" / "data" / "apps" / "skywatch.json"

d = json.loads((src / "sightings.json").read_text())
meta, sightings = d["meta"], d["sightings"]


def count(path, key="features"):
    j = json.loads((src / path).read_text())
    return len(j) if isinstance(j, list) else len(j[key])


places = defaultdict(lambda: [0, 0])
names = defaultdict(Counter)
near = 0
for s in sightings:
    key = (round(s["lat"], 3), round(s["lon"], 3))
    p = places[key]
    p[0] += 1
    names[key][f"{s['c'].title()}, {s['s']}"] += 1
    if s["nd"] is not None and s["nd"] <= ALERT_NM:
        p[1] += 1
        near += 1

months = sorted(meta["byMonth"].items())
last12 = sum(n for _, n in months[-12:])

snapshot = {
    "source": meta["source"],
    "sourceUrl": meta["sourceUrl"],
    "generated": meta["generated"],
    "count": meta["count"],
    "dateMin": meta["dateMin"],
    "dateMax": meta["dateMax"],
    "geocoding": {k: meta["geocoding"][k] for k in ("city", "alias", "state")},
    "jurisdictions": len(meta["byState"]),
    "places": len(places),
    "nearInstallation": near,
    "alertNm": ALERT_NM,
    "last12": last12,
    "layers": {
        "installations": count("overlays/bases.json"),
        "airports": count("overlays/airports.json"),
        "noDroneZones": count("overlays/nsufr.json"),
        "powerPlants": count("overlays/powerplants.json"),
        "seaports": count("overlays/seaports.json"),
        "intlIncidents": count("intl/incidents.json"),
        "globalInstallations": count("overlays/global_bases.json"),
    },
    "byMonth": months,
    # [lat, lon, sightings, sightings within ALERT_NM of an installation, name?]
    "points": [
        [lat, lon, n, a] + ([names[(lat, lon)].most_common(1)[0][0]] if n >= NAMED_MIN else [])
        for (lat, lon), (n, a) in sorted(places.items(), key=lambda kv: -kv[1][0])
    ],
}

out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(snapshot, separators=(",", ":")))
print(f"wrote {out} — {snapshot['count']} sightings, {snapshot['places']} places, "
      f"{near} within {ALERT_NM} nm, last 12 mo {last12}, layers {snapshot['layers']}")
