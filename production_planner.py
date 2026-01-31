# production_planner.py
import os
import json
from dotenv import load_dotenv

load_dotenv()

try:
    from openai import OpenAI
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        client = OpenAI(api_key=api_key)
        OPENAI_AVAILABLE = True
    else:
        print("⚠️ OPENAI_API_KEY not found in .env file")
        OPENAI_AVAILABLE = False
        client = None
except ImportError:
    print("⚠️ OpenAI package not installed. Install with: pip install openai")
    OPENAI_AVAILABLE = False
    client = None
except Exception as e:
    print(f"⚠️ OpenAI client initialization failed: {e}")
    OPENAI_AVAILABLE = False
    client = None

PRODUCTION_PROMPT = """You are a professional film production planner, line producer, and risk assessment expert.

TASK:
Given:
1. A movie/script text
2. A total production budget (numeric value)

Your job is to analyze the script and produce a complete production breakdown that includes:
- Scene division
- Budget allocation
- Safety requirements
- Risk identification and classification

INSTRUCTIONS:

Step 1: Scene Breakdown
- Divide the script into logical scenes.
- Each scene must include:
  - Scene number
  - Scene title (short descriptive name)
  - Location (indoor/outdoor)
  - Time of day (day/night)
  - Brief scene description

Step 2: Budget Allocation
- Allocate the given total budget across all scenes.
- Ensure:
  - Total allocated budget = total budget provided
  - Allocation is realistic based on scene complexity
- For each scene, break budget into:
  - Cast & crew
  - Location & set
  - Props & costumes
  - Equipment & technical
  - Special effects / stunts (if any)
  - Miscellaneous

Step 3: Safety Requirements
- Identify safety measures required for each scene.
- Consider:
  - Physical safety
  - Environmental hazards
  - Equipment usage
  - Crowd management
  - Fire, water, heights, vehicles, weapons, or animals (if applicable)

Step 4: Risk Identification & Classification
- Identify potential risks for each scene.
- Classify each risk as:
  - Low
  - Medium
  - High
- For each risk, provide:
  - Risk description
  - Risk level
  - Mitigation strategy

Step 5: Budget Optimization Check
- Verify that the entire production stays within budget.
- If a scene is high-cost:
  - Suggest cost-saving alternatives without affecting story quality.

OUTPUT FORMAT (STRICT JSON):
Return the response strictly in valid JSON using the following structure:

{
  "total_budget": number,
  "scenes": [
    {
      "scene_number": number,
      "scene_title": string,
      "location": string,
      "time_of_day": string,
      "description": string,
      "budget": {
        "total_scene_budget": number,
        "breakdown": {
          "cast_and_crew": number,
          "location_and_set": number,
          "props_and_costumes": number,
          "equipment_and_technical": number,
          "special_effects_and_stunts": number,
          "miscellaneous": number
        }
      },
      "safety_measures": [
        string
      ],
      "risks": [
        {
          "risk_description": string,
          "risk_level": "Low | Medium | High",
          "mitigation": string
        }
      ]
    }
  ],
  "budget_summary": {
    "total_allocated": number,
    "remaining_budget": number
  }
}

IMPORTANT RULES:
- Do NOT exceed the total budget.
- Be realistic and industry-standard.
- Do NOT include any explanation outside the JSON.
- Output must be directly usable by a software application."""

def generate_production_plan(script_text: str, total_budget: float):
    """Generate production breakdown using OpenAI"""
    
    if not OPENAI_AVAILABLE or not client:
        return {
            "error": "OpenAI API not available. Please check your API key configuration."
        }
    
    try:
        prompt = f"{PRODUCTION_PROMPT}\n\nScript:\n{script_text}\n\nTotal Budget: ${total_budget:,.2f}"
        
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4"),
            messages=[
                {"role": "system", "content": "You are a professional film production planner. Always return valid JSON only, no explanations."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=4000,
            temperature=0.7
        )
        
        content = response.choices[0].message.content.strip()
        
        # Try to extract JSON if wrapped in markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        # Parse JSON
        result = json.loads(content)
        
        # Validate structure
        if "scenes" not in result or "total_budget" not in result:
            return {"error": "Invalid response format from AI"}
        
        return result
        
    except json.JSONDecodeError as e:
        print(f"⚠️ JSON decode error: {e}")
        print(f"Response content: {content[:500]}")
        return {"error": f"Failed to parse AI response as JSON: {str(e)}"}
    except Exception as e:
        print(f"⚠️ Error generating production plan: {e}")
        return {"error": f"Error generating production plan: {str(e)}"}

