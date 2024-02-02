import { useState } from 'react';

export default function useFetch() {
  const [isLoading, setIsLoading] = useState(false);

  async function fetchWrapper<T>(
    url: string,
    // eslint-disable-next-line no-undef
    options: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  ): Promise<T> {
    const internalUrl = url.startsWith('/')
      ? process.env.NEXT_PUBLIC_APP_LOCAL_HREF + url
      : url;

    setIsLoading(true);

    const response = await fetch(internalUrl, { ...options });
    const data = await response.json();

    setIsLoading(false);

    return data;
  }

  return { fetch: fetchWrapper, isLoading };
}
