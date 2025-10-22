import React, { useEffect } from 'react';
import styled from 'styled-components';
import useGameStore from './utils/gameStore';
import socket, { connectSocket } from './utils/socket';

// Components
import LobbyScreen from './components/LobbyScreen';
import GameBoard from './components/GameBoard';
import GoldCardModal from './components/GoldCardModal';
import WaitingRoom from './components/WaitingRoom';
import Notification from './components/Notification';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  position: relative;
`;

const RenaultLogo = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;

  img {
    height: 40px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }

  @media (max-width: 768px) {
    top: 10px;
    left: 10px;

    img {
      height: 30px;
    }
  }
`;

function App() {
  const {
    connected,
    setConnected,
    setPlayerId,
    gameState,
    updateGameState,
    setRoom,
    updatePlayers,
    setGameState,
    addChatMessage,
    setNotification,
    setGoldCard,
    reset
  } = useGameStore();

  useEffect(() => {
    // Connect socket
    connectSocket();

    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
      setPlayerId(socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    socket.on('roomCreated', (data) => {
      console.log('Room created:', data);
      setRoom(data);
      setGameState('waiting');
      setNotification({ type: 'success', message: 'Room created successfully!' });
    });

    socket.on('roomJoined', (data) => {
      console.log('Room joined:', data);
      setRoom(data);
      setGameState('waiting');
      setNotification({ type: 'success', message: 'Joined room successfully!' });
    });

    socket.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      updatePlayers(data.players);
      setNotification({
        type: 'info',
        message: `${data.player.name} joined the game`
      });
    });

    socket.on('playerLeft', (data) => {
      console.log('Player left:', data);
      updatePlayers(data.players);
      setNotification({
        type: 'warning',
        message: `${data.playerName} left the game`
      });
    });

    socket.on('gameStarted', (gameStateData) => {
      console.log('Game started:', gameStateData);
      setGameState('playing');
      updateGameState(gameStateData);
      // Update room state to playing
      const currentRoom = useGameStore.getState().room;
      if (currentRoom) {
        currentRoom.state = 'playing';
      }
      setNotification({ type: 'success', message: 'Game started!' });
    });

    socket.on('cardPlayed', (data) => {
      console.log('Card played:', data);
      // Visual feedback handled by game board
    });

    socket.on('gameStateUpdate', (gameStateData) => {
      console.log('Game state update:', gameStateData);
      updateGameState(gameStateData);
    });

    socket.on('trickComplete', (data) => {
      console.log('Trick complete:', data);
      setNotification({
        type: 'info',
        message: `${data.winner.name} won the trick!`
      });
    });

    socket.on('challengeResult', (data) => {
      console.log('Challenge result:', data);
      if (data.success) {
        setNotification({
          type: 'success',
          message: `Challenge completed! ${data.message}`
        });
      } else {
        setNotification({
          type: 'danger',
          message: `Challenge failed: ${data.message}`
        });
      }
    });

    socket.on('showGoldCard', (goldCard) => {
      console.log('Gold card:', goldCard);
      setGoldCard(goldCard);
    });

    socket.on('nextChallenge', (challenge) => {
      console.log('Next challenge:', challenge);
      setGameState('playing');
      setNotification({
        type: 'info',
        message: `New challenge: ${challenge.title}`
      });
    });

    socket.on('gameOver', (finalScore) => {
      console.log('Game over:', finalScore);
      setGameState('finished');
      setNotification({
        type: 'warning',
        message: `Game Over! Completed ${finalScore.challengesCompleted} challenges`
      });
    });

    socket.on('abilityUsed', (data) => {
      console.log('Ability used:', data);
      setNotification({
        type: 'info',
        message: `${data.ability} activated!`
      });
    });

    socket.on('chatMessage', (message) => {
      console.log('Chat message:', message);
      addChatMessage(message);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setNotification({
        type: 'danger',
        message: error.message
      });
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('gameStarted');
      socket.off('cardPlayed');
      socket.off('gameStateUpdate');
      socket.off('trickComplete');
      socket.off('challengeResult');
      socket.off('showGoldCard');
      socket.off('nextChallenge');
      socket.off('gameOver');
      socket.off('abilityUsed');
      socket.off('chatMessage');
      socket.off('error');
    };
  }, []);

  return (
    <AppContainer>
      <RenaultLogo>
        <svg height="40" viewBox="0 0 240 80" fill="#FFCC00">
          <path d="M120,10 L160,40 L120,70 L80,40 Z" />
          <text x="10" y="50" fontFamily="Arial" fontSize="24" fontWeight="bold" fill="#FFCC00">
            RENAULT
          </text>
        </svg>
      </RenaultLogo>

      {gameState === 'lobby' && <LobbyScreen />}
      {gameState === 'waiting' && <WaitingRoom />}
      {(gameState === 'playing' || gameState === 'finished') && <GameBoard />}
      {gameState === 'goldCard' && <GoldCardModal />}

      <Notification />
    </AppContainer>
  );
}

export default App;
