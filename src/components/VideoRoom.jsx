import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';

const APP_ID = '5388acc1e7114859b4ad7082d5c2e676';
const TOKEN = '007eJxTYLjcdof79ZvQj4e83Fk5Ew8+uNf4feFGjdNV/mXqNSsd1D8oMJgaW1gkJicbppobGppYmFommSSmmBtYGKWYJhulmpmb3V+Wl9EQyMhQzefFxMgAgSA+M0N5ShYDAwCtUCAI';
const CHANNEL = 'wdj';

const client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      setUsers((prevUsers) => [...prevUsers, user]);
    }

    if (mediaType === 'audio') {
      user.audioTrack?.play();
    }
  };

  const handleUserLeft = (user) => {
    setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
  };

  useEffect(() => {
    const init = async () => {
      client.on('user-published', handleUserJoined);
      client.on('user-left', handleUserLeft);

      const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

      setLocalTracks([audioTrack, videoTrack]);

      setUsers((prevUsers) => [
        ...prevUsers,
        {
          uid,
          videoTrack,
          audioTrack,
        },
      ]);

      videoTrack.play(`local-player-${uid}`); // Optional: play in specific div
      audioTrack.play(); // Play local audio (for testing or feedback)

      await client.publish([audioTrack, videoTrack]);
    };

    init();

    return () => {
      client.removeAllListeners();
      localTracks.forEach((track) => {
        track.stop();
        track.close();
      });

      client.leave();
    };
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 200px)', gap: '10px' }}>
        {users.map((user) => (
          <VideoPlayer key={user.uid} user={user} />
        ))}
      </div>
    </div>
  );
};

