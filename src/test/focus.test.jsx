import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from '../App';
import React from 'react';

// Mock localStorage and sessionStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const sessionStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

test('Focus should stay on input after typing', async () => {
    // 1. Login
    localStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('encryptionKey', 'komi3386');
    sessionStorage.setItem('userRole', 'admin');

    // 2. Render App in Edit view
    window.location.hash = '#edit/12345';
    render(<App />);

    // Wait for Edit view to load
    await waitFor(() => expect(screen.getByText(/작성 중/)).toBeInTheDocument());

    // 3. Find Customer Name input
    const nameInput = screen.getByLabelText(/고객명/i);
    nameInput.focus();
    expect(document.activeElement).toBe(nameInput);

    // 4. Type a character
    fireEvent.change(nameInput, { target: { value: '홍' } });

    // 5. Verify focus is still there
    expect(document.activeElement).toBe(nameInput);

    // 6. Type another character
    fireEvent.change(nameInput, { target: { value: '홍길' } });
    expect(document.activeElement).toBe(nameInput);
});
