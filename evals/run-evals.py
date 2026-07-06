# /// script
# dependencies = ["requests"]
# ///
"""
Islamic Banking FTE — Eval Runner
Run:
  python3 evals/run-evals.py           # Structure validation only
  python3 evals/run-evals.py --live    # Live API testing (requires running server)
  python3 evals/run-evals.py --live --base-url https://islamic-banking-fte.vercel.app
"""

import json
import sys
import time
import argparse
from pathlib import Path

try:
    import requests
except ImportError:
    requests = None


# ---- Structure Validation (existing) ----

def validate_routing_golden(path: Path) -> list[str]:
    errors = []
    cases = json.loads(path.read_text())
    if len(cases) < 13:
        errors.append(f"routing-golden.json: expected 13+ cases, got {len(cases)}")
    required_fields = ["id", "query", "expected_skill", "expected_jurisdiction", "category"]
    for i, c in enumerate(cases):
        for f in required_fields:
            if f not in c:
                errors.append(f"routing-golden.json case {i}: missing field '{f}'")
    jurisdictions = {c.get("expected_jurisdiction", "") for c in cases}
    expected = {"pakistan", "uae", "saudi", "malaysia", "bahrain", "kuwait", "qatar", "oman", "turkey", "nigeria", "indonesia", "uk"}
    missing = expected - jurisdictions
    if missing:
        errors.append(f"routing-golden.json: missing jurisdictions: {missing}")
    skills = {c.get("expected_skill", "") for c in cases}
    expected_skills = {
        "murabaha-specialist", "ijara-specialist", "salam-specialist", "istisna-a-specialist",
        "sukuk-issuer", "sukuk-investor", "takaful-ifrs17", "musharaka-full",
        "musharakah-mudarabah-specialist", "shariah-compliance-checker", "halal-calculator",
        "islamic-product-explainer", "pakistan-banking-navigator", "zakat-advisor",
    }
    missing_skills = expected_skills - skills
    if missing_skills:
        errors.append(f"routing-golden.json: missing skills: {missing_skills}")
    return errors


def validate_product_golden(path: Path) -> list[str]:
    errors = []
    cases = json.loads(path.read_text())
    if len(cases) < 3:
        errors.append(f"product-golden.json: expected 3+ cases, got {len(cases)}")
    required_fields = ["id", "skill", "query", "must_contain"]
    for i, c in enumerate(cases):
        for f in required_fields:
            if f not in c:
                errors.append(f"product-golden.json case {i}: missing field '{f}'")
    return errors


def validate_skill_exists(skills_dir: Path, skill_name: str) -> list[str]:
    errors = []
    skill_dir = skills_dir / skill_name
    if not skill_dir.exists():
        errors.append(f"skills/{skill_name}/ directory not found")
    else:
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            errors.append(f"skills/{skill_name}/SKILL.md not found")
        else:
            content = skill_file.read_text()
            if "GOVERNING FRAMEWORK" not in content:
                errors.append(f"skills/{skill_name}/SKILL.md missing GOVERNING FRAMEWORK section")
    return errors


# ---- Live API Testing ----

def send_chat_message(base_url: str, message: str, session_id: str = None) -> dict:
    """Send a message to the chat API and return the response."""
    url = f"{base_url}/api/chat"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": message}]}],
        "session_id": session_id or f"eval-{int(time.time())}",
    }
    try:
        resp = requests.post(url, json=payload, timeout=30)
        if resp.status_code == 429:
            return {"error": "rate_limited", "status": 429}
        if resp.status_code != 200:
            return {"error": f"HTTP {resp.status_code}", "status": resp.status_code}
        data = resp.json()
        text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        return {"text": text, "status": 200, "headers": dict(resp.headers)}
    except requests.exceptions.Timeout:
        return {"error": "timeout", "status": 408}
    except Exception as e:
        return {"error": str(e), "status": 0}


def run_live_evals(base_url: str, golden_path: Path) -> list[dict]:
    """Run live evals against the API."""
    cases = json.loads(golden_path.read_text())
    results = []

    for case in cases:
        case_id = case.get("id", "unknown")
        query = case.get("query", "")
        must_contain = case.get("must_contain", [])
        must_not_contain = case.get("must_not_contain", [])
        category = case.get("category", "")

        print(f"  Testing {case_id}: {query[:60]}...", end=" ", flush=True)

        result = send_chat_message(base_url, query)
        time.sleep(1)  # Rate limit courtesy

        if result.get("error") == "rate_limited":
            print("⚠️  RATE LIMITED — skipping remaining")
            results.append({"id": case_id, "status": "skipped", "reason": "rate_limited"})
            break

        if result["status"] != 200:
            print(f"❌ FAIL (HTTP {result['status']})")
            results.append({"id": case_id, "status": "fail", "reason": result.get("error", "unknown")})
            continue

        response_text = result["text"].lower()
        passed = True
        failures = []

        for word in must_contain:
            if word.lower() not in response_text:
                passed = False
                failures.append(f"missing '{word}'")

        for word in must_not_contain:
            if word.lower() in response_text:
                passed = False
                failures.append(f"forbidden '{word}'")

        # Disclaimer check for financial queries
        financial_categories = {"calculation", "product-explanation", "compliance", "disclaimer-check", "investment"}
        if category in financial_categories:
            disclaimer_patterns = ["shariah disclaimer", "educational and guidance", "shariah advisor", "شرعی نوٹ"]
            has_disclaimer = any(p in response_text for p in disclaimer_patterns)
            if not has_disclaimer:
                failures.append("missing shariah disclaimer")

        if passed:
            print("✅ PASS")
            results.append({"id": case_id, "status": "pass"})
        else:
            print(f"❌ FAIL: {', '.join(failures)}")
            results.append({"id": case_id, "status": "fail", "failures": failures})

    return results


# ---- Main ----

def main():
    parser = argparse.ArgumentParser(description="Islamic Banking FTE Eval Runner")
    parser.add_argument("--live", action="store_true", help="Run live API tests")
    parser.add_argument("--base-url", default="http://localhost:3000", help="Base URL for live tests")
    parser.add_argument("--golden", default=None, help="Specific golden file to test (default: all)")
    args = parser.parse_args()

    eval_dir = Path(__file__).parent
    project_dir = eval_dir.parent
    skills_dir = project_dir / "skills"
    all_errors = []

    # ---- Structure Validation ----
    print("=" * 60)
    print("STRUCTURE VALIDATION")
    print("=" * 60)

    routing = eval_dir / "routing-golden.json"
    if routing.exists():
        all_errors.extend(validate_routing_golden(routing))
        print(f"routing-golden.json: {len(json.loads(routing.read_text()))} cases")
    else:
        all_errors.append("routing-golden.json not found")

    product = eval_dir / "product-golden.json"
    if product.exists():
        all_errors.extend(validate_product_golden(product))
        print(f"product-golden.json: {len(json.loads(product.read_text()))} cases")
    else:
        all_errors.append("product-golden.json not found")

    core_skills = [
        "islamic-finance-router", "murabaha-specialist", "ijara-specialist",
        "salam-specialist", "istisna-a-specialist", "sukuk-issuer", "sukuk-investor",
        "takaful-ifrs17", "musharaka-full", "musharaka-dm",
        "musharakah-mudarabah-specialist", "zakat-advisor", "shariah-compliance-checker",
        "halal-calculator", "islamic-product-explainer", "pakistan-banking-navigator",
        "islamic-banking-advisor", "sukuk-takaful-specialist",
    ]
    print(f"\nValidating {len(core_skills)} core skills...")
    for skill in core_skills:
        all_errors.extend(validate_skill_exists(skills_dir, skill))

    hooks_file = project_dir / "hooks" / "hooks.json"
    if hooks_file.exists():
        hooks = json.loads(hooks_file.read_text())
        if "hooks" not in hooks:
            all_errors.append("hooks.json: missing 'hooks' key")
        else:
            if "SessionStart" not in hooks["hooks"]:
                all_errors.append("hooks.json: missing SessionStart hook")
            if "PostToolUse" not in hooks["hooks"]:
                all_errors.append("hooks.json: missing PostToolUse hook")
        print("hooks.json: found")
    else:
        all_errors.append("hooks.json not found")

    overlays_dir = skills_dir / "islamic-finance-router" / "references" / "jurisdictions"
    if overlays_dir.exists():
        expected_overlays = [
            "pakistan-ifrs.md", "uae-ifrs.md", "saudi-ifrs.md", "malaysia-mfrs.md",
            "bahrain-aaoifi.md", "kuwait-ifrs.md", "qatar-aaoifi.md", "oman-ifrs.md",
            "turkey-tfrs.md", "nigeria-ifrs.md", "indonesia-psak.md", "uk-ifrs.md",
            "gcc-crossborder.md",
        ]
        existing = [f.name for f in overlays_dir.glob("*.md")]
        missing = set(expected_overlays) - set(existing)
        if missing:
            all_errors.append(f"Missing jurisdiction overlays: {missing}")
        print(f"Jurisdiction overlays: {len(existing)}/13")
    else:
        all_errors.append("Jurisdiction overlays directory not found")

    if all_errors:
        print(f"\n❌ STRUCTURE FAILED: {len(all_errors)} errors:")
        for e in all_errors:
            print(f"  - {e}")
    else:
        print("\n✅ STRUCTURE PASSED: All golden files and skills valid.")

    # ---- Live Testing ----
    if args.live:
        if not requests:
            print("\n❌ --live requires 'requests' library: pip install requests")
            sys.exit(1)

        print("\n" + "=" * 60)
        print(f"LIVE API TESTING ({args.base_url})")
        print("=" * 60)

        golden_files = []
        if args.golden:
            golden_files.append(eval_dir / args.golden)
        else:
            golden_files = [eval_dir / "product-golden.json", eval_dir / "negative-cases.json"]

        all_results = []
        for gf in golden_files:
            if not gf.exists():
                print(f"\n⚠️  {gf.name} not found — skipping")
                continue
            print(f"\n--- {gf.name} ---")
            results = run_live_evals(args.base_url, gf)
            all_results.extend(results)

        # Summary
        passed = sum(1 for r in all_results if r["status"] == "pass")
        failed = sum(1 for r in all_results if r["status"] == "fail")
        skipped = sum(1 for r in all_results if r["status"] == "skipped")
        total = len(all_results)

        print(f"\n{'=' * 60}")
        print(f"RESULTS: {passed}/{total} passed, {failed} failed, {skipped} skipped")
        print(f"{'=' * 60}")

        if failed > 0:
            print("\nFailed cases:")
            for r in all_results:
                if r["status"] == "fail":
                    print(f"  ❌ {r['id']}: {', '.join(r.get('failures', []))}")

    # Exit code
    sys.exit(1 if all_errors else 0)


if __name__ == "__main__":
    main()
