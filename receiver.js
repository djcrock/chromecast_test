const namespace = 'urn:x-cast:com.djcrocker.dev.chromecast.test';


cast.receiver.logger.setLevelValue(0);
window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();

window.castReceiverManager.onReady = function(event) {
  console.log(`Received Ready event: ${JSON.stringify(event.data)}`);
  window.castReceiverManager.setApplicationState('Ready');
};

window.castReceiverManager.onSenderConnected = function(event) {
  console.log(`Received Sender Connected event: ${event.data}`);
  console.log(window.castReceiverManager.getSender(event.data).userAgent);
};

castReceiverManager.onSenderDisconnected = function(event) {
  console.log(`Received Sender Disconnected event: ${event.data}`);
  if (window.castReceiverManager.getSenders().length == 0) {
    window.close();
  }
};

castReceiverManager.onSystemVolumeChanged = function(event) {
  console.log(`Received System Volume Changed event: ${event.data['level']} ${event.data['muted']}`);
};

window.messageBus = window.castReceiverManager.getCastMessageBus(namespace);

window.messageBus.onMessage = function(event) {
  const data = JSON.parse(event.data);
  console.log(`Message [${event.senderId}]: ${data}`);
  document.getElementById('displayText').innerText = data.message;
  //window.messageBus.send(event.senderId, event.data);
  window.messageBus.broadcast(JSON.stringify(data));
};

window.castReceiverManager.start({statusText: 'Application is starting'});
console.log('Receiver Manager started');