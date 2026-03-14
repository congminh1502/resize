import { supabase } from './supabaseClient';
import { SizePreset } from './types';

// Supabase table name
const TABLE_NAME = 'block_resize_presets';

export async function fetchBlockPresets(): Promise<SizePreset[]> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching block presets:', error);
        return [];
    }

    if (!data) return [];

    // Map database rows to SizePreset objects
    return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: 'shared', // Explicitly set type to shared for now
        sizes: row.sizes,
        authorName: row.author_name, // Map snake_case back to camelCase
    }));
}

export async function saveBlockPreset(name: string, authorName: string, sizes: any[]): Promise<SizePreset | null> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert([{
            name: name,
            author_name: authorName,
            sizes: sizes,
        }])
        .select();

    if (error) {
        console.error('Error saving block preset:', error);
        return null;
    }

    if (!data || data.length === 0) return null;

    const row = data[0];
    return {
        id: row.id,
        name: row.name,
        type: 'shared',
        sizes: row.sizes,
        authorName: row.author_name,
    };
}

export async function updateBlockPreset(id: string, name: string, authorName: string, sizes: any[]): Promise<SizePreset | null> {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({
            name: name,
            author_name: authorName,
            sizes: sizes,
        })
        .eq('id', id)
        .select();

    if (error) {
        console.error('Error updating block preset:', error);
        return null;
    }

    if (!data || data.length === 0) return null;

    const row = data[0];
    return {
        id: row.id,
        name: row.name,
        type: 'shared',
        sizes: row.sizes,
        authorName: row.author_name,
    };
}

export async function deleteBlockPreset(id: string): Promise<boolean> {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting block preset:', error);
        return false;
    }

    return true;
}
