import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import socket from '../utils/socket';
import useGameStore from '../utils/gameStore';

const LobbyContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  color: var(--renault-yellow);
  text-align: center;
  margin-bottom: 1rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #ccc;
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid var(--renault-yellow);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(255, 204, 0, 0.2);

  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  margin-bottom: 1rem;
  border: 2px solid #444;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: border 0.3s;

  &:focus {
    border-color: var(--renault-yellow);
  }

  &::placeholder {
    color: #888;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 0.9rem;
  }
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 15px;
  margin-bottom: 0.5rem;
  background: ${props => props.primary ? 'var(--renault-yellow)' : 'transparent'};
  color: ${props => props.primary ? 'black' : 'var(--renault-yellow)'};
  border: 2px solid var(--renault-yellow);
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.primary ? '#FFD700' : 'rgba(255, 204, 0, 0.1)'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 204, 0, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 1rem;
  }
`;

const Divider = styled.div`
  text-align: center;
  margin: 1.5rem 0;
  color: #888;
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 40%;
    height: 1px;
    background: #444;
  }

  &::before { left: 0; }
  &::after { right: 0; }
`;

const RoomList = styled.div`
  margin-top: 2rem;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
`;

const RoomItem = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #444;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--renault-yellow);
    background: rgba(255, 204, 0, 0.1);
  }
`;

function LobbyScreen() {
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [view, setView] = useState('main'); // main, create, join

  const connected = useGameStore(state => state.connected);
  const setPlayerNameStore = useGameStore(state => state.setPlayerName);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setPlayerNameStore(playerName);

    socket.emit('createRoom', {
      playerName,
      roomName: roomName || `${playerName}'s Room`,
      isPrivate: false,
      maxPlayers: 6
    });
  };

  const handleJoinRoom = (roomId = null) => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    setPlayerNameStore(playerName);

    const targetRoomId = roomId || joinRoomId;

    if (!targetRoomId) {
      alert('Please enter a room code');
      return;
    }

    socket.emit('joinRoom', {
      roomId: targetRoomId,
      playerName
    });
  };

  return (
    <LobbyContainer>
      <Title
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Diversity & Inclusion
      </Title>

      <Subtitle>
        A cooperative card game about building inclusive workplaces
      </Subtitle>

      {!connected && (
        <Card
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p style={{ textAlign: 'center', color: '#888' }}>Connecting to server...</p>
        </Card>
      )}

      {connected && view === 'main' && (
        <Card
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />

          <Button
            primary
            onClick={() => setView('create')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create New Room
          </Button>

          <Button
            onClick={() => setView('join')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Join Existing Room
          </Button>
        </Card>
      )}

      {connected && view === 'create' && (
        <Card
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ color: 'var(--renault-yellow)', marginBottom: '1.5rem' }}>
            Create Room
          </h2>

          <Input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />

          <Input
            type="text"
            placeholder="Room name (optional)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={30}
          />

          <Button
            primary
            onClick={handleCreateRoom}
            disabled={!playerName.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Room
          </Button>

          <Button
            onClick={() => setView('main')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </Button>
        </Card>
      )}

      {connected && view === 'join' && (
        <Card
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 style={{ color: 'var(--renault-yellow)', marginBottom: '1.5rem' }}>
            Join Room
          </h2>

          <Input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
          />

          <Input
            type="text"
            placeholder="Room code"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value.toLowerCase())}
            maxLength={8}
          />

          <Button
            primary
            onClick={() => handleJoinRoom()}
            disabled={!playerName.trim() || !joinRoomId.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Join Room
          </Button>

          <Button
            onClick={() => setView('main')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </Button>
        </Card>
      )}
    </LobbyContainer>
  );
}

export default LobbyScreen;
