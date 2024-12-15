import Checkout from '#/components/checkout/checkout';

export default async function CheckoutPage(props: {
  params: Record<string, string>;
  searchParams: Promise<{
    success?: string;
    cancel?: string;
  }>;
}) {
  const params = await props.searchParams;

  return (
    <article className='flex h-full w-full flex-col'>
      <Checkout
        success={params['success'] ?? null}
        cancel={params['cancel'] ?? null}
      />
    </article>
  );
}
