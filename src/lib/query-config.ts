import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const CURRENT_USER_KEY = '@current_user_id';

export async function getCurrentUserId(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(CURRENT_USER_KEY);
    } catch (error) {
        console.error('Error getting current user ID:', error);
        return null;
    }
}

export async function setCurrentUserId(userId: string): Promise<void> {
    try {
        await AsyncStorage.setItem(CURRENT_USER_KEY, userId);
    } catch (error) {
        console.error('Error setting current user ID:', error);
    }
}

export async function clearCurrentUserId(queryClient: QueryClient): Promise<void> {
    try {
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
        queryClient.clear();
        await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
    } catch (error) {
        console.error('Error clearing current user ID:', error);
    }
}

export async function checkAndClearCacheIfUserChanged(queryClient: QueryClient, newUserId: string): Promise<void> {
    try {
        const currentUserId = await getCurrentUserId();

        // If user changed, clear all cache
        if (currentUserId && currentUserId !== newUserId) {
            queryClient.clear();
            await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
        }

        // Update current user ID
        await setCurrentUserId(newUserId);
    } catch (error) {
        console.error('Error checking and clearing cache:', error);
    }
}

export function makeQueryClient() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: 2, // retry up to 2 times
                refetchOnWindowFocus: false, // do not refetch when switching tabs
                refetchOnReconnect: true, // refetch when reconnecting to the network
                staleTime: 1000 * 60, // 1 minute -> consider data "fresh"
                gcTime: 1000 * 60 , // 1m -> garbage collect unused data
            },
        },
        queryCache: new QueryCache({
            onError: (error, query) => {
                console.error(`Error in query [${query.queryHash}]:`, error);
            },
        }),
    });

    const asyncStoragePersister = createAsyncStoragePersister({
        storage: AsyncStorage,
        serialize: (client) => {
            const newClient = {
                ...client,
                clientState: {
                    ...client.clientState,
                    queries: client.clientState.queries.map((query) => {
                        // Truncate infinite queries to save storage space
                        if (query.meta?.persist === true) {
                            const data = query.state.data as Record<string, unknown>;
                            // Limit to first 2 pages (approx 10-20 messages depending on page size)
                            if (data && Array.isArray(data.pages) && data.pages.length > 2) {
                                return {
                                    ...query,
                                    state: {
                                        ...query.state,
                                        data: {
                                            ...data,
                                            pages: data.pages.slice(0, 2),
                                            pageParams: (data.pageParams as string[]).slice(0, 2),
                                        },
                                    },
                                };
                            }
                        }
                        return query;
                    }),
                }
            };
            return JSON.stringify(newClient);
        },
    });

    persistQueryClient({
        queryClient: queryClient,
        persister: asyncStoragePersister,
        dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
                // Only persist queries that explicitly opt-in
                return query.meta?.persist === true;
            },
        },
    });

    return queryClient;
}
