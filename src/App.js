import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, Users, Settings, Plus } from 'lucide-react';

const VideoConferenceApp = () => {
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [stream, setStream] = useState(null);
  const [participants] = useState(1);
  
  const videoRef = useRef(null);

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopVideo = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const joinMeeting = () => {
    if (!roomId.trim() || !userName.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    setCurrentRoom(roomId);
    setIsInMeeting(true);
    startVideo();
  };

  const createMeeting = () => {
    if (!userName.trim()) {
      alert('Veuillez entrer votre nom');
      return;
    }
    
    // Générer un ID de réunion aléatoire
    const newRoomId = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRoomId(newRoomId);
    setCurrentRoom(newRoomId);
    setIsInMeeting(true);
    startVideo();
  };

  const leaveMeeting = () => {
    stopVideo();
    setIsInMeeting(false);
    setCurrentRoom('');
    setRoomId('');
  };

  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  if (!isInMeeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md mx-auto border border-white/20">
          <div className="text-center mb-8">
            <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="text-white text-2xl" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Visioconférence</h1>
            <p className="text-blue-100">Rejoignez ou créez une réunion</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="ID de réunion"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            
            <input
              type="text"
              placeholder="Votre nom"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            
            <button
              onClick={joinMeeting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Rejoindre la réunion
            </button>
            
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-white/30"></div>
              <span className="px-3 text-blue-200 text-sm">ou</span>
              <div className="flex-1 h-px bg-white/30"></div>
            </div>
            
            <button
              onClick={createMeeting}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-teal-700 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="inline-block mr-2" size={20} />
              Créer une nouvelle réunion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Video className="text-blue-400" size={24} />
          <div>
            <h2 className="text-white font-semibold">Réunion: {currentRoom}</h2>
            <p className="text-gray-300 text-sm">{userName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-700 px-3 py-1 rounded-lg">
            <Users size={16} className="text-gray-300" />
            <span className="text-white text-sm">{participants}</span>
          </div>
          <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Settings className="text-white" size={20} />
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="relative bg-gray-800 rounded-lg overflow-hidden shadow-2xl max-w-4xl w-full aspect-video">
          {isVideoOn ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <div className="text-center">
                <VideoOff className="text-gray-400 mx-auto mb-2" size={48} />
                <p className="text-gray-400">Caméra désactivée</p>
              </div>
            </div>
          )}
          
          {/* Overlay with user info */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-lg">
            <p className="text-white font-medium">{userName}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-4 py-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioOn 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoOn 
                ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          
          <button
            onClick={leaveMeeting}
            className="p-3 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
          >
            <Phone size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoConferenceApp;