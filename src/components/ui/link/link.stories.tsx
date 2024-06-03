import { Bars3Icon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react';
import LinkComponent from './link.component';

const meta: Meta<typeof LinkComponent> = {
  component: LinkComponent,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof LinkComponent>;

export const LinkComponentStory: Story = {
  args: {
    label: 'Link',
    href: 'http://localhost:6006',
    icon: <Bars3Icon className='h-4 w-4' />,
    className: 'text-green-400',
  },
};
