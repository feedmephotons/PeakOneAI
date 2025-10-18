#!/usr/bin/env python3
"""
Generate Megamenu Feature Graphics using OpenAI GPT Image 1
Creates transparent background illustrations for megamenu featured sections
"""

import requests
import os
import base64
from datetime import datetime
from pathlib import Path
import time

class GPTImageGenerator:
    def __init__(self, api_key=None):
        # Get API key from parameter or environment variable
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
    """Generate megamenu feature graphics with GPT Image 1"""

    generator = GPTImageGenerator()

    # Base output directory
    base_dir = Path(__file__).parent.parent / "public" / "graphics" / "megamenu"

    print("=" * 80)
    print("PEAK AI MEGAMENU GRAPHICS GENERATION (GPT IMAGE 1)")
    print("=" * 80)
    print()

    # Track results
    successful = []
    failed = []

    # ============================================================================
    # WORKSPACE GRAPHICS
    # ============================================================================

    print("🏢 GENERATING WORKSPACE GRAPHICS")
    print("-" * 80)

    workspace_graphics = {
        "workspace-hero.png": {
            "prompt": """
Transparent background. Minimal isometric illustration of digital workspace concept.
Simple floating geometric shapes representing dashboard windows and charts.
Clean blue (#3B82F6) to purple (#8B5CF6) gradient. Modern minimalist style.
No background. Isolated graphic. Transparent PNG.
            """.strip(),
            "path": base_dir / "workspace-hero.png"
        },
        "communication.png": {
            "prompt": """
Transparent background. Minimal isometric icons for communication tools.
Simple 3D chat bubble, video camera, and phone symbols.
Gradient blue to purple (#3B82F6 to #8B5CF6).
Clean vector style. No background. Isolated. Transparent.
            """.strip(),
            "path": base_dir / "communication.png"
        },
    }

    for key, config in workspace_graphics.items():
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
        time.sleep(2)

    # ============================================================================
    # PRODUCTIVITY GRAPHICS
    # ============================================================================

    print("\n✅ GENERATING PRODUCTIVITY GRAPHICS")
    print("-" * 80)

    productivity_graphics = {
        "productivity-hero.png": {
            "prompt": """
Transparent background. Minimal isometric productivity icons.
Simple floating Kanban board, calendar, and checkbox symbols in 3D.
Gradient green (#10B981) to blue (#3B82F6).
Clean geometric design. No background. Isolated. Transparent PNG.
            """.strip(),
            "path": base_dir / "productivity-hero.png"
        },
        "collaboration.png": {
            "prompt": """
Transparent background. Minimal isometric team collaboration concept.
Simple 3D people icons connected by lines around shared workspace.
Gradient purple (#8B5CF6) to pink (#EC4899).
Clean minimalist design. No background. Isolated. Transparent.
            """.strip(),
            "path": base_dir / "collaboration.png"
        },
    }

    for key, config in productivity_graphics.items():
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
        time.sleep(2)

    # ============================================================================
    # LISA AI GRAPHICS
    # ============================================================================

    print("\n✨ GENERATING LISA AI GRAPHICS")
    print("-" * 80)

    ai_graphics = {
        "ai-hero.png": {
            "prompt": """
Transparent background. Minimal isometric AI intelligence concept.
Simple floating neural network nodes with glowing connections.
Central AI brain icon with data streams.
Gradient blue (#3B82F6) to purple (#8B5CF6) with sparkle effects.
Clean minimalist 3D design. No background. Isolated. Transparent PNG.
            """.strip(),
            "path": base_dir / "ai-hero.png"
        },
        "ai-assistant.png": {
            "prompt": """
Transparent background. Minimal isometric AI assistant concept.
Simple chat bubbles with sparkles, microphone, and suggestion icons.
Gradient blue to purple (#3B82F6 to #8B5CF6).
Clean modern design with soft glow. No background. Isolated. Transparent.
            """.strip(),
            "path": base_dir / "ai-assistant.png"
        },
        "ai-analytics.png": {
            "prompt": """
Transparent background. Minimal isometric AI analytics concept.
Simple 3D charts, graphs, and data visualization elements.
Gradient purple (#8B5CF6) to blue (#3B82F6).
Clean floating dashboard panels. No background. Isolated. Transparent PNG.
            """.strip(),
            "path": base_dir / "ai-analytics.png"
        },
    }

    for key, config in ai_graphics.items():
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
        time.sleep(2)

    # ============================================================================
    # SETTINGS GRAPHICS
    # ============================================================================

    print("\n⚙️ GENERATING SETTINGS GRAPHICS")
    print("-" * 80)

    settings_graphics = {
        "settings-hero.png": {
            "prompt": """
Transparent background. Minimal isometric settings concept.
Simple 3D gear icons, toggle switches, and configuration panels.
Gradient gray to blue (#6B7280 to #3B82F6).
Clean minimalist design. No background. Isolated. Transparent PNG.
            """.strip(),
            "path": base_dir / "settings-hero.png"
        },
    }

    for key, config in settings_graphics.items():
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
        time.sleep(2)

    # ============================================================================
    # SUMMARY
    # ============================================================================

    print("\n" + "=" * 80)
    print("MEGAMENU GRAPHICS GENERATION COMPLETE")
    print("=" * 80)
    print(f"\n✅ Successful: {len(successful)} graphics")
    print(f"❌ Failed: {len(failed)} graphics")

    if successful:
        print("\n📦 Generated Graphics:")
        for graphic in successful:
            print(f"   ✓ {graphic}")

    if failed:
        print("\n⚠️  Failed Graphics:")
        for graphic in failed:
            print(f"   ✗ {graphic}")

    print(f"\n📁 Output directory: public/graphics/megamenu/")
    print()

if __name__ == "__main__":
    main()
