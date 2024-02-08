import { useToastContext } from '#/providers/toast-provider.component';
import isApiResponse from '#/shared/guards/is-api-response.guard';
import { useState } from 'react';

type UseFetchProps = {
  showToastOnError?: boolean;
};

export default function useFetch(props?: UseFetchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { show } = useToastContext();

  async function fetchWrapper<T>(
    url: string,
    // eslint-disable-next-line no-undef
    options: RequestInit,
  ): Promise<T> {
    const internalUrl = url.startsWith('/')
      ? process.env.NEXT_PUBLIC_APP_LOCAL_HREF + url
      : url;

    const initialOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    setIsLoading(true);

    const data = await fetch(internalUrl, { ...initialOptions, ...options })
      .then((res) => res.json())
      .catch((error) => {
        if (error && props?.showToastOnError) {
          show({
            timeInSeconds: 10,
            title:
              'There was problem with request. Wait a moment and try again.',
            type: 'error',
          });
        }
      });

    setIsLoading(false);

    if (
      isApiResponse(data) &&
      !data.success &&
      data.error &&
      props?.showToastOnError
    ) {
      show({
        timeInSeconds: 10,
        title: data.error,
        type: 'error',
      });
    }

    return data;
  }

  return { fetch: fetchWrapper, isLoading };
}
