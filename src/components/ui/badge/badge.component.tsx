const Badge = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className='inline-flex items-center rounded-full border border-green-400 px-4 py-1 text-xs font-semibold text-green-400'>
      {children}
    </span>
  );
};

Badge.defaultName = 'Badge';

export default Badge;
