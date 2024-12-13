'use client';

import { useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  // const { fetch } = useFetch();

  // useEffect(() => {
  //   if (searchParams.get('success') && !searchParams.get('cancel')) {
  //     fetch(`${process.env.NEXT_PUBLIC_APP_LOCAL_HREF}/api/checkout`, {
  //       method: 'GET',
  //     });
  //   }
  // }, []);

  return <>{searchParams.get('success') || searchParams.get('cancel')}</>;
}
