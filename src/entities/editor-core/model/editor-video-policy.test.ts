import {
  isAllowedEditorVideoExtension,
  isAllowedEditorVideoFile,
} from '@/entities/editor-core/model/editor-video-policy';

const makeFile = (name: string, type: string) => new File(['data'], name, { type });

describe('isAllowedEditorVideoExtension', () => {
  it('accepts allowed video extensions case-insensitively', () => {
    expect(isAllowedEditorVideoExtension('clip.MP4')).toBe(true);
    expect(isAllowedEditorVideoExtension('clip.webm')).toBe(true);
  });

  it('rejects disallowed or missing extensions', () => {
    expect(isAllowedEditorVideoExtension('clip.avi')).toBe(false);
    expect(isAllowedEditorVideoExtension('clip')).toBe(false);
  });
});

describe('isAllowedEditorVideoFile', () => {
  it('accepts a file with an allowed extension and matching mime type', () => {
    expect(isAllowedEditorVideoFile(makeFile('clip.mp4', 'video/mp4'))).toBe(true);
  });

  it('accepts application/octet-stream when the extension is allowed', () => {
    expect(isAllowedEditorVideoFile(makeFile('clip.mov', 'application/octet-stream'))).toBe(true);
  });

  it('accepts an empty mime type, trusting the extension', () => {
    expect(isAllowedEditorVideoFile(makeFile('clip.webm', ''))).toBe(true);
  });

  it('rejects a disallowed extension', () => {
    expect(isAllowedEditorVideoFile(makeFile('clip.avi', 'video/mp4'))).toBe(false);
  });

  it('rejects a mismatched mime type', () => {
    expect(isAllowedEditorVideoFile(makeFile('clip.mp4', 'image/png'))).toBe(false);
  });
});
