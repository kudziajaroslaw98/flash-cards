import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className='flex h-screen w-full items-center justify-center'>
      <LoaderCircle className='size-12 animate-spin text-green-500' />
    </div>
  );
}
