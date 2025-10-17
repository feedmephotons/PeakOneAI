#!/usr/bin/env python3
"""
Generate Peak AI Icons using OpenAI GPT Image 1
Generates transparent background icons for branding and navigation
"""

import requests
import os
import base64
from datetime import datetime
from pathlib import Path

class GPTImageGenerator:
    def __init__(self, api_key=None):
        # Get API key from parameter, environment, or fallback to error
        self.api_key = api_key or os.environ.get('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY environment variable or pass api_key parameter.")
        self.endpoint = "https://api.openai.com/v1/images/generations"

    def generate(self, prompt, size="1024x1024", quality="high", output_path=None):
        """
        Generate image with GPT Image 1

        Args:
            prompt: Text description of image to generate
            size: Image dimensions (1024x1024, 1536x1024, 1024x1536)
            quality: "high" or "standard"
            output_path: Where to save the image

        Returns:
            Path to saved image or None on failure
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "model": "gpt-image-1",
                "prompt": prompt,
                "n": 1,
                "size": size,
                "quality": quality
            }

            print(f"🎨 Generating: {output_path}")
            print(f"   Prompt: {prompt[:80]}...")

            response = requests.post(
                self.endpoint,
                headers=headers,
                json=payload,
                timeout=60
            )

            if response.status_code == 200:
                result = response.json()

                if "data" in result and len(result["data"]) > 0:
                    image_data = result["data"][0]

                    # Handle both URL and base64 responses
                    if "b64_json" in image_data:
                        # Decode base64 image data
                        image_bytes = base64.b64decode(image_data["b64_json"])

                        os.makedirs(os.path.dirname(output_path), exist_ok=True)

                        with open(output_path, "wb") as f:
                            f.write(image_bytes)

                        print(f"   ✓ Saved: {output_path}\n")
                        return output_path

                    elif "url" in image_data:
                        image_url = image_data["url"]

                        # Download and save image
                        img_response = requests.get(image_url, timeout=30)
                        if img_response.status_code == 200:
                            os.makedirs(os.path.dirname(output_path), exist_ok=True)

                            with open(output_path, "wb") as f:
                                f.write(img_response.content)

                            print(f"   ✓ Saved: {output_path}\n")
                            return output_path
                        else:
                            print(f"   ✗ Failed to download image\n")
                            return None
                    else:
                        print(f"   ✗ No url or b64_json in response\n")
                        return None
                else:
                    print(f"   ❌ No image data in response\n")
                    return None
            else:
                print(f"   ❌ API Error {response.status_code}: {response.text[:200]}\n")
                return None

        except Exception as e:
            print(f"   ❌ Exception: {str(e)}\n")
            return None

def main():
    """Generate all Priority 1 icons for Peak AI"""

    generator = GPTImageGenerator()

    # Base output directory
    base_dir = Path(__file__).parent.parent / "public" / "icons"

    print("=" * 80)
    print("PEAK AI ICON GENERATION")
    print("=" * 80)
    print()

    # Track results
    successful = []
    failed = []

    # ============================================================================
    # PRIORITY 1: BRAND LOGO ICONS
    # ============================================================================

    print("📦 GENERATING BRAND LOGO ICONS")
    print("-" * 80)

    logo_prompts = {
        "peak-logo-32.png": {
            "prompt": """
Professional minimalist logo for Peak AI technology platform.
Geometric mountain peak symbol with subtle AI neural network circuitry pattern integrated.
Clean modern design in gradient blue (#3B82F6) to purple (#8B5CF6).
Apple-inspired minimalism. Simple geometric shapes. 2px stroke weight.
Transparent background. Isolated icon. No text. No backdrop.
Vector-style with clean edges. Professional tech company aesthetic.
            """.strip(),
            "path": base_dir / "brand" / "peak-logo-32.png"
        },
        "peak-logo-64.png": {
            "prompt": """
Professional minimalist logo for Peak AI technology platform.
Geometric mountain peak symbol with subtle AI neural network circuitry pattern integrated.
Clean modern design in gradient blue (#3B82F6) to purple (#8B5CF6).
Apple-inspired minimalism. Simple geometric shapes. 2px stroke weight.
Transparent background. Isolated icon. No text. No backdrop.
Vector-style with clean edges. Professional tech company aesthetic. Larger size variant.
            """.strip(),
            "path": base_dir / "brand" / "peak-logo-64.png"
        },
    }

    for key, config in logo_prompts.items():
        result = generator.generate(
            config["prompt"],
            size="1024x1024",
            quality="high",
            output_path=str(config["path"])
        )
        if result:
            successful.append(key)
        else:
            failed.append(key)

        # Rate limiting
        import time
        time.sleep(2)

    # ============================================================================
    # PRIORITY 1: PEAK AI ASSISTANT ICON
    # ============================================================================

    print("\n🤖 GENERATING AI ASSISTANT ICON")
    print("-" * 80)

    ai_assistant_prompts = {
        "peak-ai-32.png": {
            "prompt": """
Friendly AI assistant character icon for Peak AI (named Lisa).
Minimalist geometric design. Cute friendly face/persona.
Blue-to-purple gradient (#3B82F6 to #8B5CF6) with subtle sparkle/glow effect.
Apple-inspired minimalism. Simple clean shapes. Approachable and intelligent aesthetic.
Transparent background. Isolated icon. No text. No backdrop.
Vector-style with clean edges. Suitable for chat widget and floating button.
            """.strip(),
            "path": base_dir / "ai" / "peak-ai-32.png"
        },
        "peak-ai-64.png": {
            "prompt": """
Friendly AI assistant character icon for Peak AI (named Lisa).
Minimalist geometric design. Cute friendly face/persona.
Blue-to-purple gradient (#3B82F6 to #8B5CF6) with subtle sparkle/glow effect.
Apple-inspired minimalism. Simple clean shapes. Approachable and intelligent aesthetic.
Transparent background. Isolated icon. No text. No backdrop.
Vector-style with clean edges. Larger variant for dashboard and prominent features.
            """.strip(),
            "path": base_dir / "ai" / "peak-ai-64.png"
        },
    }

    for key, config in ai_assistant_prompts.items():
        result = generator.generate(
            config["prompt"],
            size="1024x1024",
            quality="high",
            output_path=str(config["path"])
        )
        if result:
            successful.append(key)
        else:
            failed.append(key)

        # Rate limiting
        import time
        time.sleep(2)

    # ============================================================================
    # PRIORITY 1: NAVIGATION ICON SUITE
    # ============================================================================

    print("\n🧭 GENERATING NAVIGATION ICONS")
    print("-" * 80)

    nav_icons = {
        "nav-home-24.png": {
            "prompt": "Minimalist home icon. Simple house outline. 2px stroke. Rounded corners. Blue (#3B82F6). Transparent background. Clean geometric design. Apple-inspired.",
            "path": base_dir / "navigation" / "nav-home-24.png"
        },
        "nav-calls-24.png": {
            "prompt": "Minimalist phone/call icon. Simple phone handset. 2px stroke. Rounded corners. Blue (#3B82F6). Transparent background. Clean geometric design. Apple-inspired.",
            "path": base_dir / "navigation" / "nav-calls-24.png"
        },
        "nav-meetings-24.png": {
            "prompt": "Minimalist video/meeting icon. Simple video camera symbol. 2px stroke. Rounded corners. Blue (#3B82F6). Transparent background. Clean geometric design. Apple-inspired.",
            "path": base_dir / "navigation" / "nav-meetings-24.png"
        },
        "nav-tasks-24.png": {
            "prompt": "Minimalist tasks/checklist icon. Simple checkbox with checkmark. 2px stroke. Rounded corners. Blue (#3B82F6). Transparent background. Clean geometric design. Apple-inspired.",
            "path": base_dir / "navigation" / "nav-tasks-24.png"
        },
        "nav-files-24.png": {
            "prompt": "Minimalist folder/files icon. Simple folder outline. 2px stroke. Rounded corners. Blue (#3B82F6). Transparent background. Clean geometric design. Apple-inspired.",
            "path": base_dir / "navigation" / "nav-files-24.png"
        },
        "nav-messages-24.png": {
            "prompt": "Minimalist chat/message icon. Simple speech bubble. 2px stroke. Rounded corners. Blue (#3B82F6). Transparent background. Clean geometric design. Apple-inspired.",
            "path": base_dir / "navigation" / "nav-messages-24.png"
        },
        "nav-calendar-24.png": {
            "prompt": "Minimalist calendar icon. Simple calendar grid. 2px stroke. Rounded corners. Blue (#3B82F6). Transparent background. Clean geometric design. Apple-inspired.",
            "path": base_dir / "navigation" / "nav-calendar-24.png"
        },
        "nav-settings-24.png": {
            "prompt": "Minimalist settings/gear icon. Simple gear/cog wheel. 2px stroke. Rounded corners. Blue (#3B82F6). Transparent background. Clean geometric design. Apple-inspired.",
            "path": base_dir / "navigation" / "nav-settings-24.png"
        },
    }

    for key, config in nav_icons.items():
        result = generator.generate(
            config["prompt"],
            size="1024x1024",
            quality="high",
            output_path=str(config["path"])
        )
        if result:
            successful.append(key)
        else:
            failed.append(key)

        # Rate limiting
        import time
        time.sleep(2)

    # ============================================================================
    # SUMMARY
    # ============================================================================

    print("\n" + "=" * 80)
    print("ICON GENERATION COMPLETE")
    print("=" * 80)
    print(f"\n✅ Successful: {len(successful)} icons")
    print(f"❌ Failed: {len(failed)} icons")

    if successful:
        print("\n📦 Generated Icons:")
        for icon in successful:
            print(f"   ✓ {icon}")

    if failed:
        print("\n⚠️  Failed Icons:")
        for icon in failed:
            print(f"   ✗ {icon}")

    print("\n📁 Output directory: public/icons/")
    print()

if __name__ == "__main__":
    main()
