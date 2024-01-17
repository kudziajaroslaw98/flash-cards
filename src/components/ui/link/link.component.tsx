'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';


export interface LinkParams {
  href: string;
  label: string;
}

export default function LinkComponent(params: LinkParams) {
  const pathname = usePathname();
  const [ isCurrentPage, setIsCurrentPage ] = useState(false);

  useEffect(() => {
    setIsCurrentPage(pathname === params.href);
  }, [ pathname, params.href ]);

  return <Link
    className={ `text-green-500 transition-all underline-offset-2 hover:text-green-400 ${ isCurrentPage ? 'underline decoration-2 hover:underline-offset-4' : '' }` }
    href={ params.href }
  >
    { params.label }
  </Link>;
}
