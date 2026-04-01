import { cleanup, renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { useMarkdownToolbar } from '@/features/edit-markdown/model/use-markdown-toolbar';

/**
 * Finds a regular toolbar action by label from the actions created by the hook.
 */
const getToolbarActionByLabel = (
  toolbarSections: ReturnType<typeof useMarkdownToolbar>['toolbarSections'],
  label: string,
) => {
  for (const section of toolbarSections) {
    for (const item of section.items) {
      if (item.type === 'action' && item.action.label === label) {
        return item.action;
      }
    }
  }

  throw new Error(`toolbar action not found: ${label}`);
};

/**
 * Finds a token popover option by label from the custom toolbar items created by the hook.
 */
const getToolbarTokenOptionByLabel = (
  toolbarSections: ReturnType<typeof useMarkdownToolbar>['toolbarSections'],
  label: string,
) => {
  for (const section of toolbarSections) {
    for (const item of section.items) {
      if (!item || item.type !== 'custom' || !React.isValidElement(item.node)) continue;

      const options = (
        item.node.props as { options?: Array<{ label: string; onClick: () => void }> }
      ).options;

      const matchedOption = options?.find(option => option.label === label);
      if (matchedOption) {
        return matchedOption;
      }
    }
  }

  throw new Error(`toolbar token option not found: ${label}`);
};

/**
 * Creates a markdown toolbar hook test harness with a textarea ref and onChange wiring.
 */
const renderMarkdownToolbarHook = () => {
  const textarea = document.createElement('textarea');
  document.body.append(textarea);

  const textareaRef = { current: textarea };
  const onChange = vi.fn((nextValue: string) => {
    textarea.value = nextValue;
  });

  const hook = renderHook(() =>
    useMarkdownToolbar({
      contentType: 'article',
      onChange,
      popoverTriggerClassName: '',
      textareaRef,
    }),
  );

  return {
    ...hook,
    onChange,
    textarea,
  };
};

describe('useMarkdownToolbar', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('Under a selected range, the Bold action must wrap the selected text', async () => {
    const { result, textarea } = renderMarkdownToolbarHook();

    textarea.value = 'OpenAI';
    textarea.setSelectionRange(0, 6);

    getToolbarActionByLabel(result.current.toolbarSections, 'Bold').onClick();

    await waitFor(() => {
      expect(textarea.value).toBe('**OpenAI**');
      expect(textarea.selectionStart).toBe(2);
      expect(textarea.selectionEnd).toBe(8);
    });
  });

  it('Under matching or empty heading states, the Title action must remove the same level or insert only the prefix', async () => {
    const { result, textarea } = renderMarkdownToolbarHook();

    textarea.value = '## Title';
    textarea.setSelectionRange(0, textarea.value.length);

    getToolbarTokenOptionByLabel(result.current.toolbarSections, 'Title 3').onClick();

    await waitFor(() => {
      expect(textarea.value).toBe('### Title');
    });

    textarea.setSelectionRange(0, textarea.value.length);
    getToolbarTokenOptionByLabel(result.current.toolbarSections, 'Title 3').onClick();

    await waitFor(() => {
      expect(textarea.value).toBe('Title');
    });

    textarea.value = '';
    textarea.setSelectionRange(0, 0);
    getToolbarTokenOptionByLabel(result.current.toolbarSections, 'Title 4').onClick();

    await waitFor(() => {
      expect(textarea.value).toBe('#### ');
      expect(textarea.selectionStart).toBe(5);
      expect(textarea.selectionEnd).toBe(5);
    });
  });

  it('Under the code block action, the toolbar must insert the placeholder and select the code region', async () => {
    const { result, textarea } = renderMarkdownToolbarHook();

    getToolbarActionByLabel(result.current.toolbarSections, 'Code block').onClick();

    await waitFor(() => {
      expect(textarea.value).toBe('```ts\nEnter code here\n```');
      expect(textarea.selectionStart).toBe(6);
      expect(textarea.selectionEnd).toBe(15);
    });
  });

  it('Under an empty editor state, the Toggle action must insert the toggle template', async () => {
    const { result, textarea } = renderMarkdownToolbarHook();

    getToolbarTokenOptionByLabel(result.current.toolbarSections, 'Toggle Title 4').onClick();

    await waitFor(() => {
      expect(textarea.value).toContain(':::toggle #### ');
      expect(textarea.value).toContain('\n:::');
    });
  });
});
