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

export function parseOneDriveUrl(input: string): string | null {
  try {
    const trimmedInput = input.trim();

    // Check if input is an iframe embed code
    if (trimmedInput.includes('<iframe') && trimmedInput.includes('</iframe>')) {
      const srcMatch = trimmedInput.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
      return null;
    }

    // Support personal OneDrive, short links, and corporate/Azure OneDrive (SharePoint)
    const isOneDrive = trimmedInput.includes('onedrive.live.com') ||
                       trimmedInput.includes('1drv.ms') ||
                       trimmedInput.includes('sharepoint.com') ||
                       trimmedInput.includes('-my.sharepoint.com');

    if (!isOneDrive) {
      return null;
    }

    // If already an embed URL, return as is
    if (trimmedInput.includes('embed?') || trimmedInput.includes('embed.aspx')) {
      return trimmedInput;
    }

    // Convert view URL to embed URL for various formats
    let embedUrl = trimmedInput
      .replace('/view.aspx?', '/embed?')
      .replace('?web=1', '')
      .replace('/view?', '/embed?');

    // For SharePoint URLs, ensure proper embed format
    if (trimmedInput.includes('sharepoint.com')) {
      // If it has resid parameter, it's likely already embeddable
      if (trimmedInput.includes('resid=') || trimmedInput.includes('embed')) {
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
