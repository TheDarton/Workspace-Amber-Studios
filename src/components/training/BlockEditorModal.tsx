import { useState, useEffect } from 'react';
import { X, Video, FileText, AlertCircle } from 'lucide-react';
import { ContentBlock, parseOneDriveUrl, generateBlockId } from '../../lib/trainingService';

interface BlockEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: ContentBlock) => void;
  blockType: 'video' | 'text' | 'video-text';
  existingBlock?: ContentBlock;
}

export function BlockEditorModal({
  isOpen,
  onClose,
  onSave,
  blockType,
  existingBlock,
}: BlockEditorModalProps) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBlock) {
      setTitle(existingBlock.title);
      if (existingBlock.type === 'video' || existingBlock.type === 'video-text') {
        setVideoUrl(existingBlock.videoUrl);
      }
      if (existingBlock.type === 'text' || existingBlock.type === 'video-text') {
        setText(existingBlock.text);
      }
    } else {
      setTitle('');
      setVideoUrl('');
      setText('');
    }
    setError(null);
  }, [existingBlock, isOpen]);

  const handleSave = () => {
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (blockType === 'video' || blockType === 'video-text') {
      if (!videoUrl.trim()) {
        setError('Video URL is required');
        return;
      }

      const embedUrl = parseOneDriveUrl(videoUrl);
      if (!embedUrl) {
        setError('Invalid URL. Please use a valid OneDrive or Azure/SharePoint share link.');
        return;
      }
    }

    if (blockType === 'text' || blockType === 'video-text') {
      if (!text.trim()) {
        setError('Text content is required');
        return;
      }
    }

    let block: ContentBlock;

    if (blockType === 'video') {
      block = {
        id: existingBlock?.id || generateBlockId(),
        type: 'video',
        title: title.trim(),
        videoUrl: videoUrl.trim(),
      };
    } else if (blockType === 'text') {
      block = {
        id: existingBlock?.id || generateBlockId(),
        type: 'text',
        title: title.trim(),
        text: text.trim(),
      };
    } else {
      block = {
        id: existingBlock?.id || generateBlockId(),
        type: 'video-text',
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        text: text.trim(),
      };
    }

    onSave(block);
    onClose();
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    const action = existingBlock ? 'Edit' : 'Add';
    if (blockType === 'video') return `${action} Video Block`;
    if (blockType === 'text') return `${action} Text Block`;
    return `${action} Video + Text Block`;
  };

  const embedUrl = videoUrl ? parseOneDriveUrl(videoUrl) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-20 font-bold text-gray-900">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-14">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-14 font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a custom title for this content"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
            />
          </div>

          {(blockType === 'video' || blockType === 'video-text') && (
            <div>
              <label className="block text-14 font-medium text-gray-700 mb-2">
                OneDrive Video URL *
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://onedrive.live.com/... or Azure/SharePoint link"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500]"
              />
              <p className="text-12 text-gray-500 mt-1">
                Paste a OneDrive or Azure/SharePoint share link for your video
              </p>

              {videoUrl && embedUrl && (
                <div className="mt-4">
                  <p className="text-13 font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="relative w-full rounded-lg overflow-hidden border border-gray-200" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={embedUrl}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      scrolling="no"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {videoUrl && !embedUrl && (
                <div className="mt-3 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-13">Invalid URL format. Please use OneDrive or Azure/SharePoint share link</span>
                </div>
              )}
            </div>
          )}

          {(blockType === 'text' || blockType === 'video-text') && (
            <div>
              <label className="block text-14 font-medium text-gray-700 mb-2">
                {blockType === 'video-text' ? 'Description / Comment *' : 'Text Content *'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text content here..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA500] resize-none"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#FFA500] hover:bg-[#FF8C00] text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {blockType === 'text' ? <FileText className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            {existingBlock ? 'Update' : 'Add'} Block
          </button>
        </div>
      </div>
    </div>
  );
}
