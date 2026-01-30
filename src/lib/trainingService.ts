import { supabase } from './supabase';

export interface VideoBlock {
  id: string;
  type: 'video';
  title: string;
  videoUrl: string;
}

export interface TextBlock {
  id: string;
  type: 'text';
  title: string;
  text: string;
}

export interface VideoTextBlock {
  id: string;
  type: 'video-text';
  title: string;
  videoUrl: string;
  text: string;
}

export type ContentBlock = VideoBlock | TextBlock | VideoTextBlock;

export interface Category {
  id: string;
  name: string;
  collapsed: boolean;
  blocks: ContentBlock[];
}

export interface TrainingMaterial {
  id: string;
  country_id: string;
  type: 'dealer' | 'sm';
  title: string;
  content: {
    categories: Category[];
  };
  order_index: number;
  created_at: string;
}

export async function fetchTrainingMaterials(
  countryId: string,
  type: 'dealer' | 'sm'
): Promise<TrainingMaterial[]> {
  const { data, error } = await supabase
    .from('training_materials')
    .select('*')
    .eq('country_id', countryId)
    .eq('type', type)
    .order('order_index');

  if (error) throw error;
  return data || [];
}

export async function createTrainingMaterial(
  countryId: string,
  type: 'dealer' | 'sm',
  title: string
): Promise<TrainingMaterial> {
  const { data, error } = await supabase
    .from('training_materials')
    .insert({
      country_id: countryId,
      type,
      title,
      content: { categories: [] },
      order_index: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrainingMaterialContent(
  materialId: string,
  content: { categories: Category[] }
): Promise<void> {
  const { error } = await supabase
    .from('training_materials')
    .update({ content })
    .eq('id', materialId);

  if (error) throw error;
}

export async function deleteTrainingMaterial(materialId: string): Promise<void> {
  const { error } = await supabase
    .from('training_materials')
    .delete()
    .eq('id', materialId);

  if (error) throw error;
}

export function parseOneDriveUrl(url: string): string | null {
  try {
    // Support personal OneDrive, short links, and corporate/Azure OneDrive (SharePoint)
    const isOneDrive = url.includes('onedrive.live.com') ||
                       url.includes('1drv.ms') ||
                       url.includes('sharepoint.com') ||
                       url.includes('-my.sharepoint.com');

    if (!isOneDrive) {
      return null;
    }

    // If already an embed URL, return as is
    if (url.includes('embed?') || url.includes('embed.aspx')) {
      return url;
    }

    // Convert view URL to embed URL for various formats
    let embedUrl = url
      .replace('/view.aspx?', '/embed?')
      .replace('?web=1', '')
      .replace('/view?', '/embed?');

    // For SharePoint URLs, ensure proper embed format
    if (url.includes('sharepoint.com')) {
      // If it has resid parameter, it's likely already embeddable
      if (url.includes('resid=') || url.includes('embed')) {
        return embedUrl;
      }
      // Convert standard SharePoint share link to embed
      embedUrl = embedUrl.replace('/:v:/', '/:e:/');
    }

    return embedUrl;
  } catch {
    return null;
  }
}

export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCategoryId(): string {
  return `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
