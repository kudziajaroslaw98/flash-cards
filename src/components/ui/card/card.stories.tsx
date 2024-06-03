import type { Meta, StoryObj } from '@storybook/react';
import Card from './card.component';

const meta: Meta<typeof Card> = {
  component: Card,
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<typeof Card>;

export const CardStory: Story = {
  args: {
    children: (
      <>
        <h5
          className={`text-default z-20 flex w-full items-center rounded-md sm:min-h-10 sm:items-start`}
        >
          Revised Word
        </h5>

        <p
          className={`text-default z-20 flex w-full min-w-72 items-center rounded-md text-sm sm:min-h-16 sm:items-start`}
        >
          Revised definition of the word above
        </p>
      </>
    ),
    className: 'max-w-80',
  },
};
