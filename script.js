var mediaRecorder;
var audioChunks = [];
var audioStream;
var recording = false;
var summary = false;
var date = new Date().toLocaleDateString("en-GB");
var pointIndex = 0;
var pointInterval = null;

function $(val){
	return document.querySelector(val);
}

let availableVoices = [];

function loadVoices() {
    availableVoices = window.speechSynthesis.getVoices();
}

function startPointAnimation(){
	pointInterval = setInterval(() => {
		pointIndex += 1;
		$("span").innerHTML += ".";
		if(pointIndex == 4){
			pointIndex = 0;
			$("span").innerHTML = "";
		}
	}, 500);
}

if (typeof window !== "undefined" && window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

let ttsAnimationId;
let ttsActive = false;
let targetTTSAmp = 0;
let currentTTSAmp = 0;

function trackTTSAmplitude() {
    if (!ttsActive && currentTTSAmp < 1) {
        currentTTSAmp = 0;
        console.log("TTS Amplitude: 0");
        $(".scarp").style.transform = `scale(1)`;
        return;
    }

    // Smooth dampening towards target
    currentTTSAmp += (targetTTSAmp - currentTTSAmp) * 0.25;

    // Introduce natural syllable fluctuation (jitter between 25 and 85)
    if (ttsActive) {
        targetTTSAmp = 35 + Math.random() * 45;
    } else {
        targetTTSAmp = 0;
    }

    $(".scarp").style.transform = `scale(${1 + currentTTSAmp / 100})`;

    // MISSING LINE ADDED HERE: Request the next frame to create the continuous loop
    ttsAnimationId = requestAnimationFrame(trackTTSAmplitude);
}

function speak(text) {
    if (!text || !window.speechSynthesis) return;

    text = text.replace(/[\n\r]+/g, " ").trim();

    const isHindi = /[\u0900-\u097F]/.test(text);
    const targetLang = isHindi ? "hi-IN" : "en-IN";

    if (!availableVoices.length) {
        availableVoices = window.speechSynthesis.getVoices();
    }

    window.speechSynthesis.cancel();
    if (ttsAnimationId) cancelAnimationFrame(ttsAnimationId);

    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;

    const matchedVoice = availableVoices.find(
        (v) =>
            v.lang === targetLang ||
            v.lang.replace("_", "-").startsWith(targetLang.slice(0, 2))
    );

    if (matchedVoice) {
        utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
        ttsActive = true;
        trackTTSAmplitude();
    };

    // Pulses on every spoken word/syllable boundary
    utterance.onboundary = () => {
        targetTTSAmp = 70 + Math.random() * 30;
    };

    utterance.onend = () => {
        ttsActive = false;
    };

    utterance.onerror = (e) => {
        ttsActive = false;
        console.error("SpeechSynthesis error:", e.error);
    };

    window.speechSynthesis.speak(utterance);
}

$("#period").addEventListener("change", () => {
	date = $("#period").value;
	date = date.split("-").reverse().join("/");
	if(date == new Date().toLocaleDateString("en-GB")){
		$("button").innerHTML = "Period: Today";
	}
	else{
		$("button").innerHTML = "Period: " + date;
	}
});

$(".btn").addEventListener("click", () => {
	if(!summary){
		$(".in_circle").style.left = "20px";
		$(".in_circle").style.background = "rgba(255, 255, 255, 0.85)";
		$("p").style.color = "rgba(255, 255, 255, 0.9)";
	}
	else{
		$(".in_circle").style.left = "0px";
		$(".in_circle").style.background = "rgba(255, 255, 255, 0.4)";
		$("p").style.color = "rgba(255, 255, 255, 0.5)";
	}
	summary = !summary;
});

async function handleMic() {
    if (recording) {
        // Unlock/Prime SpeechSynthesis under active user gesture context
        if (window.speechSynthesis) {
            const prime = new SpeechSynthesisUtterance("");
            window.speechSynthesis.speak(prime);
        }

        await stopRecording();
        let audioBytes = await getAudioBytes();

        console.log("Audio bytes:", audioBytes);
        console.log("Audio size:", audioBytes.length);

        const transcript = await transcribeAllChunks();
        console.log("Transcript:", transcript);

        $("big").innerHTML = "Waiting<br>for answer<span></span>";
        // Sanitize URL query parameters
        const url = `http://127.0.0.1:8080/ask?query=${encodeURIComponent(transcript)}&date=${encodeURIComponent(date.replaceAll("/", "-"))}&summary=${summary}`;
        
        try {
            let res = await fetch(url);
            let data = await res.json();

            if (data && "response" in data) {
                console.log("response:", data["response"]);
                speak(data["response"]);
            }
            
            if (data && "summary" in data) {
                alert("SUMMARY:\n\n" + data["summary"]);
            } else if (data && "error" in data) {
                console.log("Server error:", data["error"]);
            }
        } catch (err) {
            console.error("Fetch request failed:", err);
        }
        $("big").innerHTML = "Tell me<br>Something<span></span>";
        clearInterval(pointInterval);
        $("span").innerHTML = "";
        pointIndex = 0;
    } else {
        await startRecording();
    }
    recording = !recording;
}

async function transcribeAllChunks() {
    const transcripts = [];

    for (let i = 0; i < audioChunks.length; i++) {
        console.log(`Transcribing ${i + 1}/${audioChunks.length}`);

        const audioBytes = await getAudioBytes(audioChunks[i]);

        const transcript = await transcribeAudio(audioBytes);
        //const transcript = "आप क्येसे हो";

        transcripts.push(transcript);
    }

    return transcripts.join(" ");
}

async function transcribeAudio(audioBytes) {
    const form = new FormData();

    const audioBlob = new Blob([audioBytes], {
        type: "audio/wav"
    });

    form.append("audio_file", audioBlob, "recording.wav");
    form.append("model", "prisma-v3.0");
    form.append("language_code", "indic-auto");

    const response = await fetch(
        "https://api.vachana.ai/stt/v3",
        {
            method: "POST",
            headers: {
                "X-API-Key-ID": "vach_1ytE2CY5X2PYezEk8T7gUApXRo0EYkgMAhV7148aHPxPmVRyPT1V2hkP0Td6MsrRgg0PmN9qLdedvmRfoOp9hJeWPkRe7iht_3b6c80bbe93cd52beb62b58675647762"
            },
            body: form
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message ||
            data.detail?.error_code ||
            JSON.stringify(data)
        );
    }

    return data.transcript;
}

let liveAudioContext;
let amplitudeAnimationId;

async function startRecording() {
	startPointAnimation();
    audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });

    audioChunks = [];

    mediaRecorder = new MediaRecorder(audioStream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunks.push(event.data);
        }
    };

    mediaRecorder.start(30000); // 30-second chunking
    $("big").innerHTML = "Recording<span></span>";

    // --- Audio Amplitude Tracking Pipeline ---
    
    liveAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 1. FORCE RESUME: Ensure context is active before pulling data
    if (liveAudioContext.state === "suspended") {
        await liveAudioContext.resume();
    }
    
    const source = liveAudioContext.createMediaStreamSource(audioStream);
    const analyser = liveAudioContext.createAnalyser();
    
    analyser.fftSize = 256; 
    source.connect(analyser);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function monitorAmplitude() {
        // 2. LOGIC FIX: Check mediaRecorder state instead of the external 'recording' variable
        if (mediaRecorder.state !== "recording") {
            return; 
        }
        
        analyser.getByteTimeDomainData(dataArray);
        
        let sumSquare = 0;
        for (let i = 0; i < bufferLength; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sumSquare += normalized * normalized;
        }
        
        const rms = Math.sqrt(sumSquare / bufferLength);
        const amplitude = Math.min(Math.round(rms * 100 * 5), 100); 
        
        $(".scarp").style.transform = `scale(${1 + amplitude/100})`;
        
        amplitudeAnimationId = requestAnimationFrame(monitorAmplitude);
    }
    
    monitorAmplitude();
}

async function getAudioBytes() {
    const audioContext = new AudioContext();

    const audioBlob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType
    });

    const buffer = await audioContext.decodeAudioData(
        await audioBlob.arrayBuffer()
    );

    const sampleRate = 16000;
    const offline = new OfflineAudioContext(
        1,
        Math.ceil(buffer.duration * sampleRate),
        sampleRate
    );

    const source = offline.createBufferSource();
    source.buffer = buffer;
    source.connect(offline.destination);
    source.start();

    const rendered = await offline.startRendering();
    const samples = rendered.getChannelData(0);

    const wavBuffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(wavBuffer);

    function writeString(offset, str) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;

    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(
            offset,
            sample < 0 ? sample * 32768 : sample * 32767,
            true
        );
        offset += 2;
    }

    await audioContext.close();
    return new Uint8Array(wavBuffer);
}

function stopRecording() {
    $("big").innerHTML = "Transcribing<span></span>";
    
    // Stop the amplitude visualizer loop
    if (amplitudeAnimationId) {
        cancelAnimationFrame(amplitudeAnimationId);
    }
    
    // Close the live audio context to free up resources
    if (liveAudioContext && liveAudioContext.state !== 'closed') {
        liveAudioContext.close();
    }

    return new Promise(resolve => {
        mediaRecorder.onstop = () => {
            audioStream.getTracks().forEach(track => track.stop());
            resolve();
        };

        mediaRecorder.stop();
    });
}