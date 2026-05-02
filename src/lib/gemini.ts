export async function generateBookingResponse(businessName: string, inquiryDetails: string, userPhone: string, userName: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"
  
  if (!apiKey) {
    console.warn("No Gemini API Key found. Returning mock response.")
    return `[MOCK SMS to ${userPhone}]: Hello ${userName}, your inquiry for ${businessName} has been received. We will contact you shortly!`
  }

  const prompt = `
    You are an AI assistant for a hospitality platform. A user named "${userName}" (Phone: ${userPhone}) just submitted an inquiry/booking request for a business named "${businessName}".
    
    User's Request: "${inquiryDetails}"
    
    Task: Write a short, polite SMS text message (max 2 sentences) confirming that the request was received and summarizing the details. 
    Act as the business itself. DO NOT use placeholders like [Date], make it sound natural based on their request.
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate response with Gemini API')
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (text) {
      return `[Simulated SMS sent to ${userPhone}]: \n\n${text.trim()}`
    }
    
    return "Error generating message."
  } catch (error) {
    console.error("Gemini API Error:", error)
    return `[Error SMS to ${userPhone}]: Inquiry received for ${businessName}, but AI generation failed.`
  }
}

export async function enhanceStorefrontDescription(baseDescription: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"
  const prompt = `
    You are a luxury copywriter for ultra-premium hotels and restaurants. 
    Take the following basic notes and rewrite them into a single, beautifully crafted, highly engaging marketing paragraph (max 4 sentences).
    Make it sound extremely premium, exclusive, and welcoming. Do not include any placeholder text.
    
    Basic Notes: "${baseDescription}"
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 150 } })
    })
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || baseDescription
  } catch (err) {
    console.error(err)
    return baseDescription
  }
}

export async function getDietaryMenuMatch(preferences: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"
  const prompt = `
    You are an AI Sommelier and Executive Chef. A guest has provided the following dietary preferences/allergies: "${preferences}".
    Please reply with a sophisticated 2-sentence recommendation of what they could enjoy from a high-end luxury menu, and assure them their allergies will be strictly handled.
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 100 } })
    })
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Our chef has noted your preferences and will prepare a custom dish for you."
  } catch (err) {
    console.error(err)
    return "Our chef has noted your preferences."
  }
}

export async function getPricingInsightsAndAlternatives(businessName: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"
  const prompt = `
    A user is viewing the booking page for "${businessName}" but is checking for lower-priced alternatives.
    Act as a smart AI travel agent. Generate a short 2-sentence response suggesting 2 fictional, budget-friendly alternative hotels or restaurants nearby that offer great value.
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 100 } })
    })
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Consider checking 'The Sunset Inn' or 'Downtown Bistro' for great budget-friendly options nearby."
  } catch (err) {
    console.error(err)
    return "Consider checking 'The Sunset Inn' for a great budget-friendly option."
  }
}
