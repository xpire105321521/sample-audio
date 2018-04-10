var audio = document.querySelector('#audio');

navigator.mediaDevices.getUserMedia({audio: true})
.then(gotStream)
.catch(function(error) {
	console.log('getUserMedia error: ' + error);
});

function gotStream(stream) {
	var audioCtx = new window.AudioContext();

	var source = audioCtx.createMediaStreamSource(stream);
	
	// BufferSize = 4096 bytes, a input channel, a output channel
	analyser = audioCtx.createScriptProcessor(4096, 1, 1);
	
	source.connect(analyser);
	
	analyser.onaudioprocess = function (e) {
		var vorbisEncoder = new OggVorbisEncoder(44100, 1, 1);
		var inputData = e.inputBuffer.getChannelData(0);
		var outputData = e.outputBuffer.getChannelData(0);
		
		for (var i = 0; i < inputData.length; i++) {
			outputData[i] = inputData[i];
		}
		
		vorbisEncoder.encode(inputData);
		var n_blob = vorbisEncoder.finish();
		
		console.log(n_blob);
		var fileReader = new FileReader();
		var n_array = null;
		fileReader.onload = function(e) {
			n_array = this.result;
			console.log(n_array);
			audioCtx.decodeAudioData(n_array, function(buffer) {
				source.buffer = buffer;
				analyser.connect(audioCtx.destination);
				source.loop = true;
			});
		}
		
		fileReader.readAsArrayBuffer(n_blob);
	}

	//analyser.connect(audioCtx.destination);

}
