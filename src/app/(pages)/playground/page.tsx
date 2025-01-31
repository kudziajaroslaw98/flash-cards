'use client';

import ProgressBar from '#/components/_ui/progress-bar/progress-bar';
import TagInput from '#/components/_ui/tag-input/tag-input';
import RetentionHeatmap from '#/components/retention-heatmap/retention-heatmap';
import { useState, type ChangeEvent } from 'react';

export default function PlaygroundPage() {
  const [message, setMessage] = useState(
    'Can you add a new flashcard of word "Undisturbed" for me?',
  );

  const handleOnClick = async () => {
    const fetchRes = await fetch(
      'https://n8n-hc0sc0wskgo4cckgck8ks8ss.finalphase.app/webhook-test/8621c23c-7562-488f-9944-8a78f88e3124',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userUuid: 'f7097d35-8885-4587-8d28-3ace4cd1b699',
          message: message,
          dateNow: new Date().toISOString(),
        }),
      },
    );

    if (fetchRes.ok) {
      console.log('Success!');
    }
  };

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  return (
    <>
      <div>
        <textarea
          value={message}
          rows={10}
          cols={50}
          onChange={handleOnChange}
        />
        <button onClick={handleOnClick}>Click me</button>
      </div>

      <div className='mt-20'>
        <TagInput
          type='tags'
          valid={true}
        />
      </div>

      <div className='mt-20'>
        <ProgressBar
          value={40}
          max={100}
        />
      </div>

      <RetentionHeatmap />
    </>
  );
}
