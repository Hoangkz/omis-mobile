import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * A hook that returns a stable callback reference which always calls the latest version of the handler (similar to useEffectEvent in React 19.2)
 */
export function useEffectEvent<T extends (...args: never[]) => unknown>(handler: T): T {
    const handlerRef = useRef<T>(handler);

    useLayoutEffect(() => {
        handlerRef.current = handler;
    });

    return useCallback(((...args) => {
        const fn = handlerRef.current;
        return fn(...args);
    }) as T, []);
}