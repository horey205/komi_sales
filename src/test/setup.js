import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase
vi.mock('../utils/supabaseClient', () => ({
    supabase: {
        from: () => ({
            select: () => ({ order: () => Promise.resolve({ data: [], error: null }) }),
            upsert: () => Promise.resolve({ error: null }),
            on: () => ({ subscribe: () => ({ unsubscribe: () => { } }) }),
            channel: () => ({ on: () => ({ subscribe: () => { } }) }),
        }),
        channel: () => ({ on: () => ({ on: () => ({ on: () => ({ subscribe: () => { } }) }) }) }),
        removeChannel: () => { },
    },
}));
