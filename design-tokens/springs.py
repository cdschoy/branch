#!/usr/bin/env python3
"""Damped-spring simulation used by build.py (peaks, tiers) and for authoring new presets.

Model: m*x'' = -k*(x - 1) - c*x', starting at x0 = fromValue with zero velocity (Motion's default).

Usage:
  python3 -I design-tokens/springs.py                    table for every preset in motion-tokens.json
  python3 -I design-tokens/springs.py K C [M] [FROM]     one spring: peak, dip, settle time, CSS linear() samples
"""
import json, math, pathlib, sys

DT = 1e-4          # s; semi-implicit Euler, stable for k <= 5000 (omega*dt < 0.01)
T_MAX = 6.0        # s
SETTLE_EPS = 0.001 # settled when |x - 1| and |v| stay under 0.1% of travel


def simulate(k, c, m=1.0, x0=0.0, dt=DT, t_max=T_MAX):
    """Return samples [(t, x)] from x0 to rest at 1."""
    x, v, t, out = x0, 0.0, 0.0, [(0.0, x0)]
    while t < t_max:
        a = (-k * (x - 1.0) - c * v) / m
        v += a * dt
        x += v * dt
        t += dt
        out.append((t, x))
    return out


def analyse(k, c, m=1.0, x0=0.0):
    """Peak / dip in final-size units, overshoot as % of travel, and settle time (ms)."""
    s = simulate(k, c, m, x0)
    xs = [x for _, x in s]
    travel = 1.0 - x0
    peak, dip = max(xs), min(xs)
    if travel > 0:
        over_travel = max(0.0, (peak - 1.0) / travel) * 100
    else:  # mounting above the final value: the visible overshoot is the dip below 1
        over_travel = max(0.0, (1.0 - dip) / -travel) * 100
    tol = SETTLE_EPS * max(abs(travel), 1e-9)
    settle = 0.0
    for t, x in reversed(s):
        if abs(x - 1.0) > tol:
            settle = t
            break
    return {"peakFinal": round(peak, 4), "dipFinal": round(dip, 4), "overshootPctOfTravel": round(over_travel, 1),
            "settleMs": round(settle * 1000), "zeta": round(c / (2 * math.sqrt(k * m)), 3)}


def visible_overshoot_pct(analysis, x0):
    """The tier metric: how far past (or below) 1 the eye sees, in % of final size."""
    if x0 > 1:
        return round((1 - analysis["dipFinal"]) * 100, 2)
    return round(max(0.0, analysis["peakFinal"] - 1) * 100, 2)


def css_linear(k, c, m=1.0, samples=25, settle_ms=None):
    """CSS linear() easing of the normalised 0 -> 1 spring over settle_ms."""
    a = analyse(k, c, m, 0.0)
    dur = (settle_ms or a["settleMs"]) / 1000
    s = simulate(k, c, m, 0.0, t_max=dur + DT)
    pts = []
    for i in range(samples):
        t = dur * i / (samples - 1)
        idx = min(len(s) - 1, int(round(t / DT)))
        pts.append(s[idx][1])
    pts[-1] = 1.0
    return "linear(" + ", ".join("%g" % round(p, 3) for p in pts) + ")"


if __name__ == "__main__":
    if len(sys.argv) >= 3:
        k, c = float(sys.argv[1]), float(sys.argv[2])
        m = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
        x0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0.0
        a = analyse(k, c, m, x0)
        print(a, "visible %:", visible_overshoot_pct(a, x0))
        print(css_linear(k, c, m))
    else:
        mt = json.load(open(pathlib.Path(__file__).resolve().parent / "motion-tokens.json"))
        for name, sp in mt["spring"].items():
            a = analyse(sp["stiffness"], sp["damping"], sp["mass"], sp["fromValue"])
            print(f"{name:12s} from {sp['fromValue']:<5} peak {a['peakFinal']:<7} dip {a['dipFinal']:<7} "
                  f"travel% {a['overshootPctOfTravel']:<5} visible% {visible_overshoot_pct(a, sp['fromValue']):<5} "
                  f"settle {a['settleMs']} ms (token {sp['settleMs']})")
