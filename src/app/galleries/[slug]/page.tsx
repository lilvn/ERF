import { GalleryView } from '@/components/Gallery/GalleryView';
import { notFound } from 'next/navigation';

export default async function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === '3rd-story') {
    return <GalleryView modelPath="/Galleries/3rd Story/3rd Story.glb" />;
  }

  return notFound();
}
