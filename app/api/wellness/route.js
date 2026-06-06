import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, exam, mood, triggers, note } = body;

    if (action === "journal_prompt") {
      const prompt = getRuleBasedJournalPrompt(exam, mood);
      return NextResponse.json({ prompt });
    }

    if (action === "wellness_tip") {
      const tip = getRuleBasedWellnessTip(exam, mood, triggers, note);
      return NextResponse.json({ tip });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function getRuleBasedJournalPrompt(exam, mood) {
  const prompts = {
    Good: [
      `Since you are feeling good today, reflect on what went well. What study strategy or mindset made this session productive?`,
      `Write about a small breakthrough you had in your ${exam || "exams"} prep recently. How did it feel?`,
      `How can you carry this positive energy into tomorrow's revisions?`,
    ],
    Okay: [
      `What is one thing that felt steady about your ${exam || "exams"} studies today, and one thing you want to release?`,
      `Reflect on a concept you understood today. How does making incremental progress feel?`,
      `If you could summarize your study pace today in three words, what would they be and why?`,
    ],
    Meh: [
      `When study motivation feels flat, what keeps you showing up? Reflect on your deep underlying 'why'.`,
      `What is a minor detail in your study desk or surroundings that you feel neutral or positive about? Let's ground ourselves.`,
      `It's okay to have quiet, uneventful days. Write down one self-care action you can do tonight to recharge.`,
    ],
    Low: [
      `Feeling low is a signal that your brain needs care. What is weighing most heavily on your mind today regarding ${exam || "your tests"}?`,
      `Write a letter of encouragement to yourself as if you were writing to a classmate who is feeling down.`,
      `What is one small boundary you can set today to protect your peace of mind (e.g. going offline 1 hour early)?`,
    ],
    Stressed: [
      `Acknowledge the physical feeling of stress. Where are you holding it in your body, and what is one thought you can let go of?`,
      `When you look at the syllabus for ${exam || "exams"}, what is the single biggest source of anxiety? Break it down into one tiny step.`,
      `Write down: 'This exam is an event in my life, not my whole life.' Reflect on what this statement means to you.`,
    ],
  };

  const selectedPrompts = prompts[mood] || prompts["Okay"];
  const randomIdx = Math.floor(Math.random() * selectedPrompts.length);
  return selectedPrompts[randomIdx];
}

function getRuleBasedWellnessTip(exam, mood, triggers = [], note = "") {
  let stressReason = triggers && triggers.length > 0 ? triggers.join(" and ") : "general workload";
  
  const tips = {
    Good: `You are in a healthy groove with your ${exam || "exam"} prep! Continue pacing yourself by incorporating a 5-minute stretch block after every 50 minutes of study. Celebrate this positive mental state by jotting down one topic you nailed today.`,
    Okay: `Pacing is everything. While studying for ${exam || "exams"}, remember that consistent progress outlasts frantic cramming. Try to maintain a clear division between study hours and sleep time. A warm cup of water and 10 minutes of screen-free relaxation tonight will keep your focus fresh.`,
    Meh: `It is completely normal for motivation to dip. When your syllabus feels uninspiring, reduce your study targets for the next block by 30%. Focus on quick active recall instead of heavy reading. Remember: done is better than perfect, and rest is part of preparation.`,
    Low: `We hear you, and it's okay to feel overwhelmed. Exam pressures like ${exam || "these tests"} can feel all-consuming, but your worth is not tied to a test score. Take 15 minutes to step outside, breathe deeply, or listen to a calming soundscape in the Focus Room. You are doing enough.`,
    Stressed: `Your nervous system is alert, which can cloud concentration. Let's reset: drop your shoulders, unclench your jaw, and take a slow breath. If you are struggling with ${stressReason}, pause the clock. Try a quick 4-7-8 breathing cycle or ground yourself with the 5-4-3-2-1 exercise. Pushing through stress leads to burnout; recovery leads to resilience.`
  };

  return tips[mood] || tips["Okay"];
}
