# Local mesh ownership protocol v2

Remote Pi treats one running agent as one logical mesh peer. A TUI, dashboard, mobile app, or other frontend is not a separate peer when it is attached to that agent runtime.

## Identity and address

Each registration carries two separate values:

- `logical_agent_id`: an opaque stable identity used only for exclusive ownership.
- `name` and `cwd`: human-readable inputs used to assign a routing address such as `<cwd>@<name>`.

Pi runtimes derive `logical_agent_id` from `SessionManager.getSessionId()` and prefix it with `pi-session:`. This includes TUI, RPC, and supervised daemon processes.

The standalone MCP launcher generates one UUID for each `remote-pi claude` launch. It prefixes the value with `mcp-session:` and passes it to every MCP subprocess started from that launch through the temporary MCP configuration.

The broker does not parse either prefix. It treats the complete identity as opaque.

## Registration contract

Protocol v2 registration uses this frame:

```json
{
  "type": "register",
  "protocol_version": 2,
  "logical_agent_id": "pi-session:<uuid>",
  "name": "agent",
  "cwd": "/path/to/project"
}
```

The broker validates the protocol and identity before assigning an address, adding the connection to peer inventory, broadcasting `peer_joined`, or routing messages.

Only one active connection may own a logical identity. A duplicate receives `logical_agent_already_connected`; the first owner remains connected. The rejected client does not reconnect automatically.

Different logical identities may request the same name and cwd. Existing address collision handling remains in effect, so later peers receive suffixes such as `#2`.

A rename changes the routing address without releasing logical ownership.

## Rollout

Protocol v2 uses `broker-v2.sock`, or the corresponding versioned Windows named pipe. This prevents an upgraded client from registering through an already-running v1 broker before it can detect the old acknowledgement format.

All local participants must be upgraded and restarted before they can see one another on the v2 mesh. Registrations without protocol v2 identity fail closed.

## Operational scope

This version supports:

- same-machine agent mesh routing;
- mobile frontend control through the existing relay;
- multiple frontend types when they attach to one owning runtime.

Cross-PC agent-to-agent routing is disabled at the Pi and MCP composition points. Distributed ownership is required before that route can safely reopen. Generic bridge code remains in the package for that later change.

A rejected Pi runtime stays usable locally and may keep mobile control. After the owner exits, the operator can run `/remote-pi` to make one explicit ownership attempt. A rejected MCP subprocess exits with an actionable error.
