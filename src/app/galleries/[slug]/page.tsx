import { GalleryView } from '@/components/Gallery/GalleryView';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const galleryData: Record<string, { name: string; description: string; modelPath: string }> = {
  '3rd-story': {
    name: '3rd Floor Gallery',
    description: 'Explore the 3rd floor gallery space in immersive 3D',
    modelPath: '/Galleries/3rd Story/3rd Story.glb',
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const gallery = galleryData[slug];
  
  if (!gallery) {
    return {
      title: 'Gallery Not Found | ERF WORLD',
    };
  }

  return {
    title: `${gallery.name} | ERF WORLD`,
    description: gallery.description,
  };
}

export default async function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const gallery = galleryData[slug];

  if (!gallery) {
    return notFound();
  }

  return <GalleryView modelPath={gallery.modelPath} />;
}
