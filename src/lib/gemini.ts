export async function generateBookingResponse(businessName: string, inquiryDetails: string, userPhone: string, userName: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"
  
  if (!apiKey) {
    console.warn("No Gemini API Key found. Returning mock response.")
    return `[MOCK SMS to ${userPhone}]: Hello ${userName}, your inquiry for ${businessName} has been received. We will contact you shortly!`
  }

  const prompt = `
    You are an AI booking concierge for "${businessName}". A user named "${userName}" (Phone: ${userPhone}) has submitted a booking inquiry.
    
    User's Request: "${inquiryDetails}"
    
    Task: 
    1. First, analyze if the request is genuine (related to booking, questions, or hospitality). If it's gibberish or spam, reply with a polite message asking for clear details.
    2. If genuine, generate a professional "Booking Slip" text message. 
    It MUST include:
    - A unique fictional Reference ID (e.g., HH-XXXX).
    - The Guest Name.
    - A clear confirmation of the request details.
    - A warm closing.
    
    Format it as a professional digital receipt/slip. Keep it concise but formal.
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
          maxOutputTokens: 250,
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error Detail:', errorData)
      throw new Error(`Failed with status ${response.status}: ${errorData.error?.message || 'Unknown error'}`)
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 150 } })
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error Detail:', errorData)
      throw new Error(`Failed with status ${response.status}`)
    }
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 100 } })
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error Detail:', errorData)
      throw new Error('Failed')
    }
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 100 } })
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error Detail:', errorData)
      throw new Error('Failed')
    }
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Consider checking 'The Sunset Inn' or 'Downtown Bistro' for great budget-friendly options nearby."
  } catch (err) {
    console.error(err)
    return "Consider checking 'The Sunset Inn' for a great budget-friendly option."
  }
}

export async function getBusinessStrategy(dataSummary: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"
  const prompt = `
    You are a world-class hospitality business consultant. 
    Analyze the following business data and provide 3 short, actionable, high-impact strategies to increase revenue or efficiency.
    Keep it professional, encouraging, and specific to the numbers provided.
    
    Data Summary: ${dataSummary}
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 300 } })
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error Detail:', errorData)
      throw new Error('Failed')
    }
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Analyze your peak hours and consider offering mid-week discounts to boost occupancy."
  } catch (err) {
    console.error(err)
    return "Focus on increasing mid-week occupancy and optimizing menu pricing for high-demand items."
  }
}

export async function generateInquiryReply(guestName: string, request: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"
  const prompt = `
    You are a professional hotel/restaurant manager. 
    Draft a polite, welcoming, and helpful reply to a guest named "${guestName}" who sent this request: "${request}".
    The reply should be professional, address their specific points, and encourage them to finalize the booking.
    Keep it under 3-4 sentences.
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 200 } })
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error Detail:', errorData)
      throw new Error('Failed')
    }
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Thank you for reaching out! We would be delighted to host you. Please let us know if you have any other questions."
  } catch (err) {
    console.error(err)
    return "Thank you for your inquiry. We will get back to you shortly."
  }
}

export async function auditTransactions(txHistory: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"
  const prompt = `
    You are a forensic financial auditor for a hospitality group. 
    Scan the following transaction history and identify any anomalies, potential errors, or suspicious patterns (e.g., unusually low prices for long stays, missing data).
    If everything looks normal, say "No major anomalies detected."
    If issues found, list them as short bullet points.
    
    Transaction History: ${txHistory}
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 250 } })
    })
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error Detail:', errorData)
      throw new Error('Failed')
    }
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No major anomalies detected."
  } catch (err) {
    console.error(err)
    return "Unable to perform audit at this time."
  }
}

export async function getKitchenInsights(activeOrders: any[]) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"

  const prompt = `
    You are an AI Kitchen Manager. Here are the active restaurant orders:
    ${JSON.stringify(activeOrders.map(o => ({ table: o.table?.number, status: o.status, items: o.items?.map((i: any) => i.menu_item?.name) })))}
    
    Task: Provide 2 very short, professional kitchen efficiency tips based on these orders.
    Example: "High volume of pasta orders; prep more dough." or "Focus on Table 5, they have been waiting 15 mins."
    Keep it extremely brief.
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 100 } })
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Kitchen is running smoothly. Keep up the pace!"
  } catch (err) {
    return "Optimize prep stations for current peak hour orders."
  }
}

export async function getSuggestiveSell(selectedItems: string[]) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDd7SCvGj0C3_VKXR933bdRH8Wl8siQCLA"

  const prompt = `
    A guest is ordering: ${selectedItems.join(', ')}.
    Task: Suggest ONE professional food pairing or drink to upsell.
    Example: "Suggest a glass of Red Wine with this Steak." or "Suggest Garlic Bread with this Pasta."
    Keep it under 10 words.
  `

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 50 } })
    })
    if (!response.ok) throw new Error('Failed')
    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
  } catch (err) {
    return ""
  }
}
