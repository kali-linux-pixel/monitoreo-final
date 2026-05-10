// Utilidades para WebRTC

const config = require('../config');

/**
 * Obtener configuración de ICE Servers
 * @returns {Object} Configuración para RTCPeerConnection
 */
function getWebRTCConfiguration() {
  return {
    iceServers: config.ICE_SERVERS,
  };
}

/**
 * Validar oferta WebRTC
 * @param {Object} offer - Oferta WebRTC
 * @returns {Boolean} True si es válida
 */
function isValidOffer(offer) {
  return (
    offer &&
    offer.type === 'offer' &&
    offer.sdp &&
    typeof offer.sdp === 'string'
  );
}

/**
 * Validar respuesta WebRTC
 * @param {Object} answer - Respuesta WebRTC
 * @returns {Boolean} True si es válida
 */
function isValidAnswer(answer) {
  return (
    answer &&
    answer.type === 'answer' &&
    answer.sdp &&
    typeof answer.sdp === 'string'
  );
}

/**
 * Validar ICE Candidate
 * @param {Object} candidate - ICE Candidate
 * @returns {Boolean} True si es válido
 */
function isValidIceCandidate(candidate) {
  return (
    candidate &&
    candidate.candidate &&
    typeof candidate.candidate === 'string'
  );
}

module.exports = {
  getWebRTCConfiguration,
  isValidOffer,
  isValidAnswer,
  isValidIceCandidate,
};
