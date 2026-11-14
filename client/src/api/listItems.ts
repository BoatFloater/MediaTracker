import { useQuery } from '@tanstack/react-query';
import { mediaTrackerApi } from 'src/api/api';
import { queryClient } from 'src/App';

export const useListItems = (args: { listId: number }) => {
  const { listId } = args;

  const key = ['listItems', listId];

  const { data, isLoading, isError } = useQuery({
    queryKey: key,
    queryFn: () => mediaTrackerApi.list.getListItems({ listId: listId }),
  });

  return {
    listItems: data,
    isLoading,
    isError,
    invalidateListItemsQuery: () =>
      queryClient.invalidateQueries({ queryKey: key }),
  };
};
