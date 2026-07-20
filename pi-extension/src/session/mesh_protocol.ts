export const MESH_PROTOCOL_VERSION = 2 as const;

export type MeshRegistrationErrorCode =
  | "unsupported_protocol"
  | "invalid_registration"
  | "invalid_logical_agent_id"
  | "logical_agent_already_connected";

export interface RegisterRequest {
  type: "register";
  protocol_version: typeof MESH_PROTOCOL_VERSION;
  logical_agent_id: string;
  name: string;
  cwd?: string;
}

export interface RegisterAck {
  type: "register_ack";
  protocol_version: typeof MESH_PROTOCOL_VERSION;
  address_assigned: string;
  name_assigned: string;
}

export interface RenameRequest {
  type: "rename";
  protocol_version: typeof MESH_PROTOCOL_VERSION;
  name: string;
}

export interface RenameAck {
  type: "rename_ack";
  protocol_version: typeof MESH_PROTOCOL_VERSION;
  address_assigned: string;
  name_assigned: string;
}

export interface RegisterErrorFrame {
  type: "register_error";
  protocol_version: typeof MESH_PROTOCOL_VERSION;
  code: MeshRegistrationErrorCode;
  message: string;
  owner_address?: string;
}

export class MeshRegistrationError extends Error {
  readonly code: MeshRegistrationErrorCode;
  readonly ownerAddress?: string;

  constructor(code: MeshRegistrationErrorCode, message: string, ownerAddress?: string) {
    super(message);
    this.name = "MeshRegistrationError";
    this.code = code;
    if (ownerAddress !== undefined) this.ownerAddress = ownerAddress;
  }
}

export function isLogicalAgentId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
