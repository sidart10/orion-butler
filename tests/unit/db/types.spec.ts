import { describe, it, expectTypeOf } from 'vitest';
import type {
  Conversation,
  NewConversation,
  Message,
  NewMessage,
  SessionIndex,
  NewSessionIndex,
} from '@/db/schema';

describe('Type Inference', () => {
  describe('Conversation types', () => {
    it('Conversation type has correct shape', () => {
      expectTypeOf<Conversation>().toHaveProperty('id');
      expectTypeOf<Conversation>().toHaveProperty('type');
      expectTypeOf<Conversation>().toHaveProperty('startedAt');
      expectTypeOf<Conversation['type']>().toEqualTypeOf<
        'daily' | 'project' | 'inbox' | 'adhoc'
      >();
    });

    it('Conversation has optional fields as nullable', () => {
      expectTypeOf<Conversation['title']>().toEqualTypeOf<string | null>();
      expectTypeOf<Conversation['sdkSessionId']>().toEqualTypeOf<
        string | null
      >();
      expectTypeOf<Conversation['projectId']>().toEqualTypeOf<string | null>();
      expectTypeOf<Conversation['lastMessageAt']>().toEqualTypeOf<
        string | null
      >();
      expectTypeOf<Conversation['messageCount']>().toEqualTypeOf<
        number | null
      >();
      expectTypeOf<Conversation['contextSummary']>().toEqualTypeOf<
        string | null
      >();
    });

    it('NewConversation allows optional fields', () => {
      expectTypeOf<NewConversation>().toHaveProperty('id');
      expectTypeOf<NewConversation>().toHaveProperty('type');
      expectTypeOf<NewConversation>().toHaveProperty('startedAt');
    });
  });

  describe('Message types', () => {
    it('Message type has correct shape', () => {
      expectTypeOf<Message>().toHaveProperty('id');
      expectTypeOf<Message>().toHaveProperty('conversationId');
      expectTypeOf<Message>().toHaveProperty('role');
      expectTypeOf<Message>().toHaveProperty('content');
      expectTypeOf<Message>().toHaveProperty('createdAt');
    });

    it('Message role is union type', () => {
      expectTypeOf<Message['role']>().toEqualTypeOf<'user' | 'assistant'>();
    });

    it('Message has optional JSON fields', () => {
      expectTypeOf<Message['toolCalls']>().toEqualTypeOf<string | null>();
      expectTypeOf<Message['toolResults']>().toEqualTypeOf<string | null>();
    });

    it('NewMessage requires conversationId', () => {
      expectTypeOf<NewMessage>().toHaveProperty('conversationId');
    });
  });

  describe('SessionIndex types', () => {
    it('SessionIndex has correct shape', () => {
      expectTypeOf<SessionIndex>().toHaveProperty('id');
      expectTypeOf<SessionIndex>().toHaveProperty('conversationId');
      expectTypeOf<SessionIndex>().toHaveProperty('type');
      expectTypeOf<SessionIndex>().toHaveProperty('displayName');
      expectTypeOf<SessionIndex>().toHaveProperty('lastActive');
      expectTypeOf<SessionIndex>().toHaveProperty('isActive');
    });

    it('SessionIndex isActive is number (SQLite boolean)', () => {
      expectTypeOf<SessionIndex['isActive']>().toEqualTypeOf<number | null>();
    });

    it('SessionIndex type is same union as Conversation', () => {
      expectTypeOf<SessionIndex['type']>().toEqualTypeOf<
        'daily' | 'project' | 'inbox' | 'adhoc'
      >();
    });

    it('NewSessionIndex has required fields', () => {
      expectTypeOf<NewSessionIndex>().toHaveProperty('conversationId');
      expectTypeOf<NewSessionIndex>().toHaveProperty('displayName');
      expectTypeOf<NewSessionIndex>().toHaveProperty('lastActive');
    });
  });
});
