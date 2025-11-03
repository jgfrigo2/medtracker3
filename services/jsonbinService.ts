
import type { AppState } from '../types';

const BASE_URL = 'https://api.jsonbin.io/v3/b';

export const getJsonBin = async (apiKey: string, binId: string): Promise<AppState> => {
    const response = await fetch(`${BASE_URL}/${binId}/latest`, {
        method: 'GET',
        headers: {
            'X-Master-Key': apiKey,
        },
    });

    if (!response.ok) {
        throw new Error(`Error al cargar datos: ${response.statusText}`);
    }
    const data = await response.json();
    return data.record;
};

export const updateJsonBin = async (apiKey: string, binId: string, data: AppState): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${binId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': apiKey,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Error al guardar datos: ${response.statusText}`);
    }
};
