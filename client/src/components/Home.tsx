import { useEffect, useState } from 'react';
import PostCard from './PostCard/PostCard';
import NewThreadCard from './PostCard/NewThreadCard';
import { getPow } from '../utils/mine';
import { Event } from 'nostr-tools';
import { subGlobalFeed } from '../utils/subscriptions';
import { uniqBy } from '../utils/utils';

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const onEvent = (event: Event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  useEffect(() => {
    subGlobalFeed(onEvent);
    // If you eventually need a cleanup function, put it here
  }, []);

  const uniqEvents = events.length > 0 ? uniqBy(events, "id") : [];
  
  const filteredAndSortedEvents = uniqEvents
    .filter(event => 
      getPow(event.id) > 5 &&
      event.kind === 1 &&
      !event.tags.some(tag => tag[0] === 'p')
    )
    .sort((a, b) => (b.created_at as any) - (a.created_at as any));

  
  const getMetadataEvent = (event: Event) => {
    const metadataEvent = uniqEvents.find(e => e.pubkey === event.pubkey && e.kind === 0);
    if (metadataEvent) {
      return metadataEvent;
    }
    return null;
  }

  const countReplies = (event: Event) => {
    return uniqEvents.filter(e => e.tags.some(tag => tag[0] === 'e' && tag[1] === event.id)).length;
  }

  const [messageFromWorker, setMessageFromWorker] = useState('');

  useEffect(() => {
    const worker = new Worker(new URL('../myWorker', import.meta.url));

    worker.onmessage = (event) => {
      setMessageFromWorker(event.data);
    };

    worker.postMessage('Start worker');
    return () => {
      worker.terminate();
    };
  }, []);

  return (
    <main className="bg-black text-white min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <NewThreadCard />
        <p>Message from worker: {messageFromWorker}</p>
        {filteredAndSortedEvents.map((event, index) => (
          <PostCard key={event.id} event={event} metadata={getMetadataEvent(event)} replyCount={countReplies(event)}/>
        ))}
      </div>
    </main>
  );
};

export default Home;
