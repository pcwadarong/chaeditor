import {
  isAllowedEditorAttachmentExtension,
  isAllowedEditorAttachmentFile,
} from '@/entities/editor-core/model/editor-attachment-policy';

const makeFile = (name: string, type: string) => new File(['data'], name, { type });

describe('isAllowedEditorAttachmentExtension', () => {
  it('accepts allowed extensions case-insensitively', () => {
    expect(isAllowedEditorAttachmentExtension('report.PDF')).toBe(true);
    expect(isAllowedEditorAttachmentExtension('sheet.xlsx')).toBe(true);
  });

  it('rejects disallowed or missing extensions', () => {
    expect(isAllowedEditorAttachmentExtension('script.exe')).toBe(false);
    expect(isAllowedEditorAttachmentExtension('noext')).toBe(false);
    expect(isAllowedEditorAttachmentExtension('.hidden')).toBe(false);
  });
});

describe('isAllowedEditorAttachmentFile', () => {
  it('accepts a file with an allowed extension and matching mime type', () => {
    expect(isAllowedEditorAttachmentFile(makeFile('a.pdf', 'application/pdf'))).toBe(true);
  });

  it('accepts application/octet-stream when the extension is allowed', () => {
    // Windows browsers commonly report this generic type for valid files.
    expect(isAllowedEditorAttachmentFile(makeFile('a.hwp', 'application/octet-stream'))).toBe(true);
  });

  it('accepts an empty mime type, trusting the extension', () => {
    expect(isAllowedEditorAttachmentFile(makeFile('a.csv', ''))).toBe(true);
  });

  it('rejects a disallowed extension even with a generic mime type', () => {
    expect(isAllowedEditorAttachmentFile(makeFile('a.exe', 'application/octet-stream'))).toBe(
      false,
    );
  });

  it('rejects a mismatched mime type', () => {
    expect(isAllowedEditorAttachmentFile(makeFile('a.pdf', 'image/png'))).toBe(false);
  });

  it('rejects an empty file name', () => {
    expect(isAllowedEditorAttachmentFile(makeFile('   ', 'application/pdf'))).toBe(false);
  });
});
