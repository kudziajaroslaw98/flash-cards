import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className='flex h-full w-full items-center justify-center p-8'>
      <LoaderCircle className='size-12 animate-spin text-green-500' />
    </div>
  );
}
