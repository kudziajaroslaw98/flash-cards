import { ArrowRight } from 'lucide-react';
import type { RefObject } from 'react';
import { Accordion } from '../_ui/accordion/accordion';
import { ShortcutList } from '../shortcut-list/shortcut-list';
import { ReviseSession } from './revise-session';

export function SessionInfo({
  totalCards,
  recalled,
  reviewed,
  timerStart,
}: {
  totalCards: number;
  recalled: number;
  reviewed: number;
  timerStart: RefObject<Date | null>;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <ReviseSession
        totalCards={totalCards}
        recalled={recalled}
        reviewed={reviewed}
        timerStart={timerStart}
      />

      <Accordion className='hidden md:grid'>
        <Accordion.Item title='Shortcuts'>
          <ShortcutList
            className='hidden md:flex md:flex-col md:items-center'
            shortcuts={[
              {
                name: 'Confirm / Reshuffle',
                keys: [
                  'Space',
                  <ArrowRight
                    key='ArrowRight'
                    className='size-4'
                  />,
                ],
              },
              {
                name: 'Answer 1 - 4',
                keys: ['1', '2', '3', '4'],
              },
            ]}
          />
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
