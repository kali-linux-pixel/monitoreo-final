import { useEffect, useRef, useState, useCallback } from 'react';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (socket) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const pcs = useRef({}); // PeerConnections indexed by socketId

  const stopStreams = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    Object.values(pcs.current).forEach(pc => pc.close());
    pcs.current = {};
    setRemoteStreams({});
  }, [localStream]);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
      throw err;
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Handler for incoming Offer
    socket.on('offer', async ({ from, offer }) => {
      const pc = new RTCPeerConnection(configuration);
      pcs.current[from] = pc;

      // Setup remote track event
      pc.ontrack = (event) => {
        setRemoteStreams(prev => ({
          ...prev,
          [from]: event.streams[0]
        }));
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', { to: from, candidate: event.candidate });
        }
      };

      // Add local stream if available
      if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
      }

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer', { to: from, answer });
    });

    // Handler for incoming Answer
    socket.on('answer', async ({ from, answer }) => {
      const pc = pcs.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    // Handler for ICE Candidates
    socket.on('ice-candidate', async ({ from, candidate }) => {
      const pc = pcs.current[from];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ice candidate', e);
        }
      }
    });

    socket.on('userDisconnected', (userId) => {
      if (pcs.current[userId]) {
        pcs.current[userId].close();
        delete pcs.current[userId];
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('userDisconnected');
    };
  }, [socket, localStream]);

  // Function to initiate broadcast to everyone else (simplified)
  const initiateCall = async () => {
    // This requires an event to fetch all available socket users, 
    // but for simplicity in this demo the devices usually initiate to user.
    // Let's prepare local PC instance if needed manually triggered from caller side
    console.log('Waiting for offers (acting as receiver)');
  };

  return { localStream, remoteStreams, startLocalStream, stopStreams, initiateCall };
};
