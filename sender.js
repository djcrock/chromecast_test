const applicationID = '254D009C';
const namespace = 'urn:x-cast:com.djcrocker.dev.chromecast.test';
let session = null;

window['__onGCastApiAvailable'] = isAvailable => {
  if (isAvailable) {
    const sessionRequest = new chrome.cast.SessionRequest(applicationID);
    const apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
  }
};


/**
 * initialization success callback
 */
function onInitSuccess() {
  appendMessage('onInitSuccess');
}
/**
 * initialization error callback
 */
function onError(message) {
  appendMessage('onError: ' + JSON.stringify(message));
}
/**
 * generic success callback
 */
function onSuccess(message) {
  appendMessage('onSuccess: ' + message);
}
/**
 * callback on success for stopping app
 */
function onStopAppSuccess() {
  appendMessage('onStopAppSuccess');
}
/**
 * session listener during initialization
 */
function sessionListener(e) {
  appendMessage('Somehow, sessionListener was called.');
  appendMessage('New session ID:' + e.sessionId);
  session = e;
  session.addUpdateListener(sessionUpdateListener);
  session.addMessageListener(namespace, receiverMessage);
}
/**
 * listener for session updates
 */
function sessionUpdateListener(isAlive) {
  var message = isAlive ? 'Session Updated' : 'Session Removed';
  message += ': ' + session.sessionId;
  appendMessage(message);
  if (!isAlive) {
    session = null;
  }
}
/**
 * utility function to log messages from the receiver
 * @param {string} namespace The namespace of the message
 * @param {string} message A message string
 */
function receiverMessage(namespace, message) {
  const data = JSON.parse(message);
  document.getElementById('inputText').value = data.message;
  appendMessage('receiverMessage: ' + namespace + ', ' + message);
}
/**
 * receiver listener during initialization
 */
function receiverListener(e) {
  if(e === 'available') {
    appendMessage('receiver found');
  }
  else {
    appendMessage('receiver list empty');
  }
}
/**
 * stop app/session
 */
function stopApp() {
  session.stop(onStopAppSuccess, onError);
}

/**
 * send a message to the receiver using the custom namespace
 * receiver CastMessageBus message handler will be invoked
 * @param {string} message A message string
 */
function sendMessage(message) {
  if (session != null) {
    session.sendMessage(namespace, message, onSuccess.bind(this, 'Message sent: ' + message),
      onError);
  }
  else {
    chrome.cast.requestSession(function(e) {
        appendMessage('New session ID:' + e.sessionId);
        session = e;
        session.addUpdateListener(sessionUpdateListener);
        session.addMessageListener(namespace, receiverMessage);
        session.sendMessage(namespace, message, onSuccess.bind(this, 'Message sent: ' +
          message), onError);
      }, onError);
  }
}

/**
 * append message to debug message window
 * @param {string} message A message string
 */
function appendMessage(message) {
  console.log(message);
  //var dw = document.getElementById('debugmessage');
  //dw.innerHTML += '\n' + JSON.stringify(message);
}

/**
 * utility function to handle text typed in by user in the input field
 */
function sendText() {
  const message = { message: document.getElementById('inputText').value };
  sendMessage(JSON.stringify(message));
}

/**
 * handler for the transcribed text from the speech input
 * @param {string} words A transcibed speech string
 */
function transcribe(words) {
  sendMessage(words);
}