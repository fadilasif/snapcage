# SnapCage — Security Gateway (Demo)

**Every action checked. Every decision explained.**
SnapCage Security Gateway · Powered by Snap · By SubQ AI · **DEMO ENVIRONMENT · SANDBOX MODE**

Frontend-only hackathon prototype (Round 1). No backend, database, model integration, or tool execution —
all decisions, Snap responses, latency figures, and telemetry are deterministic local simulations.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build (verified)
npm run preview  # serve the build
```

## Demo flow (judge script)

1. **Overview** — system status, metrics, live event stream, recent decisions.
2. **Security Simulator** — pick Scenario A (`read_file` → ALLOW), B (`send_email` exfiltration → BLOCK),
   C (`delete_file` → APPROVAL REQUIRED). Press **Run Simulation** and watch stages progress.
3. Click any event / row / audit record to open the full 6-stage **decision trace**
   (request → interception → policy checks → simulated Snap judgment → decision → enforcement).
4. **Approval Queue** — approve or reject Scenario C; watch metrics, stream, and audit log update.
5. **Audit Logs** — search/filter by tool, action, trace ID (`SC-0001…`), decision, risk level.
6. **Policies** — read-only illustrative rules. **Reset Demo** in the simulator restores initial state.

## Simulated (not real)

Snap/Snap-by-SubQ-AI responses, evaluation latency, telemetry timestamps, agent activity,
enforcement outcomes, and approval effects. Approving an action only records authorization —
nothing is ever executed.
