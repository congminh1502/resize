import { supabase } from './supabaseClient';
import { Preset } from './types';

// Supabase table name
const TABLE_NAME = 'shared_presets';

export async function fetchSharedPresets(): Promise<Preset[]> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching shared presets:', error);
        return [];
    }

    if (!data) return [];

    // Map database rows to Preset objects
    return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: 'shared', // Explicitly set type to shared
        outputs: row.outputs,
        sourceBlocks: row.source_blocks, // Map snake_case back to camelCase
        authorName: row.author_name,     // Map snake_case back to camelCase
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    }));
}

export async function saveSharedPreset(preset: Omit<Preset, 'id' | 'type'>, authorName: string): Promise<Preset | null> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([{
            name: preset.name,
            author_name: authorName,
            outputs: preset.outputs,
            source_blocks: preset.sourceBlocks,
        }])
        .select();

    if (error) {
        console.error('Error saving shared preset:', error);
        return null;
    }

    if (!data || data.length === 0) return null;

    const row = data[0];
    return {
        id: row.id,
        name: row.name,
        type: 'shared',
        outputs: row.outputs,
        sourceBlocks: row.source_blocks,
        authorName: row.author_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function updateSharedPreset(id: string, preset: Partial<Preset>, authorName: string): Promise<Preset | null> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({
            name: preset.name,
            author_name: authorName,
            outputs: preset.outputs,
            source_blocks: preset.sourceBlocks,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error updating shared preset:', error);
        return null;
    }

    if (!data || data.length === 0) return null;

    const row = data[0];
    return {
        id: row.id,
        name: row.name,
        type: 'shared',
        outputs: row.outputs,
        sourceBlocks: row.source_blocks,
        authorName: row.author_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function deleteSharedPreset(id: string): Promise<boolean> {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting shared preset:', error);
        return false;
    }

    return true;
}
