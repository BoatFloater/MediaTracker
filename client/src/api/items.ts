import { keepPreviousData, useQuery, useMutation } from '@tanstack/react-query';

import { Items } from 'mediatracker-api';
import { mediaTrackerApi } from 'src/api/api';

export const useItems = (args: Items.Paginated.RequestQuery) => {
  const { error, data, isFetched } = useQuery({
    queryKey: ['items', args],
    queryFn: async () => mediaTrackerApi.items.paginated(args),
    placeholderData: keepPreviousData,
  });

  const search = useMutation({
    mutationFn: (query: string) =>
      mediaTrackerApi.search.search({ mediaType: args.mediaType, q: query }),
  });

  return {
    items: search.data ? search.data : data?.data,
    error: error,
    isLoading: !isFetched || search.isPending,
    numberOfPages: data ? data.totalPages : undefined,
    numberOfItemsTotal: data ? data.total : undefined,
    search: search.mutate,
  };
};
