import React, { useEffect, useRef } from 'react';

export const VideoPlayer = ({ user }) => {
  const ref = useRef();

  useEffect(() => {
    if (user.videoTrack) {
      user.videoTrack.play(ref.current);
    }
  }, [user.videoTrack]);

  return (
    <div
      ref={ref}
      style={{
        width: '200px',
        height: '150px',
        backgroundColor: '#000',
      }}
    />
  );
};
