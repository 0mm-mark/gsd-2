import test from 'node:test';
import assert from 'node:assert/strict';
import { registerNativeSearchHooks, XAI_DISABLED_TOOLS } from './native-search.js';

test('xAI model detection disables conflicting tools', () => {
  const handlers = {};
  let activeTools = ['search-the-web', 'google_search', 'resolve_library', 'get_library_docs', 'lsp', 'read'];
  const pi = {
    on: (event, handler) => { handlers[event] = handler; },
    getActiveTools: () => activeTools,
    setActiveTools: (tools) => { activeTools = tools; },
  };

  registerNativeSearchHooks(pi);

  // xAI model select
  handlers['model_select']({
    model: { provider: 'xai', name: 'grok-beta' }
  }, { ui: { notify: () => {} } });

  assert.ok(!activeTools.includes('search-the-web'), 'should disable search-the-web for xAI');
  assert.ok(!activeTools.includes('resolve_library'), 'should disable Context7 resolve_library for xAI');
  assert.ok(!activeTools.includes('get_library_docs'), 'should disable Context7 get_library_docs for xAI');
  assert.ok(activeTools.includes('lsp'), 'non-conflicting tools remain');

  // switch away from xAI
  handlers['model_select']({
    model: { provider: 'openai', name: 'gpt-4o' }
  }, { ui: { notify: () => {} } });

  assert.ok(activeTools.includes('search-the-web'), 'should re-enable tools when leaving xAI');
  assert.ok(activeTools.includes('resolve_library'), 'should re-enable Context7 tools when leaving xAI');
});
