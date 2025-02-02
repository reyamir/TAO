import { getLinkPreview } from 'link-preview-js';
import { useState, useEffect } from 'react';


const LinkModal = ({ url }: { url: string }) => {
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);

  useEffect(() => {
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    getLinkPreview(url)
      .then((preview) => setLinkPreview(preview as LinkPreview))
      .catch(error => {
        console.error("Error fetching original URL, trying with proxy:", error);
        return getLinkPreview(proxyUrl + url);
      })
      .then((preview) => setLinkPreview(preview as LinkPreview))
      .catch((error) => console.error("Error fetching URL with proxy:", error));
  }, [url]);

  if (!linkPreview) {
    return <a className='hover:underline text-xs text-neutral-500' href={url}>{url}</a>; // or some loading state
  }

  return (
    <div className="link-preview p-1 bg-neutral-800 rounded-lg border border-neutral-800">  
      <a href={linkPreview.url} target="_blank" rel="noopener noreferrer" className="">
        <img src={linkPreview.images[0]} alt={linkPreview.title} className="rounded-lg" />
        <div className="font-semibold text-xs text-gray-300">
          {linkPreview.title}
        </div>
      </a>
    </div>
  );
};

interface LinkPreview {
  url: string;
  title: string;
  siteName?: string;
  description?: string;
  mediaType: string;
  contentType?: string;
  images: string[];
  videos: {
    url?: string;
    secureUrl?: string;
    type?: string;
    width?: string;
    height?: string;
    [key: string]: any;
  }[];
  [key: string]: any;
}

export default LinkModal;