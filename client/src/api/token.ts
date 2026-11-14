import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from 'src/App';

import { mediaTrackerApi } from 'src/api/api';

export const useTokens = () => {
  const { isLoading, error, data } = useQuery({
    queryKey: ['tokens'],
    queryFn: () => mediaTrackerApi.tokens.get(),
  });

  const addTokenMutation = useMutation({
    mutationFn: (data: Parameters<typeof mediaTrackerApi.tokens.add>[0]) =>
      mediaTrackerApi.tokens.add(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });

  const removeTokenMutation = useMutation({
    mutationFn: (data: Parameters<typeof mediaTrackerApi.tokens.delete>[0]) =>
      mediaTrackerApi.tokens.delete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    },
  });

  return {
    isLoading: isLoading,
    error: error,
    tokens: data,
    addToken: addTokenMutation.mutateAsync,
    removeToken: removeTokenMutation.mutateAsync,
  };
};
