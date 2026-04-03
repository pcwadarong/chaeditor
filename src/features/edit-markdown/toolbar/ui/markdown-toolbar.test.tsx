import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { MarkdownToolbar } from '@/features/edit-markdown/toolbar';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea/textarea';

import '@testing-library/jest-dom/vitest';

/**
 * Combines the toolbar and textarea to verify real edit interactions.
 */
const ToolbarHarness = () => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState('');
  const adapters = React.useMemo(
    () => ({
      uploadFile: async () => ({
        contentType: 'application/pdf',
        fileName: 'resume.pdf',
        fileSize: 2048,
        url: 'https://example.com/resume.pdf',
      }),
    }),
    [],
  );

  return (
    <>
      <MarkdownToolbar
        adapters={adapters}
        contentType="article"
        onChange={setValue}
        textareaRef={textareaRef}
      />
      <Textarea
        aria-label="Content input"
        autoResize={false}
        onChange={event => setValue(event.target.value)}
        ref={textareaRef}
        value={value}
      />
    </>
  );
};

/**
 * Verifies the scenario where a host app overrides popover labels through the toolbar UI registry.
 */
const ToolbarWithCustomUiRegistryHarness = () => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const [value, setValue] = React.useState('');

  return (
    <>
      <MarkdownToolbar
        contentType="article"
        onChange={setValue}
        textareaRef={textareaRef}
        uiRegistry={{
          labels: {
            headingPopover: {
              panelLabel: 'Choose custom title',
              triggerAriaLabel: 'Heading',
              triggerTooltip: 'Heading',
            },
            linkEmbedPopover: {
              panelLabel: 'Custom link panel',
              triggerAriaLabel: 'Add link',
              triggerTooltip: 'Add link',
            },
          },
        }}
      />
      <Textarea
        aria-label="Content input"
        autoResize={false}
        onChange={event => setValue(event.target.value)}
        ref={textareaRef}
        value={value}
      />
    </>
  );
};

describe('MarkdownToolbar', () => {
  it('Under a valid link URL, MarkdownToolbar must insert Title Link syntax', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;

    fireEvent.click(screen.getByRole('button', { name: 'Insert link' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Link URL' }), {
      target: { value: 'https://openai.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview link' }));

    await waitFor(() => {
      expect(textarea.value).toBe('[https://openai.com](https://openai.com/ "preview")');
    });
  });

  it('Under syntax insertion through the link popover, MarkdownToolbar must restore textarea focus and caret after the inserted content', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Hello suffix' } });
    textarea.focus();
    textarea.setSelectionRange(6, 6);

    fireEvent.click(screen.getByRole('button', { name: 'Insert link' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Link URL' }), {
      target: { value: 'https://openai.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Preview link' }));

    const insertedLink = '[https://openai.com](https://openai.com/ "preview")';

    await waitFor(() => {
      expect(textarea.value).toBe(`Hello ${insertedLink}suffix`);
      expect(document.activeElement).toBe(textarea);
      expect(textarea.selectionStart).toBe(6 + insertedLink.length);
      expect(textarea.selectionEnd).toBe(6 + insertedLink.length);
    });
  });

  it('Under an added web URL image, MarkdownToolbar must insert markdown image syntax', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;

    fireEvent.click(screen.getByRole('button', { name: 'Image' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Add web URLs' }), {
      target: { value: 'https://example.com/image.png' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: 'Insert as individual images' }));

    await waitFor(() => {
      expect(textarea.value).toBe('![Image description](https://example.com/image.png)');
    });
  });

  it('Under a confirmed uploaded attachment, MarkdownToolbar must insert Attachment syntax', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;

    fireEvent.click(screen.getByRole('button', { name: 'Attach file' }));
    fireEvent.change(screen.getByLabelText('Upload attachment'), {
      target: {
        files: [new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })],
      },
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('resume.pdf')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    await waitFor(() => {
      expect(textarea.value).toBe(
        '<Attachment href="https://example.com/resume.pdf" name="resume.pdf" size="2048" type="application/pdf" />',
      );
    });
  });

  it('Under an entered inline formula, MarkdownToolbar must insert Math syntax', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;

    fireEvent.click(screen.getByRole('button', { name: 'Math' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'LaTeX formula' }), {
      target: { value: 'a^2 + b^2 = c^2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Inline' }));

    await waitFor(() => {
      expect(textarea.value).toBe('<Math>a^2 + b^2 = c^2</Math>');
    });
  });

  it('Under leading and trailing whitespace in the selected text, MarkdownToolbar must preserve the whitespace in the link label', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '  OpenAI  ' } });
    textarea.setSelectionRange(0, textarea.value.length);

    fireEvent.click(screen.getByRole('button', { name: 'Insert link' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Link URL' }), {
      target: { value: 'https://openai.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hyperlink' }));

    await waitFor(() => {
      expect(textarea.value).toBe('[  OpenAI  ](https://openai.com/)');
    });
  });

  it('Under an alignment option selection, MarkdownToolbar must wrap the selected text in an align block while preserving the content', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Content to align' } });
    textarea.setSelectionRange(0, textarea.value.length);

    fireEvent.click(screen.getByRole('button', { name: 'Alignment' }));
    fireEvent.click(screen.getByRole('button', { name: 'Align center' }));

    await waitFor(() => {
      expect(textarea.value).toBe(':::align center\nContent to align\n:::');
      expect(textarea.selectionStart).toBe(':::align center\n'.length);
      expect(textarea.selectionEnd).toBe(':::align center\nContent to align'.length);
    });
  });

  it('Under a valid video URL, MarkdownToolbar must insert Video syntax', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Video URL' }), {
      target: { value: 'https://youtu.be/dQw4w9WgXcQ/extra' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    await waitFor(() => {
      expect(textarea.value).toBe('<Video provider="youtube" id="dQw4w9WgXcQ" />');
    });
  });

  it('Under an invalid video URL, MarkdownToolbar must not change the textarea value', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 0);

    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Video URL' }), {
      target: { value: 'not-a-video-url' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Insert' }));

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('Under the default compact toolbar, MarkdownToolbar must hide compacted buttons and show only the Title and Toggle triggers', () => {
    render(<ToolbarHarness />);

    expect(screen.queryByRole('button', { name: 'List' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Inline code' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Line break' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Toggle List' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Title 4' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Toggle Title 4' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Heading' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeTruthy();
  });

  it('Under focus on a toolbar action, MarkdownToolbar must show the action name in a tooltip', async () => {
    render(<ToolbarHarness />);

    const boldButton = screen.getByRole('button', { name: 'Bold' });
    fireEvent.focus(boldButton);

    expect(await screen.findByRole('tooltip', { name: 'Bold' })).toBeTruthy();
  });

  it('Under a level selection in the Title popover, MarkdownToolbar must insert heading syntax', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Section title' } });
    textarea.focus();
    textarea.setSelectionRange(0, 0);

    fireEvent.click(screen.getByRole('button', { name: 'Heading' }));
    fireEvent.click(screen.getByRole('button', { name: 'Heading 2' }));

    await waitFor(() => {
      expect(textarea.value).toBe('## Section title');
    });
  });

  it('Under a level selection in the Toggle popover, MarkdownToolbar must insert toggle syntax', async () => {
    render(<ToolbarHarness />);

    const textarea = screen.getByRole('textbox', { name: 'Content input' }) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Toggle content' } });
    textarea.focus();
    textarea.setSelectionRange(0, textarea.value.length);

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'Toggle Heading 3' }));

    await waitFor(() => {
      expect(textarea.value).toBe(':::toggle ### Toggle content\nContent\n:::');
    });
  });

  it('Under a host toolbar UI registry, MarkdownToolbar must expose the custom popover labels as provided', async () => {
    render(<ToolbarWithCustomUiRegistryHarness />);

    const headingTrigger = screen.getByRole('button', { name: 'Heading' });
    fireEvent.focus(headingTrigger);

    expect(await screen.findByRole('tooltip', { name: 'Heading' })).toBeTruthy();

    fireEvent.click(headingTrigger);

    expect(await screen.findByText('Choose custom title')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Add link' }));

    expect(await screen.findByText('Custom link panel')).toBeTruthy();
  });

  it('Under a custom primitive registry, MarkdownToolbar must pass the override to toolbar actions', () => {
    const textareaRef = React.createRef<HTMLTextAreaElement>();
    const HostButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
      (props, ref) => <Button {...props} data-primitive="custom-button" ref={ref} />,
    );
    HostButton.displayName = 'HostButton';

    render(
      <MarkdownToolbar
        contentType="article"
        onChange={() => {}}
        primitiveRegistry={{ Button: HostButton }}
        textareaRef={textareaRef}
      />,
    );

    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'data-primitive',
      'custom-button',
    );
  });
});
