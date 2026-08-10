---
name: diagnose-lab-startup
description: Six-layer diagnosis of a Constellab cloud data lab that will not start
disable-model-invocation: true
---

# Diagnose a lab that will not start

Starting a cloud lab passes through six layers, each of which can fail. `lab_diagnose_start`
returns the **verdict**: which layer it is blocked at. Everything above that layer is
unverified, so output read from there is **noise** — and a clean-looking log is the most
convincing noise there is.

Cloud labs only. On on-premise and desktop labs four of the six layers do not exist and the
verdict refuses; `lab_list_containers` and `lab_container_logs` still hold.

## 1. Name the Space, then the lab

`space` is required on every tool, and no default is applied silently. Take it from
`constellab_get_default_space`, or from `constellab_list_spaces` when the user named a
Space, and tell the user which Space you are working in.

`lab_find` locates the lab and carries `canDebug` per row. `canDebug: false` means you hold
less than OWNER: `lab_status_timeline` and `lab_refresh_status` answer, the rest refuse.
State that before you start.

A refusal is an authorization fact, whether it names a Space that does not own the lab or a
role you lack. Report the roles held and required, and stop there — the lab is a separate
question, still unanswered.

**Done when** the user has been told the Space and the lab you are working on.

## 2. Take the verdict before reading anything else

`lab_diagnose_start` probes five layers and reports `blockedAtLayer`. It reads; it changes
nothing.

- `unknown` counts as blocked — the probe could not conclude, which is a finding of its own.
- `blockedAtLayer` is the first layer that is not `ok`.
- `hypotheses[]` are ranked guesses. Carry each as a hypothesis until a layer reason or a
  log line turns it into evidence.

**Done when** you can name `blockedAtLayer` and quote the reason string beside it, with
every other layer accounted for.

## The six layers

| #   | Layer          | Read from                            | A failure here means                                                                                                                           |
| --- | -------------- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Space DB       | `lab.status`, `lab.serverTaskStatus` | A task stuck at `RUNNING`: a previous operation never finished, and nothing below it moves until it is cleared.                                |
| 2   | Cloud provider | `layers.cloud`                       | Instance, volume or static IP missing, or the volume unattached. There is nothing to reach yet.                                                |
| 3   | DNS            | `layers.dns`                         | The record is absent or has not propagated. The server can be healthy and simply unreachable by name.                                          |
| 4   | SSH / OS       | `layers.ssh`                         | The machine itself. Behind it: the lab-configurer clone, the volume mount, `prepare_server.sh`, a reboot, `init.sh`, then `docker compose up`. |
| 5   | Lab manager    | `layers.labManager`                  | Health check down, `isInitialized` or `isConfigured` false, version behind.                                                                    |
| 6   | Glab           | `layers.glab`                        | `labStatus: 'ERROR'`, a start error flagged, or `startProgress` stalled.                                                                       |

"SSH answers but the lab manager is dead" and "SSH does not answer" are separate diagnoses
at separate layers. Held apart, they point at different fixes.

## 3. Read the evidence that layer justifies

| `blockedAtLayer`                    | The evidence                                                                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cloud`, `dns`, `ssh`               | The layer reason is the answer. Container output is noise: the containers do not exist yet, so an empty log reads as "the containers are fine".                   |
| `labManager`                        | `lab_get_start_errors`, then containers once the manager answers at all.                                                                                          |
| `glab`                              | `lab_get_start_errors` → `lab_list_containers` restricted to what is not running → `lab_container_logs` on those.                                                 |
| nothing blocked, lab still unusable | `lab_status_timeline`. `everStarted: false` means it never worked, so look at configuration; `true` means a regression, so compare its `at` against what changed. |

## Logs

- `mainErrors` first. Reach for the raw `logs` when `mainErrors` is empty or too vague to act on.
- `containerName` comes from `lab_list_containers`, which is what makes it valid input.
- `filteredLocally: true` means `pattern`, `since` and `contextLines` were skipped: you hold
  the last lines of the log, unfiltered. Scan them yourself, and tell the user this lab's
  lab manager is behind on server-side log filtering.
- `truncated: true`, or `totalLines` above what you received, means you hold a window. Widen
  it or filter to errors before treating a quiet log as a clean one.

## `lab_refresh_status` acts on the lab

Reconciling a lab can make the platform start its bricks. That is often the fix — so ask the
user first, say that it may start bricks, and run it after a verdict, so there is a
before-state to compare against.

## This tool set reads

When the fix is an action — clearing a stuck task, restarting a container, restarting or
reconfiguring the server, reinitialising the lab manager — name that action for the user to
perform in Constellab, and say which one it is.

## Answer in three parts

1. The layer it is blocked at, with the reason string the verdict returned.
2. The evidence you read: a log line, a container status, a timeline entry.
3. One next action, and who can perform it.

**Done when** every claim in the answer traces to a field you read, or is labelled a
hypothesis.
