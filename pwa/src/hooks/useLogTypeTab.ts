import type { UseLogTypeTabOptions } from '../lib/logTypeTabTypes';
import { useLogTypeTabFormState } from './useLogTypeTabFormState';
import { useLogTypeTabHandlers } from './useLogTypeTabHandlers';

export type { UseLogTypeTabOptions } from '../lib/logTypeTabTypes';

export function useLogTypeTab(options: UseLogTypeTabOptions) {
  const form = useLogTypeTabFormState();
  const handlers = useLogTypeTabHandlers(options, form);

  return {
    ...form,
    ...handlers,
  };
}
