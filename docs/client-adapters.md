# Client adapters

The runner integrates with any coding agent through a non-interactive process contract rather than client-specific APIs.

## Adapter requirements

Create a wrapper that:

1. Accepts the task prompt as one argument.
2. Starts a new isolated agent session.
3. Uses the current working directory as the repository.
4. Waits for completion and forwards the exit code.
5. Does not add benchmark framing, condition names, or information about the paired trial.

Then configure:

```json
{
  "agent": {
    "command": ["./my-agent-wrapper", "{prompt}"]
  }
}
```

## GitHub Copilot CLI

Copilot CLI recognizes `AGENTS.md` in the Git root and current directory and provides `/cwd`, `/skills`, `/agent`, and subagent workflows. The current built-in help does not document a stable non-interactive prompt flag, so this project does not guess one.

Use one of these approaches:

- Run the `agents-md-benchmark` skill interactively and let the orchestrator launch isolated child agents.
- Provide a local wrapper for a supported non-interactive invocation in your installed Copilot CLI version.
- Use a purpose-built extension that accepts a prompt and exits with the child session's result.

Verify any wrapper against `copilot --help` or the installed version's documentation before recording a benchmark.

## OpenClaw

Use the skill's orchestration workflow with isolated `sessions_spawn(mode="run", context="isolated")` calls. Pass only the condition path and task prompt to each child. Do not use the same conversational session for both conditions.

The standalone runner can also call a local OpenClaw wrapper if it satisfies the adapter requirements above.

## Claude Code and other CLIs

Configure the client's documented non-interactive command in `agent.command`. Because flags and permission modes change between versions, record the exact client version and command in the private report rather than relying on an example copied from this repository.

Before a full benchmark, run one baseline and one treatment smoke trial and confirm:

- Each invocation creates a new session.
- The process exits without manual input.
- Files change only inside the trial directory.
- Logs contain no condition metadata injected by the adapter.
