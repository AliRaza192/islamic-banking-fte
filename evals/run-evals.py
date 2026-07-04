# /// script
# dependencies = []
# ///
"""
Islamic Banking FTE — Eval Runner
Run: python3 evals/run-evals.py

Validates that golden files exist and have expected structure.
Does NOT run actual LLM inference — that requires the plugin installed.
"""

import json
import sys
from pathlib import Path


def validate_routing_golden(path: Path) -> list[str]:
    errors = []
    cases = json.loads(path.read_text())
    if len(cases) < 13:
        errors.append(f"routing-golden.json: expected 13+ cases, got {len(cases)}")
    required_fields = [
        "id",
        "query",
        "expected_skill",
        "expected_jurisdiction",
        "category",
    ]
    for i, c in enumerate(cases):
        for f in required_fields:
            if f not in c:
                errors.append(f"routing-golden.json case {i}: missing field '{f}'")
    # Check jurisdiction coverage
    jurisdictions = {c.get("expected_jurisdiction", "") for c in cases}
    expected = {
        "pakistan",
        "uae",
        "saudi",
        "malaysia",
        "bahrain",
        "kuwait",
        "qatar",
        "oman",
        "turkey",
        "nigeria",
        "indonesia",
        "uk",
    }
    missing = expected - jurisdictions
    if missing:
        errors.append(f"routing-golden.json: missing jurisdictions: {missing}")
    # Check skill coverage
    skills = {c.get("expected_skill", "") for c in cases}
    expected_skills = {
        "murabaha-specialist",
        "ijara-specialist",
        "salam-specialist",
        "istisna-a-specialist",
        "sukuk-issuer",
        "sukuk-investor",
        "takaful-ifrs17",
        "musharaka-full",
        "musharakah-mudarabah-specialist",
        "shariah-compliance-checker",
        "halal-calculator",
        "islamic-product-explainer",
        "pakistan-banking-navigator",
        "zakat-advisor",
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
    required_fields = [
        "id",
        "skill",
        "query",
        "must_contain",
    ]
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


def main():
    eval_dir = Path(__file__).parent
    project_dir = eval_dir.parent
    skills_dir = project_dir / "skills"
    all_errors = []

    # Validate routing golden
    routing = eval_dir / "routing-golden.json"
    if routing.exists():
        all_errors.extend(validate_routing_golden(routing))
        print(f"routing-golden.json: {len(json.loads(routing.read_text()))} cases")
    else:
        all_errors.append("routing-golden.json not found")

    # Validate product golden
    product = eval_dir / "product-golden.json"
    if product.exists():
        all_errors.extend(validate_product_golden(product))
        print(f"product-golden.json: {len(json.loads(product.read_text()))} cases")
    else:
        all_errors.append("product-golden.json not found")

    # Validate core skills exist
    core_skills = [
        "islamic-finance-router",
        "murabaha-specialist",
        "ijara-specialist",
        "salam-specialist",
        "istisna-a-specialist",
        "sukuk-issuer",
        "sukuk-investor",
        "takaful-ifrs17",
        "musharaka-full",
        "musharaka-dm",
        "musharakah-mudarabah-specialist",
        "zakat-advisor",
        "shariah-compliance-checker",
        "halal-calculator",
        "islamic-product-explainer",
        "pakistan-banking-navigator",
        "islamic-banking-advisor",
        "sukuk-takaful-specialist",
    ]
    print(f"\nValidating {len(core_skills)} core skills...")
    for skill in core_skills:
        all_errors.extend(validate_skill_exists(skills_dir, skill))

    # Validate hooks
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

    # Validate jurisdiction overlays
    overlays_dir = skills_dir / "islamic-finance-router" / "references" / "jurisdictions"
    if overlays_dir.exists():
        expected_overlays = [
            "pakistan-ifrs.md",
            "uae-ifrs.md",
            "saudi-ifrs.md",
            "malaysia-mfrs.md",
            "bahrain-aaoifi.md",
            "kuwait-ifrs.md",
            "qatar-aaoifi.md",
            "oman-ifrs.md",
            "turkey-tfrs.md",
            "nigeria-ifrs.md",
            "indonesia-psak.md",
            "uk-ifrs.md",
            "gcc-crossborder.md",
        ]
        existing = [f.name for f in overlays_dir.glob("*.md")]
        missing = set(expected_overlays) - set(existing)
        if missing:
            all_errors.append(f"Missing jurisdiction overlays: {missing}")
        print(f"Jurisdiction overlays: {len(existing)}/13")
    else:
        all_errors.append("Jurisdiction overlays directory not found")

    # Summary
    if all_errors:
        print(f"\nFAILED: {len(all_errors)} errors:")
        for e in all_errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("\nPASSED: All golden files and skills valid.")


if __name__ == "__main__":
    main()
