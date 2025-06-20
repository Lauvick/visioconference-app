import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  MessageCircle, 
  Users, 
  Settings,
  Send,
  X,
  Circle,
  Square,
  Download,
  AlertCircle
} from 'lucide-react';

const ZoomApp = () => {
  // États pour les contrôles média
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  
  // États pour l'enregistrement
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  
  // États pour l'interface
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Jean Dupont', message: 'Bonjour tout le monde !', time: '14:30' },
    { id: 2, user: 'Marie Martin', message: 'Salut ! Prêt pour la réunion', time: '14:31' }
  ]);
  
  // Participants simulés
  const [participants] = useState([
    { id: 1, name: 'Vous', isHost: true, isMuted: false, hasVideo: true },
    { id: 2, name: 'Jean Dupont', isHost: false, isMuted: false, hasVideo: true },
    { id: 3, name: 'Marie Martin', isHost: false, isMuted: true, hasVideo: false },
    { id: 4, name: 'Pierre Durand', isHost: false, isMuted: false, hasVideo: true }
  ]);

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Initialisation de la caméra
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.log('Erreur d\'accès à la caméra:', err);
      }
    };

    if (isInCall) {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInCall]);

  // Gestion des contrôles média
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

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  // Gestion de l'enregistrement
  const startRecording = async () => {
    try {
      if (!stream) return;
      
      const options = { mimeType: 'video/webm;codecs=vp9' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        setRecordedBlobs(chunks);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Démarrer le compteur de durée
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      setShowRecordingModal(true);
    }
  };

  const downloadRecording = () => {
    if (recordedBlobs.length > 0) {
      const blob = new Blob(recordedBlobs, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reunion-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowRecordingModal(false);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const joinCall = () => {
    setIsInCall(true);
  };

  const leaveCall = () => {
    setIsInCall(false);
    
    // Arrêter l'enregistrement si en cours
    if (isRecording) {
      stopRecording();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        user: 'Vous',
        message: chatMessage,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  // Interface avant l'appel
  if (!isInCall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center border border-white/20">
          <div className="mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Visioconférence</h1>
            <p className="text-blue-100">Rejoignez ou créez une réunion</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <input 
              type="text" 
              placeholder="ID de réunion" 
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input 
              type="text" 
              placeholder="Votre nom" 
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <button 
            onClick={joinCall}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Rejoindre la réunion
          </button>
        </div>
      </div>
    );
  }

  // Interface de la visioconférence
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* En-tête */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-white font-semibold">Réunion d'équipe</h1>
          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">EN DIRECT</span>
          {isRecording && (
            <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">REC {formatDuration(recordingDuration)}</span>
            </div>
          )}
        </div>
        <div className="text-gray-300 text-sm">
          {new Date().toLocaleTimeString('fr-FR',{ hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex">
        {/* Zone vidéo principale */}
        <div className="flex-1 relative">
          {/* Vidéo principale */}
          <div className="h-full bg-gray-800 relative">
            {isVideoOn ? (
              <video 
                ref={videoRef}
                autoPlay 
                muted 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-semibold">V</span>
                  </div>
                  <p className="text-white">Vous</p>
                </div>
              </div>
            )}
            
            {/* Grille des participants */}
            <div className="absolute top-4 right-4 grid grid-cols-2 gap-2">
              {participants.slice(1).map((participant) => (
                <div key={participant.id} className="w-32 h-24 bg-gray-700 rounded-lg flex items-center justify-center relative">
                  {participant.hasVideo ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center">
                      <VideoOff className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                    {participant.name.split(' ')[0]}
                  </div>
                  {participant.isMuted && (
                    <div className="absolute top-1 right-1 bg-red-500 rounded-full p-1">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panneau latéral */}
        {(showChat || showParticipants) && (
          <div className="w-320 bg-gray-800 border-l border-gray-700">
            <div className="flex border-b border-gray-700">
              <button 
                onClick={() => { setShowChat(true); setShowParticipants(false); }}
                className={`flex-1 px-4 py-3 text-sm font-medium ${showChat ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chat
              </button>
              <button 
                onClick={() => { setShowParticipants(true); setShowChat(false); }}
                className={`flex-1 px-4 py-3 text-sm font-medium ${showParticipants ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Participants ({participants.length})
              </button>
              <button 
                onClick={() => { setShowChat(false); setShowParticipants(false); }}
                className="px-3 py-3 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat */}
            {showChat && (
              <div className="flex flex-col h-96">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-blue-400 text-sm font-medium">{msg.user}</span>
                        <span className="text-gray-400 text-xs">{msg.time}</span>
                      </div>
                      <p className="text-white text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Tapez votre message..."
                      className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                      onClick={sendMessage}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Participants */}
            {showParticipants && (
              <div className="p-4 space-y-3 h-96 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {participant.name}
                        {participant.isHost && <span className="ml-2 bg-yellow-500 text-black px-1 rounded text-xs">Hôte</span>}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      {!participant.isMuted ? (
                        <Mic className="w-4 h-4 text-green-400" />
                      ) : (
                        <MicOff className="w-4 h-4 text-red-400" />
                      )}
                      {participant.hasVideo ? (
                        <Video className="w-4 h-4 text-green-400" />
                      ) : (
                        <VideoOff className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Barre de contrôles */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-4">
        <button 
          onClick={toggleAudio}
          className={`p-3 rounded-full ${isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button 
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}
        >
          <Monitor className="w-5 h-5" />
        </button>

        <button 
          onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        <button 
          onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        >
          <Users className="w-5 h-5" />
        </button>

        <button 
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-3 rounded-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}
          title={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
        >
          {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
        </button>

        <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <button 
          onClick={leaveCall}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors ml-4"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Modal d'enregistrement terminé */}
      {showRecordingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Enregistrement terminé</h3>
                <p className="text-gray-600">Durée : {formatDuration(recordingDuration)}</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Votre enregistrement de réunion est prêt. Vous pouvez le télécharger maintenant ou le retrouver plus tard dans vos fichiers.
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={downloadRecording}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger</span>
              </button>
              <button
                onClick={() => setShowRecordingModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomApp;