#!/usr/bin/env python3
"""
Islamic Banking FTE - Routing Validation Script
Tests that keyword routing and jurisdiction detection work correctly.
Loads test cases from golden JSON files.

Usage: python3 scripts/validate-routing.py
"""

import json
from pathlib import Path

# ---- Load golden file ----
def load_golden_tests():
    golden_path = Path("evals/routing-golden.json")
    if golden_path.exists():
        with open(golden_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    # Fallback to hardcoded tests if golden file missing
    return None

# Product skill routing tests (fallback)
PRODUCT_ROUTING_TESTS = [
    ("What is murabaha financing?", "murabaha-specialist"),
    ("Car loan halal hai?", "murabaha-specialist"),
    ("Calculate my zakat", "zakat-advisor"),
    ("Kitni zakat banti hai?", "zakat-advisor"),
    ("Ijara for car lease", "ijara-specialist"),
    ("Kiraya pe ghar", "ijara-specialist"),
    ("Musharakah partnership", "musharakah-mudarabah-specialist"),
    ("Diminishing musharakah home finance", "musharakah-mudarabah-specialist"),
    ("Sukuk investment", "sukuk-takaful-specialist"),
    ("Takaful insurance", "sukuk-takaful-specialist"),
    ("Is this halal?", "shariah-compliance-checker"),
    ("Kya yeh jaiz hai?", "shariah-compliance-checker"),
    ("Calculate monthly installment", "halal-calculator"),
    ("Kitni qist hogi?", "halal-calculator"),
    ("What is Islamic banking?", "islamic-product-explainer"),
    ("Islamic banking kya hai?", "islamic-product-explainer"),
    ("Meezan Bank profit rate", "pakistan-banking-navigator"),
    ("SBP Islamic banking", "pakistan-banking-navigator"),
    ("Which bank is best?", "islamic-banking-advisor"),
    ("Recommend me a product", "islamic-banking-advisor"),
]

JURISDICTION_TESTS = [
    ("Meezan Bank Pakistan", "pakistan"),
    ("SBP regulations", "pakistan"),
    ("Emirates Islamic Bank", "uae"),
    ("Dubai Islamic finance", "uae"),
    ("Al Rajhi Bank", "saudi"),
    ("Saudi Arabia banking", "saudi"),
    ("ZATCA zakat", "saudi"),
    ("Maybank Islamic", "malaysia"),
    ("BNM regulations", "malaysia"),
    ("Bahrain Islamic bank", "bahrain"),
    ("AAOIFI standards", "bahrain"),
    ("Kuwait Finance House", "kuwait"),
    ("No jurisdiction mentioned", "pakistan"),
]


def detect_skill(msg):
    msg = msg.lower()
    if "murabaha" in msg or "مرابحة" in msg or "car loan" in msg or "ghar ka qarz" in msg or "cost-plus" in msg:
        return "murabaha-specialist"
    if "zakat" in msg or "zakaat" in msg or "زکات" in msg or "nisab" in msg or "نصاب" in msg:
        return "zakat-advisor"
    if "ijara" in msg or "ijarah" in msg or "إجارة" in msg or "lease" in msg or "kiraya" in msg:
        return "ijara-specialist"
    if "salam" in msg or "سلم" in msg or "forward sale" in msg or "crop financing" in msg:
        return "salam-specialist"
    if "istisna" in msg or "استصناع" in msg or "construction financ" in msg:
        return "istisna-a-specialist"
    if ("sukuk" in msg and ("issuance" in msg or "issue" in msg or "issuer" in msg or "structure" in msg or "spv" in msg)):
        return "sukuk-issuer"
    if ("sukuk" in msg and ("invest" in msg or "buy" in msg or "yield" in msg or "return" in msg)):
        return "sukuk-investor"
    if ("takaful" in msg and ("accounting" in msg or "ifrs17" in msg or "ifrs 17" in msg or "operator" in msg)):
        return "takaful-ifrs17"
    if "full musharakah" in msg or "permanent musharakah" in msg or "running musharakah" in msg or "sme partnership" in msg:
        return "musharaka-full"
    if "musharakah" in msg or "mudarabah" in msg or "مشاركة" in msg or "مضاربة" in msg or "partnership" in msg:
        return "musharakah-mudarabah-specialist"
    if "sukuk" in msg or "takaful" in msg or "صكوك" in msg or "تكافل" in msg or "islamic insurance" in msg:
        return "sukuk-takaful-specialist"
    if "halal" in msg or "haram" in msg or "jaiz" in msg or "جائز" in msg or "ناجائز" in msg or "na-jaiz" in msg or "riba" in msg or "gharar" in msg or "kya yeh" in msg:
        return "shariah-compliance-checker"
    if "meezan" in msg or "sbp" in msg or "pakistan" in msg or "kibor" in msg or "pkr" in msg:
        return "pakistan-banking-navigator"
    if "calculate" in msg or "hisab" in msg or "kitna" in msg or "qist" in msg or "installment" in msg:
        return "halal-calculator"
    if "what is" in msg or "explain" in msg or "kya hai" in msg or "bataiye" in msg:
        return "islamic-product-explainer"
    return "islamic-banking-advisor"


def detect_jurisdiction(msg):
    msg = msg.lower()
    if "uae" in msg or "dubai" in msg or "emirates islamic" in msg or "aed" in msg or "cbuae" in msg:
        return "uae"
    if "saudi" in msg or "ksa" in msg or "al rajhi" in msg or "sar" in msg or "sama" in msg or "zatca" in msg:
        return "saudi"
    if "malaysia" in msg or "maybank" in msg or "myr" in msg or "bnm" in msg:
        return "malaysia"
    if "bahrain" in msg or "bhd" in msg or "cbb" in msg or "aaoifi" in msg:
        return "bahrain"
    if "kuwait" in msg or "kuwait finance" in msg or "kwd" in msg or "cbk" in msg or "kfh" in msg:
        return "kuwait"
    if "qatar" in msg or "qar" in msg or "qib" in msg or "qcb" in msg:
        return "qatar"
    if "oman" in msg or "omr" in msg or "cbo" in msg or "bank nizwa" in msg:
        return "oman"
    if "turkey" in msg or "turkish" in msg or "try" in msg or "bddk" in msg or "kuveyt turk" in msg:
        return "turkey"
    if "nigeria" in msg or "ngn" in msg or "cbn" in msg or "jaiz bank" in msg:
        return "nigeria"
    if "indonesia" in msg or "idr" in msg or "ojk" in msg or "bsi" in msg or "bank muamalat" in msg:
        return "indonesia"
    if ("uk" in msg and "sukuk" not in msg) or "united kingdom" in msg or "gbp" in msg or "al rayan" in msg or "hmrc" in msg:
        return "uk"
    if "gcc" in msg or "cross-border" in msg or "gulf" in msg:
        return "gcc-crossborder"
    return "pakistan"


def run_tests():
    print("=" * 60)
    print("Islamic Banking FTE - Routing Validation")
    print("=" * 60)

    total = 0
    passed = 0
    failed = []

    golden = load_golden_tests()

    if golden:
        print(f"\n--- Golden File Routing Tests ({len(golden)} cases) ---")
        for test in golden:
            query = test["query"]
            expected_skill = test["expected_skill"]
            expected_juris = test.get("expected_jurisdiction", "pakistan")

            actual_skill = detect_skill(query)
            actual_juris = detect_jurisdiction(query)

            skill_ok = actual_skill == expected_skill
            juris_ok = actual_juris == expected_juris
            test_pass = skill_ok and juris_ok

            total += 1
            if test_pass:
                passed += 1
            else:
                fail_detail = f"  [{test['id']}] '{query}'"
                if not skill_ok:
                    fail_detail += f" | skill: expected={expected_skill}, got={actual_skill}"
                if not juris_ok:
                    fail_detail += f" | jurisdiction: expected={expected_juris}, got={actual_juris}"
                failed.append(fail_detail)

            status = "PASS" if test_pass else "FAIL"
            print(f"  [{status}] [{test['id']}] '{query[:45]}...' -> {actual_skill}")
    else:
        print("\n--- Fallback Routing Tests ---")
        for query, expected in PRODUCT_ROUTING_TESTS:
            total += 1
            actual = detect_skill(query)
            status = "PASS" if actual == expected else "FAIL"
            if status == "PASS":
                passed += 1
            else:
                failed.append(f"  Query: '{query}' | Expected: {expected} | Got: {actual}")
            print(f"  [{status}] '{query}' -> {actual}")

        print("\n--- Jurisdiction Detection ---")
        for query, expected in JURISDICTION_TESTS:
            total += 1
            actual = detect_jurisdiction(query)
            status = "PASS" if actual == expected else "FAIL"
            if status == "PASS":
                passed += 1
            else:
                failed.append(f"  Query: '{query}' | Expected: {expected} | Got: {actual}")
            print(f"  [{status}] '{query}' -> {actual}")

    print("\n" + "=" * 60)
    print(f"Results: {passed}/{total} passed ({passed/total*100:.1f}%)")
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for f in failed:
            print(f)
    else:
        print("\nAll tests passed!")
    print("=" * 60)

    return 0 if not failed else 1


if __name__ == "__main__":
    raise SystemExit(run_tests())
