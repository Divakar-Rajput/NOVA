const btn = document.querySelector('.talk');
const content = document.querySelector('.typing-input');

// Sanitize text to remove unsupported special characters
function sanitizeText(text) {
    return text.replace(/[^a-zA-Z0-9., ]/g, ""); // Retain only letters, numbers, spaces, commas, and periods
}

function speak(text) {
    const sanitizedText = sanitizeText(text);
    if (!sanitizedText) {
        console.warn("No valid text to speak.");
        return;
    }

    const textSpeak = new SpeechSynthesisUtterance(sanitizedText);
    textSpeak.rate = 1;
    textSpeak.volume = 1;
    textSpeak.pitch = 1;
    textSpeak.lang = 'hi-IN';

    // Stop further speech when this paragraph ends
    textSpeak.onend = () => {
        console.log("Completed speaking the paragraph:", sanitizedText);
    };

    window.speechSynthesis.speak(textSpeak);
}

function speakFirstParagraphOnly(text) {
    const paragraphs = text.split("\n").map(paragraph => paragraph.trim()).filter(paragraph => paragraph);
    if (paragraphs.length > 0) {
        speak(paragraphs[0]); // Speak only the first paragraph
    } else {
        console.warn("No valid paragraphs to speak.");
    }
}

function greetUser() {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning Boss..."
        : hour < 17 ? "Good Afternoon Master..."
            : "Good Evening Sir...";
    speak(greeting);
    speak("Welcome to your AI assistant.");
}

window.addEventListener('load', () => {
    speak("Initializing NOVA...");
    greetUser();
});

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
let voiceCommand = null;

recognition.onresult = (event) => {
    const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();
    content.value = transcript;
    voiceCommand = transcript;
    processCommand(transcript);
};

btn.addEventListener('click', () => {
    content.value = "Listening...";
    recognition.start();
});

const API_KEY = "AIzaSyDDXnpy-6q1_gd0b3NJGvUuJljiajkZTZs"; // Replace with your API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

function processCommand(command) {
    if (command.includes('hey') || command.includes('hello')) {
        speak("Hello Sir, How May I Help You?");
    } else if (command.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (command.includes("who are you")) {
        speak("I am NOVA, your virtual assistant, created by Divakar Rajput.");
    } else if (command.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening YouTube...");
    } else if (command.includes("open facebook")) {
        window.open("https://facebook.com", "_blank");
        speak("Opening Facebook...");
    } else if (command.includes('wikipedia')) {
        const query = command.replace("wikipedia", "").trim();
        window.open(`https://en.wikipedia.org/wiki/${query}`, "_blank");
        speak(`This is what I found on Wikipedia regarding ${query}.`);
    } else if (command.includes('time')) {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        speak(`The current time is ${time}.`);
    } else if (command.includes('date')) {
        const date = new Date().toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
        speak(`Today's date is ${date}.`);
    } else if (command.includes('calculator')) {
        speak("Sorry, opening a calculator is not supported in this browser.");
    } else if (command.includes('on google')) {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(command)}`, "_blank");
        speak(`I found some information for ${command} on Google.`);
    } else {
        fetchResponseFromAPI();
    }
}

async function fetchResponseFromAPI() {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [{ text: voiceCommand }],
                    },
                ],
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const reply = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1");
        speakFirstParagraphOnly(reply); // Speak only the first paragraph
        console.log(reply);
    } catch (error) {
        console.error("Fetch error:", error);
        speak("Sorry, there was an error fetching the response.");
    }
}
