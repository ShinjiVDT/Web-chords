import { GoogleGenAI, Type } from "@google/genai";

// FIX: Per coding guidelines, API_KEY is assumed to be present and valid.
// The console warning and explicit checks for process.env.API_KEY have been removed, along with the non-null assertion `!`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getChordSuggestions = async (key: string, currentChord: string, scale: string) => {
    try {
        const prompt = `You are an expert music theorist. I am composing in the key of ${key} ${scale}. I'm currently on the ${currentChord} chord.
        
        Suggest three creative and musically interesting chord progressions starting from ${currentChord}. These progressions could be for modulation or just for harmonic color.
        
        For each progression, provide:
        1. A string with the sequence of chords (e.g., "Am - D7 - Gmaj7 - Cmaj7").
        2. A brief explanation of its harmonic function and why it's effective.
        
        Return the response as a JSON object.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        progressions: {
                            type: Type.ARRAY,
                            description: "An array of three chord progression suggestions.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    sequence: {
                                        type: Type.STRING,
                                        description: 'Chord progression sequence, e.g., "Am - G - C"'
                                    },
                                    explanation: {
                                        type: Type.STRING,
                                        description: 'Explanation of the harmonic function.'
                                    },
                                },
                                required: ["sequence", "explanation"]
                            },
                        },
                    },
                     required: ["progressions"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error fetching chord suggestions from Gemini:", error);
        return { error: "Failed to get suggestions. The model may have returned an invalid response. Please try again." };
    }
};