import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';

const APP_ID = '86d24524d7e74010a5db49032a886241';
const TOKEN =
  '007eJxTYJgjaXfs/t5nqq73fhcdcs4+uCz86MJ6nlDX4rBf/889uPZPgcHCLMXIxNTIJMU81dzEwNAg0TQlycTSwNgo0cLCzMjE8HNmcUZDICODj4MrMyMDBIL4zAzlKVkMDAD1liD0';
const CHANNEL = 'wdj';

const client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});

export const VideoRoom = () => {
  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // ✅ Added speaker state

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

      videoTrack.play(`local-player-${uid}`);
      audioTrack.play();

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

  // Toggle camera
  const toggleCamera = () => {
    if (localTracks[1]) {
      localTracks[1].setEnabled(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  };

  // Toggle microphone
  const toggleMic = () => {
    if (localTracks[0]) {
      localTracks[0].setEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  // ✅ Toggle speaker (remote users' audio)
  const toggleSpeaker = () => {
    users.forEach((user) => {
      if (user.audioTrack) {
        user.audioTrack.setEnabled(!isSpeakerOn);
      }
    });
    setIsSpeakerOn(!isSpeakerOn);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={toggleCamera} style={{ marginRight: '10px',backgroundColor:'lightyellow' }}>
          {isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
        </button>
        <button onClick={toggleMic} style={{ marginRight: '10px',backgroundColor:"lightyellow" }}>
          {isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
        </button>
        <button onClick={toggleSpeaker}style={{ marginRight: '10px',backgroundColor:"lightyellow" }>
          {isSpeakerOn ? 'Mute Speaker' : 'Unmute Speaker'}
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 200px)',
            gap: '10px',
          }}
        >
          {users.map((user) => (
            <VideoPlayer key={user.uid} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
};
