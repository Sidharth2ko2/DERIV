"""
orchestrator_graph.py

Purpose:
- Central LangGraph orchestrator for Deriv Sentinel
- Enforces governance loop:
  attack → audit → HITL → heal → re-test → re-audit → resolve
"""

from typing import Dict, TypedDict
from langgraph.graph import StateGraph, END

from Scan_sentinel import semantic_policy_audit
from heal_engine import apply_heal
from bastion_client import query_bastion  # small helper, explained below


# ==============================
# STATE DEFINITION
# ==============================
class SentinelState(TypedDict):
    attack_id: int
    category: str
    user_prompt: str
    ai_response: str

    audit_result: Dict
    human_decision: str  # "accept" | "reject"

    healed: bool
    retested: bool
    resolved: bool
    iteration: int


# ==============================
# NODES
# ==============================
def audit_node(state: SentinelState) -> SentinelState:
    print(f"\n🔍 Auditing attack {state['attack_id']}")

    result = semantic_policy_audit(
        state["user_prompt"],
        state["ai_response"],
    )

    state["audit_result"] = result
    return state


def hitl_node(state: SentinelState) -> SentinelState:
    """
    Human-in-the-loop gate.
    Hackathon mode: auto-reject violations.
    """

    audit = state["audit_result"]

    print("\n🚨 HITL REVIEW")
    print(f"Violation: {audit.get('violation')}")
    print(f"Category: {audit.get('category')}")
    print(f"Risk Score: {audit.get('risk_score')}")
    print(f"Reason: {audit.get('reason')}")

    if audit.get("violation") == "Yes":
        decision = "reject"
    else:
        decision = "accept"

    state["human_decision"] = decision
    print(f"🧑‍⚖️ Decision: {decision.upper()}")
    return state


def heal_node(state: SentinelState) -> SentinelState:
    print("💉 Applying heal...")

    apply_heal({
        "attack_id": state["attack_id"],
        "category": state["audit_result"].get("category"),
        "risk_score": state["audit_result"].get("risk_score"),
        "reason": state["audit_result"].get("reason"),
    })

    state["healed"] = True
    return state


def retest_node(state: SentinelState) -> SentinelState:
    """
    Re-query Bastion AFTER heal.
    In real deployment: Bastion hot-reloads prompt.
    """

    print("🔄 Re-testing Bastion after heal...")

    new_response = query_bastion(state["user_prompt"])

    state["ai_response"] = new_response
    state["retested"] = True
    state["iteration"] += 1
    return state


def resolve_node(state: SentinelState) -> SentinelState:
    """
    Final resolution after re-audit.
    """

    audit = state["audit_result"]

    if audit.get("violation") == "No":
        state["resolved"] = True
        print("✅ Issue resolved after healing")
    else:
        state["resolved"] = False
        print("❌ Issue persists – escalation required")

    return state


# ==============================
# ROUTING LOGIC
# ==============================
def route_after_hitl(state: SentinelState):
    if state["human_decision"] == "reject":
        return "heal"
    return END


def route_after_reaudit(state: SentinelState):
    # loop guard: max 1 heal for demo
    if state["iteration"] >= 1:
        return "resolve"
    if state["audit_result"].get("violation") == "Yes":
        return "heal"
    return "resolve"


# ==============================
# BUILD GRAPH
# ==============================
def build_orchestrator():
    graph = StateGraph(SentinelState)

    graph.add_node("audit", audit_node)
    graph.add_node("hitl", hitl_node)
    graph.add_node("heal", heal_node)
    graph.add_node("retest", retest_node)
    graph.add_node("resolve", resolve_node)

    graph.set_entry_point("audit")

    graph.add_edge("audit", "hitl")

    graph.add_conditional_edges(
        "hitl",
        route_after_hitl,
        {
            "heal": "heal",
            END: END,
        },
    )

    graph.add_edge("heal", "retest")
    graph.add_edge("retest", "audit")

    graph.add_conditional_edges(
        "audit",
        route_after_reaudit,
        {
            "heal": "heal",
            "resolve": "resolve",
        },
    )

    graph.add_edge("resolve", END)

    return graph.compile()
