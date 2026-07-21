import React, { useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { FAB } from '../buttons/FAB';
import { Button } from '../buttons/Button';
import { cn } from '../../../lib/utils';

export interface ImageUploadProps {
  label?: string;
  onImageCaptured?: (file: File, altText: string) => void;
  previewUrl?: string;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label = 'Capture Evidence Photo',
  onImageCaptured,
  previewUrl,
  className,
}) => {
  const [image, setImage] = useState<string | null>(previewUrl || null);
  const [altText, setAltText] = useState('');
  const [fileObj, setFileObj] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setFileObj(file);
      const url = URL.createObjectURL(file);
      setImage(url);
      const defaultAlt = `Civic evidence photo taken ${new Date().toLocaleTimeString()}`;
      setAltText(defaultAlt);
      onImageCaptured?.(file, defaultAlt);
    }
  };

  const handleRetake = () => {
    setImage(null);
    setFileObj(null);
    setAltText('');
  };

  return (
    <div className={cn('w-full font-sans space-y-3', className)}>
      <label className="block text-sm font-medium text-neutral-900 select-none">
        {label}
      </label>

      <div className="p-2.5 bg-primary-500/10 border border-primary-500/20 rounded-md flex items-center gap-2 text-xs text-primary-900">
        <ShieldCheck className="w-4 h-4 text-primary-700 shrink-0" aria-hidden="true" />
        <span>
          <strong>EXIF Privacy Protection:</strong> GPS metadata & camera serial numbers are automatically stripped before dispatch.
        </span>
      </div>

      {!image ? (
        <div className="flex flex-col items-center justify-center p-8 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-lg text-center space-y-4">
          <label className="cursor-pointer flex flex-col items-center">
            <FAB isShutter label="Take Evidence Photo" />
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
          <span className="text-xs text-neutral-700 font-medium">
            Tap shutter button (72×72px) to launch camera or upload photo
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden border border-neutral-200 aspect-video bg-neutral-900 flex items-center justify-center">
            <img src={image} alt={altText || 'Evidence preview'} className="object-contain max-h-full w-full" />
            <div className="absolute top-2 right-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRetake}
                leadingIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retake Photo
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="img-alt" className="block text-xs font-medium text-neutral-900 mb-1">
              Accessibility Alt Text Description (Required for visual evidence)
            </label>
            <input
              id="img-alt"
              type="text"
              value={altText}
              onChange={(e) => {
                setAltText(e.target.value);
                if (fileObj) onImageCaptured?.(fileObj, e.target.value);
              }}
              placeholder="Describe evidence photo (e.g., Damaged road surface near main intersection)"
              className="w-full min-h-[44px] px-3 text-sm border border-neutral-200 rounded-md font-sans focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
