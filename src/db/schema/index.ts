// Table definitions
export { conversations } from './conversations';
export type { Conversation, NewConversation } from './conversations';

export { messages } from './messages';
export type { Message, NewMessage, ToolCall, ToolResult } from './messages';
export {
  serializeToolCalls,
  deserializeToolCalls,
  serializeToolResults,
  deserializeToolResults,
} from './messages';

export { sessionIndex } from './session-index';
export type { SessionIndex, NewSessionIndex } from './session-index';

// PARA table definitions (Story 4.1c)
export { paraProjects, paraAreas, paraContacts, paraInboxItems } from './para';
export type {
  ParaProject,
  NewParaProject,
  ParaArea,
  NewParaArea,
  ParaContact,
  NewParaContact,
  ParaInboxItem,
  NewParaInboxItem,
} from './para';

// ID utilities
export {
  generateId,
  validateId,
  getIdPrefix,
  ID_PREFIXES,
} from './id-generator';
export type { IdPrefix } from './id-generator';
