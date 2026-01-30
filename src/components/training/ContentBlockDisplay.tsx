import { ContentBlock, parseOneDriveUrl } from '../../lib/trainingService';
import { Video, FileText, AlertCircle } from 'lucide-react';

interface ContentBlockDisplayProps {
  block: ContentBlock;
}

export function ContentBlockDisplay({ block }: ContentBlockDisplayProps) {
  if (block.type === 'text') {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-[#FFA500]" />
          <h4 className="text-15 font-semibold text-gray-900">{block.title}</h4>
        </div>
        <div className="text-14 text-gray-700 whitespace-pre-wrap">{block.text}</div>
      </div>
    );
  }

  if (block.type === 'video') {
    const embedUrl = parseOneDriveUrl(block.videoUrl);

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Video className="w-5 h-5 text-[#FFA500]" />
          <h4 className="text-15 font-semibold text-gray-900">{block.title}</h4>
        </div>
        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-14">Invalid video URL</span>
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'video-text') {
    const embedUrl = parseOneDriveUrl(block.videoUrl);

    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-[#FFA500]" />
          <h4 className="text-15 font-semibold text-gray-900">{block.title}</h4>
        </div>

        {embedUrl ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-14">Invalid video URL</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <div className="text-14 text-gray-700 whitespace-pre-wrap">{block.text}</div>
        </div>
      </div>
    );
  }

  return null;
}
