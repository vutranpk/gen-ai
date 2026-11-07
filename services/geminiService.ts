
import { GoogleGenAI, Type, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { CameraAngle, ProductCategory, FramingMode, ProductGender, ModelPose, ModelDna, SceneMode } from '../types';

// ==========================================
// UTILS
// ==========================================
const cleanBase64 = (base64: string | null | undefined): string => {
  if (!base64) return "";
  let cleaned = base64.trim();
  if (cleaned.includes(',')) {
    cleaned = cleaned.split(',')[1];
  }
  return cleaned.replace(/\s/g, '');
};

export const getGoogleGenAI = () => {
  const baseUrl = process.env.GEMINI_BASE_URL;
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey, ...(baseUrl ? { httpOptions: { baseUrl } } : {}) });
  return ai;
}

// ==========================================
// MANDATORY SYSTEM CONSTRAINTS
// ==========================================
const CORE_PRODUCT_CONSTRAINTS = `
CRITICAL CORE RULES - LUXURY FASHION EDITORIAL MANDATE:

0. SUPREME ANATOMICAL INTEGRITY & SPATIAL COLLISION LOCK (CRITICAL):
   - ABSOLUTE ANATOMICAL CORRECTNESS: Every image MUST be anatomically perfect. NO EXCEPTIONS.
   - HAND & FOOT PRECISION (SUPREME): Exactly 5 fingers per hand and 5 toes per foot. Fingers must be distinct, well-defined, and naturally separated. Absolutely NO melted fingers, NO fused digits, NO extra fingers, NO "spaghetti" fingers.
   - NO LIMBS FROM AIR: Arms and legs MUST be naturally attached to the torso. Absolutely NO limbs growing from the background, air, or incorrect body parts. No "tay mọc ra từ không khí".
   - NO MISSING LIMBS: Every person in the frame must have all their limbs (2 arms, 2 legs) unless they are naturally occluded by the body or framing. Absolutely NO "vụt tay cụt chân" (missing limbs).
   - SPATIAL COLLISION LOCK (KHÓA VA CHẠM): The model and product MUST NOT penetrate, phase through, or clip into any solid objects. 
   - GLASS & WINDOW INTEGRITY: Absolutely NO "phasing through glass" (xuyên kính) or "hand merging with window sill". Glass and frames are solid barriers.
   - SYMMETRY LOCK: Left and right limbs MUST be identical in scale, length, and thickness. Absolutely NO "chân dài chân ngắn" (uneven leg lengths). 
   - NO GHOST LIMBS: In creative or dynamic poses, do not sprout extra arms or legs from the air, background, or body. Every limb must have a clear, anatomically correct origin point.
   - ASYMMETRICAL FIDELITY: For items with asymmetrical design (like shoes with logos only on the outer side), the AI must preserve this asymmetry. Do not force logos onto sides where they don't exist.
   - JOINT INTEGRITY: All joints must be correctly placed and have natural rotation. NO broken joints, NO dislocated limbs, NO "melted" anatomy.

1. SUPREME PHOTOREALISM & CAMPAIGN FIDELITY:
   - IMAGE FRUIT (CHẤT ẢNH): The output MUST look like a raw, unedited, high-resolution 100MP RAW file from a Sony Alpha or Hasselblad. Absolutely NO "AI-smooth", "render-like", or "plastic" aesthetics.
   - SKIN INTEGRITY (CRITICAL): Preserve absolute skin micro-detail. Include pores, fine peach fuzz (vellus hair), natural micro-imperfections, and realistic skin moisture. Skin must show "subsurface scattering" where light penetrates the ears or nostrils naturally. NO airbrushed or filtered "beauty" skin.
   - OPTICAL CHARACTERISTICS: Simulate real lens physics—natural chromatic aberration at edges, organic bokeh (not gaussian blur), and realistic depth of field.
   - THE "ANTI-AI" RULE: AI often generates skin that is too uniform. You MUST introduce subtle "organic chaos"—irregular hair strands, natural skin creases at joints, and realistic variation in skin tone.
   - NO PLASTICITY: Textures for metal, leather, and fabric must be tactile and hyper-detailed (visible weave, grain, or brushed finish).
   - Lighting Mastery: Use natural, cinematic, or professional studio lighting that creates realistic, directional shadows and highlights. Avoid perfectly flat or "magical" AI lighting.
   - CONTACT PHYSICS (CRITICAL): Every object (product, jewelry, model) MUST have accurate "Contact Shadows" and "Ambient Occlusion" where it touches another surface. No object should look like it is floating or "pasted" on.
   - SCENE & LIGHTING SYNCHRONIZATION: The background and lighting MUST match the specified context and the reference background image exactly.
   - Post-Production (HẬU KỲ CHỈNH CHU): The final image must look like it has undergone a meticulous post-production process in a professional studio (e.g., Capture One, Photoshop). This includes clean, natural color balance, contrast enhancement, and subtle retouching that PRESERVES texture. It is NOT a raw, unedited file, but it MUST NOT look like a digital illustration or a heavily filtered vintage photo.
   - Depth of Field: Use realistic depth of field (f/1.2 - f/4.0) to create a natural, organic separation between the subject and the background.

2. ULTRA-HIGH PRODUCT FIDELITY (GROUND TRUTH):
   - Pixel-Perfect Replay: Colors, shapes, physical structure, materials, and design must match the source product image 100%.
   - Complex Detail Preservation: Preserve every stitch, logo, and characteristic material.
   - PRODUCT IDENTITY: The product images provided are the ABSOLUTE GROUND TRUTH. If there is any conflict between the text description and the product images, the PRODUCT IMAGES take precedence.
   - NO HALLUCINATION: Do not invent, add, or modify any design elements of the product.
   - DIRECTIONAL LOGO LOCK (CRITICAL): You MUST respect the directional orientation of any logos or patterns (e.g., the Skechers 'S' or Nike Swoosh). Logos must face the correct direction relative to the product's front/toe. For pairs (like shoes), ensure the orientation is correctly handled for the left vs. right side—DO NOT mirror logos that are not supposed to be mirrored.
   - INTERNAL COMPONENT PROPORTIONS (CRITICAL): The relative scale and ratio between different parts of the product (e.g., dial vs. case, strap width vs. watch face, buckle size vs. strap) MUST be preserved with 100% accuracy. Do not alter the internal geometry of the product.
   - NO CREATIVE DEVIATION: You are NOT allowed to be "creative" with the product's design. The product must be rendered exactly as it appears in the ground truth images.
    - ASPECT RATIO INTEGRITY: Absolutely no stretching or distorting the product. If a product has a narrow ratio (like rectangular glasses), it must remain narrow. Do not square or round the product.
    - PRECISION GEOMETRY: For watches and eyewear, the shape of the dial and frame is immutable. A square watch face must not become a rounded rectangle. Narrow rectangular glasses must not become square.
   - PRODUCT-TO-MODEL SCALE MANDATE: Products must be realistically scaled and proportioned to the model. For example, a watch size must be realistic relative to the model's wrist.
   - WATCH SCALE MANDATE (VISUAL & CONTEXTUAL PRECISION): For watches, especially small ladies' watches (e.g., 22mm-28mm), you MUST enforce the "Petite/Miniature" scale. AI models often enlarge small watches for visibility; you MUST prevent this by using visual context:
        *   VISUAL RELATIONSHIP: Describe the watch as "petite", "delicate", "miniature", "micro-miniature", or "tiny-faced". The watch face must occupy only a SMALL PORTION (less than 40%) of the wrist width.
        *   WRIST CONTEXT: Specify a "slim, delicate, ultra-refined female wrist". The watch must look like a subtle, understated accessory, NOT a centerpiece.
        *   STRAP PROPORTION: The strap must be "ultra-narrow", "slim", and "fine-link", clearly thinner than a standard watch band. It should look like a delicate bracelet.
        *   FORBIDDEN TERMS: Avoid "statement watch", "bold", "centerpiece", or "standout" for small watches. Use "discreet luxury", "understated", "subtle detail", and "barely-there presence" instead.
        *   MATHEMATICAL ANCHOR: The watch face diameter (e.g., 22mm) must be visually consistent with a 14-16cm female wrist. It should NOT cover the entire top of the wrist.
   - JEWELRY PLACEMENT (CRITICAL): The pendant of a necklace MUST always favor the model's front (chest/clavicle). Unless a "back-lace" is specifically requested, you are FORBIDDEN from placing the pendant on the model's back, even in over-the-shoulder poses.
   - JEWELRY SCALE MANDATE: All jewelry (earrings, necklaces, rings, bracelets) MUST be rendered with 100% realistic scale relative to the model's anatomy. Earrings must be micro-miniature (8-12mm), necklaces must have tiny pendants (6-10mm), and rings must be ultra-delicate (1.0-1.5mm band). Absolutely NO oversized, "statement", or "bold" jewelry unless explicitly requested. Jewelry should be a subtle, high-end detail, not the focal point.
    - BACKGROUND REPLACEMENT: Absolutely DO NOT use the original background from the product image. AI must extract the product and place it in the new background described in "Idea Description" or "Reference Image". The old background is only for lighting and reflection reference.

3. SINGLE PRODUCT ENFORCEMENT (CRITICAL):
   - ONE PRODUCT PER IMAGE: There MUST be ONLY ONE instance of the main product in the image.
   - NO DOUBLE WATCHES: If the product is a watch, there MUST be ONLY ONE watch on ONLY ONE wrist. Absolutely NO "hai đồng hồ trên một tay" (two watches on one arm).
   - NO CLONING: Do not clone, duplicate, or repeat the product in the same frame.
   - PRODUCT FOCUS: The single product must be the clear focal point of the composition.

4. MODEL GROOMING & ANATOMY (CRITICAL):
   - HAND & SKIN GROOMING (FEMALE): Female models MUST always have beautiful, slender, and well-groomed hands. Nails must be short to medium length, elegantly shaped (oval or almond), with a clean, high-end neutral or "nude" polish (e.g., soft beige, pale pink, or clear gloss). Skin must be smooth, hydrated, and flawless, with no visible blemishes or imperfections. This is CRITICAL for jewelry, watch, and handbag photography.
   - ANATOMICAL CORRECTNESS: All body parts must be anatomically correct. Absolutely NO extra fingers, NO distorted limbs, and NO "broken" joints.
`;

const MODEL_CONSTRAINTS = `
4. ANATOMICAL INTEGRITY & MODEL STANDARDS (SUPREME MANDATE):
   - ANATOMICAL CORRECTNESS: MANDATORY. All body parts must be anatomically correct and physically plausible. NO ANATOMICAL DISTORTIONS. Knees, elbows, and feet must point in natural directions relative to the body's orientation. 
   - SYMMETRY LOCK: Left and right limbs MUST be identical in scale, length, and thickness. Absolutely NO "chân dài chân ngắn" (uneven leg lengths). 
   - NO GHOST LIMBS: In creative or dynamic poses, do not sprout extra arms or legs from the air, background, or body. Every limb must have a clear, anatomically correct origin point.
   - ASYMMETRICAL FIDELITY: For items with asymmetrical design (like shoes with logos only on the outer side), the AI must preserve this asymmetry. Do not force logos onto sides where they don't exist.
   - JOINT INTEGRITY: All joints must be correctly placed and have natural rotation. NO broken joints, NO dislocated limbs, NO "melted" anatomy.
   - PERSPECTIVE & FORESHORTENING: When the model is in a dynamic pose, ensure that foreshortening is rendered accurately. Limbs that are closer to the camera should be larger, and limbs further away should be smaller, but they must always maintain their anatomical relationship. Absolutely NO "chân dài chân ngắn" where one leg is abnormally longer than the other due to poor perspective rendering.
   - SYMMETRY & PROPORTION: The model MUST have perfectly balanced and symmetrical limbs. Chân và tay phải có độ dài tương đồng và tỉ lệ thuận với cơ thể. Absolutely NO uneven leg lengths (chân dài chân ngắn), NO distorted shins, and NO abnormally short or long limbs. Ensure the left and right sides of the body are balanced in scale and length.
   - CHARACTER CONSISTENCY & IDENTITY ANCHOR (SUPREME): The provided reference image is the ABSOLUTE IDENTITY ANCHOR. You MUST replicate the exact facial geometry, bone structure, eye shape, nose structure, and lip shape of the person in the reference image. Do not generate a generic or different person. Do not "beautify" or change the face into a generic AI model. The model's identity must be 100% consistent and recognizable as the same individual across all generated images.
   - FACIAL DNA LOCK: Every facial feature (eye color, eyebrow shape, nose bridge, lip fullness, jawline) must match the reference image perfectly. Absolutely NO "face swapping" or "face blending" with generic models.
   - NO FLOATING LIMBS (KHÔNG TAY CHÂN DƯ): Every arm and leg MUST be naturally and anatomically attached to the torso. Absolutely NO limbs growing from the air, background, or walls. No "tay mọc ra từ không khí".
   - NATURAL SKIN TEXTURE: MANDATORY. Render realistic skin with visible pores, natural imperfections, and fine details. Absolutely NO plastic, smooth, or artificial skin textures.
   - MATHEMATICAL PROPORTION: Use the provided body measurements (Bust, Waist, Hip, Wrist, Ankle, Head size) to maintain a realistic and high-fashion 9-head proportion. The ratio of limb length to torso must be anatomically correct.
    - PHYSICAL PLAUSIBILITY & CLIPPING: Fabric and limbs must interact realistically with the environment. Absolutely NO clipping through objects. Limbs must not pass through glass (xuyên kính), furniture, or props. Glass is a solid, reflective barrier.
    - SPATIAL AUDIT: Before generating, ensure the model is positioned correctly relative to background elements. No part of the model should occupy the same 3D space as a solid object.
   - 9-HEAD PROPORTION: All models must adhere to high-end fashion 9-head proportions: exceptionally long legs, slender back, and an elegant long neck. The head size must be small and proportional to the body height to create a statuesque, tall appearance.
   - HEIGHT & ELONGATION MANDATE: MANDATORY. Every model MUST look tall, statuesque, and elongated. Avoid any "short", "stumpy", or "compressed" body proportions.
   - LEG INTEGRITY: For footwear-focused shots, AI must ensure balanced leg proportions; shin and calf lengths must be anatomically natural. No distorted, abnormally short/long shins.
   - FRAMING RESPECT: If Close-up or Product Focus is selected for shoes/accessories, AI MUST crop out irrelevant body parts (like face, chest) to focus entirely on the product.
   - FEMALE AESTHETICS: Female models must have a statuesque and graceful hourglass silhouette with a refined, slim waist, a fuller and well-defined bust, and elegant, toned curves. High-fashion posture with a long, graceful neck and defined collarbones.
   - MALE AESTHETICS: Male models must have a chiseled and authoritative V-taper physique with broad, powerful shoulders and a lean, athletic waist. Defined yet natural musculature, conveying strength and professional fitness model standards.
   - Neck & Shoulder Relaxation: The neck must have a natural tilt, shoulders relaxed. Avoid "stiff neck" or high-shrugged shoulders.
    - Dynamic Flow: Models must have natural, elegant poses, not stiff like a mannequin. Avoid overly complex or contorted poses that could lead to anatomical distortions.
    - DYNAMIC POSING & LEADING LINES (CRITICAL): 
      * NO HANGING ARMS: Avoid poses where both arms just hang straight down (tay buông thõng). This looks stiff and "AI-generated".
      * LEADING LINES (ĐƯỜNG DẪN MẮT): Use the model's arms, hands, and legs as geometric leading lines that point directly towards the product (e.g., a hand touching a necklace, an arm framing a watch, legs leading towards shoes).
      * ENVIRONMENTAL INTERACTION (CRITICAL): The model MUST interact with the environment. Hands should touch surfaces, lean on props, or interact with clothing/accessories. This creates a sense of "presence" and "reality".

7. SPATIAL ANCHORING & PHYSICAL INTERACTION (SUPREME MANDATE):
   - ACTIVE ANCHORING: The model MUST NOT appear to be floating or "pasted" onto the background. They must be physically anchored to the environment.
   - SURFACE CONTACT: If the model is sitting, they MUST sit ON a specific object present in the background (e.g., a chair, a ledge, a rock). If leaning, they MUST lean AGAINST a specific surface (e.g., a wall, a pillar, a car).
   - WEIGHT DISTRIBUTION: The model's pose must reflect realistic weight distribution based on their interaction with the environment. For example, if leaning, the body should show a natural tilt and pressure against the surface.
   - SHADOW SYNCHRONIZATION: Contact points between the model and the environment MUST have realistic contact shadows (ambient occlusion) to ground them in the scene.
   - NO "GHOST" POSES: Absolutely NO sitting or leaning in empty space. Every pose must be justified by the physical elements in the background.
   - SPATIAL COLLISION LOCK: The model and product MUST NOT penetrate, phase through, or clip into any solid objects. Respect all environmental boundaries and physical depth.

8. FACE DIVERSITY & UNIQUENESS MANDATE (CRITICAL - ANTI-REPETITION):
   - NO "MODE COLLAPSE": Avoid generating the same "default AI face". You MUST explicitly vary the facial DNA for every generation.
   - FACIAL FEATURE VARIATION: Randomize and describe specific facial features: vary the nose bridge (straight, slightly curved, refined), eye shape (almond, hooded, upturned), lip fullness, and cheekbone prominence.
   - MICRO-IMPERFECTIONS: To achieve 100% realism and avoid the "plastic AI look", you MUST include subtle micro-imperfections: natural skin pores, very subtle facial asymmetry, fine lines around the eyes when smiling, and realistic skin undertones (warm, cool, olive).
   - UNIQUE IDENTITY: Every model must look like a unique individual with a distinct personality and "soul", not a generic beauty archetype.

5. ARTISTIC GROOMING & ACCESSORY PRECISION:
   - Hair & Makeup: Must meet "Red Carpet" or "Runway" standards. Hair must be glossy, silky, healthy, and perfectly groomed. Absolutely NO unkempt, dry, or messy hair (không được sơ xác). Makeup must be sharp, luxurious, and professionally applied.
   - Fixed Accessories: If jewelry (earrings, necklaces, watches) is requested, AI must keep this design consistent throughout the shoot. Describe materials (18k gold, D-color diamond, South Sea pearl) to create a "luxury" feel.

6. FULL CLOTHING & STYLING MANDATE (CRITICAL):
   - FULL OUTFIT: Models MUST always be fully, politely, and luxuriously styled. Absolutely NO shirtless/topless models, even if the product is a small accessory or footwear.
   - COORDINATION: Accompanying clothing must be perfectly harmonious and celebrate the main product. The outfit must look like it was curated by a world-class fashion stylist for a luxury brand campaign (e.g., Chanel, Dior, Saint Laurent).
   - MATERIAL QUALITY: Describe high-end fabrics (heavyweight silk, Loro Piana cashmere, fine wool, structured crepe, crisp Italian poplin) to ensure the clothing looks expensive and high-quality.
   - MODESTY: Ensure modesty and professionalism in every frame.
   - STYLING HARMONY: The outfit must match the "Vibe" and "Category" perfectly. No clashing styles, no cheap-looking garments, and no "fast fashion" aesthetics.
   - TOTAL LOOK: Every element (clothing, shoes, accessories) must work together to create a cohesive, high-end "Total Look".
`;

const DEFAULT_FEMALE_JEWELRY = `
- BRAND STANDARD JEWELRY (MANDATORY EARRINGS & NECKLACE): You MUST style the female model with the "Brand Standard" earrings and necklace.
- EARRINGS: Use the "Brand Standard Earrings" (High-end, sophisticated design, miniature scale 10-15mm). They MUST always be visible if the head is in the frame.
- NECKLACE: Use the "Brand Standard Necklace" (Fine chain with an elegant pendant, scale 8-12mm). It MUST always be visible if the neck/chest area is in the frame.
- RING: Use ONLY ONE "Brand Standard Ring" (Minimalist fine-band, 1.5mm width). ONLY use if hands are prominent and it adds to the aesthetic.
- AESTHETIC: The jewelry must be rendered with 100% realistic scale, appearing as subtle, high-end editorial details. Absolutely NO oversized or flashy pieces.
`;

const VIBE_STYLING_MANDATES: Record<string, string> = {
  'Natural': `### NATURAL VIBE DIRECTIVE ###
- [STYLING]: Casual, approachable everyday wear. Linen, soft cotton, comfortable fit (Quần áo mặc hàng ngày, chất liệu mềm mại, thoải mái).
- [HAIR & MAKEUP]: Messy bun or loose natural hair. "No-makeup" makeup look, fresh glowing skin, subtle lip tint.
- [LIGHTING & SCENE]: Dappled sunlight, bright and airy afternoon light. Home interior or outdoor cafe background.
- [NEGATIVE CONSTRAINTS]: (No suits, no formal wear, no heavy makeup, no studio flash).`,

  'Minimalism': `### MINIMALISM VIBE DIRECTIVE ###
- [STYLING]: Sleek and minimal, structural clean lines, solid neutral monochrome tones (beige, off-white, black), zero branding. Architectural garments (Phong cách tối vản, phom dáng hình học, tối giản tinh tế, tông màu trung tính như beige, kem, đen).
- [HAIR & MAKEUP]: Sharp geometric bob, ultra-straight polished hair or clean low ponytail. Nude skin, strong bone structure/contour, raw neutral look.
- [LIGHTING & SCENE]: Soft diffused gallery lighting. Architectural space, cast concrete, or textured limestone beige walls with clean geometric shadows.
- [NEGATIVE CONSTRAINTS]: (No busy prints, no heavy jewelry, no complex patterns, no clutter).`,

  'Luxury': `### LUXURY VIBE DIRECTIVE ###
- [STYLING]: Elite high-fashion couture, dramatic rich silk or fine cashmere, tailored exquisite suits or high-end evening gowns (Thời trang cao cấp xa xỉ, lụa tơ tằm, dạ cashmere, phom dáng couture sắc sảo).
- [HAIR & MAKEUP]: Extremely polished tight low bun, high-shine hair, or elegant waves. Flawless glowing skin, bold graphic eyes or deep velvet designer lips.
- [LIGHTING & SCENE]: Breathtaking editorial campaign lighting, warm polished marble, subtle champagne gold trim accents, beautiful studio rim-lights.
- [NEGATIVE CONSTRAINTS]: (No casual streetwear, no athletic wear, no cheap fabrics, no messy styles).`,

  'Vintage': `### VINTAGE VIBE DIRECTIVE ###
- [STYLING]: Classic 70s-90s vintage European charm, retro tailored coats, rich textures like corduroy, soft leather, or premium knits (Phong cách vintage cổ điển Âu Châu thập niên 70-90, trench coat, len dệt và da thuộc mềm).
- [HAIR & MAKEUP]: Soft retro wave, beautiful 90s blowout. Soft matte porcelain finish, vintage winged eyeliner, brick-red or warm nude lips.
- [LIGHTING & SCENE]: Rich medium-format film look, warm nostalgic golden hour sunrays, mahogany wood accents or cream vintage car interior.
- [NEGATIVE CONSTRAINTS]: (No neon lighting, no futuristic tech elements, no generic grey digital backdrops).`,

  'Sport': `### SPORT VIBE DIRECTIVE ###
- [STYLING]: High-performance activewear, technical fabrics, breathable mesh, compression leggings or trackpants. Dynamic and aerodynamic fit (Đồ tập, vải dù, vải thun lạnh, bó cơ hoặc đồ dù năng động).
- [HAIR & MAKEUP]: Swept-back high ponytail or tight braids. Sweat-glowing skin, minimal athletic makeup.
- [LIGHTING & SCENE]: High-contrast stadium lighting or harsh direct outdoor sunlight. Running track, tennis court, or modern gym background.
- [NEGATIVE CONSTRAINTS]: (No casual clothes, no luxury accessories, no jeans).`,

  'Streetwear': `### STREETWEAR VIBE DIRECTIVE ###
- [STYLING]: Oversized fit, baggy cargo pants, graphic hoodies, heavy denim, chunky sneakers. Edgy hypebeast aesthetic (Đồ form rộng, quần túi hộp, denim dày, phong cách hypebeast).
- [HAIR & MAKEUP]: Textured messy hair, buzzcut, or wearing a beanie/cap. Edgy graphic eyeliner or bold street makeup.
- [LIGHTING & SCENE]: Harsh flash photography style, neon city lights, or gritty concrete alleyway.
- [NEGATIVE CONSTRAINTS]: (No tailored suits, no elegant dresses, no clean studio).`,

  'Studio': `### STUDIO VIBE DIRECTIVE ###
- [STYLING]: Structural, clean lines, monochrome color palette (black, white, grey, beige). No logos, no distractions.
- [HAIR & MAKEUP]: Sleek slicked-back hair or flawless straight bob. Matte finish skin, structured contour, completely neutral makeup.
- [LIGHTING & SCENE]: Soft diffused softbox lighting. Pure white, light grey, or neutral seamless paper backdrop. Zero background elements.
- [NEGATIVE CONSTRAINTS]: (No cluttered background, no messy hair, no bright colors).`,

  'OldMoney': `### OLD MONEY VIBE DIRECTIVE ###
- [STYLING]: Tailored fit, premium cashmere, tailored wool trousers, polo shirts, loafers. Timeless, quiet luxury, neutral earth tones (Đồ cắt may vừa vặn, len cashmere, quần âu, tĩnh lặng và đắt tiền).
- [HAIR & MAKEUP]: Impeccably styled blowout or neat side-part. Classic red lip or sophisticated neutral palette, flawless matte skin.
- [LIGHTING & SCENE]: Soft natural light filtering through sheer curtains, or warm golden hour. European estate, vintage yacht, or luxury country club background.
- [NEGATIVE CONSTRAINTS]: (No logos, no streetwear, no messy clothes, no cheap fabrics).`,

  'Cinematic': `### CINEMATIC VIBE DIRECTIVE ###
- [STYLING]: Avant-garde, dramatic silhouettes, high-fashion editorial styling.
- [HAIR & MAKEUP]: Editorial wet hair look or sculptural hair. Glossy skin, dramatic bold eyeshadow or dark moody lips.
- [LIGHTING & SCENE]: Moody chiaroscuro lighting, harsh shadows, rim lighting (đánh sáng viền). Foggy or cinematic movie-set background.
- [NEGATIVE CONSTRAINTS]: (No flat lighting, no bright happy daylight, no standard casual clothes).`
};

const CHLOE_STYLING_MANDATE = `
### CHLOE SPECIAL STYLING MANDATE (FOR NON-APPAREL PRODUCTS) ###
MANDATORY CONTEXTUAL INTELLIGENCE: When the model is Chloe (Quynh Chi) and the product is NOT apparel (e.g., Bags, Watches, Accessories, Shoes, Mockups), you MUST perform a "Contextual Synthesis" of her outfit. Do NOT just pick a category mechanically.

1. ANALYZE THE BACKGROUND SOUL: Identify the materials (marble, concrete, silk, wood), the lighting (hard sun, soft studio, neon), and the setting (luxury hotel, street, nature).
2. DERIVE THE OUTFIT: Design an outfit that Chloe would naturally wear in this SPECIFIC location to celebrate the product.
   - [URBAN/TECH]: If the background is modern city or tech, use "Gen Z High-street" - oversized luxury knits, technical fabrics, or sharp futuristic silhouettes that echo the architecture.
   - [LUXURY/HERITAGE]: If the background is a classic interior or hotel, use "Contemporary Designer" - archival cuts, sculptural blazers, or high-fashion minimalism (Jacquemus/The Row style).
   - [RAW/EDGY]: If the background is industrial or street, use "Streetwear-chic" - a mix of raw textures (leather, distressed denim) with hyper-refined designer layers.
3. COLOR & MATERIAL LOCK: The outfit's colors MUST be pulled from the background's palette or be a deliberate high-fashion contrast. Textures must interact with the environment (e.g., "silk reflecting the pool light" or "wool contrasting with raw concrete").
[ANTI-MECHANICAL RULE]: You are strictly forbidden from simply outputting a styling label. You must describe the SPECIFIC garments and how they respond to the background's soul.
`;

const CHLOE_IDENTITY_MANDATE = `
### IDENTITY CONSISTENCY - QUYNH CHI/CHLOE (SUPREME MANDATE) ###
The provided MODEL REFERENCE IMAGE for Chloe (Quynh Chi) is a MULTI-ANGLE PROFILE (Front, Isometric 45°, Side, Expression). You MUST use all 4 angles to synthesize a perfect, 100% consistent likeness.
- FACIAL DNA: Replicate the exact shape of her almond eyes, the specific bridge and tip of her nose, and her refined jawline from all provided perspectives.
- CONSISTENCY: The person generated must be unmistakably recognized as the person in the profile image. No facial drift.
`;

const NGAN_VU_IDENTITY_MANDATE = `
### IDENTITY CONSISTENCY - NGAN VU / SARAH (SUPREME MANDATE) ###
The provided MODEL REFERENCE IMAGE for Sarah (Ngan Vu) is a MULTI-ANGLE PROFILE. You MUST use all angles to synthesize a perfect, 100% consistent likeness.
- FACIAL DNA: Replicate her specific eye shape, soft greyish-brown contacts look (if applicable), V-shaped face, and warm beige skin tone.
- CONSISTENCY: The person generated must be unmistakably recognized as the person in the profile image. No facial drift.
`;

const JEWELRY_INTEGRATION_MANDATE = `
### JEWELRY PHYSICAL INTEGRATION (ANTI-STICKER RULE) ###
To prevent jewelry from looking "pasted on", follow these physical laws:
1. CONTACT SHADOWS: Generate micro-shadows where the chain touches the skin and where the pendant rests on the chest.
2. SKIN INTERACTION: The necklace chain must appear to have weight, subtly conforming to the curves of the neck and collarbone.
3. REFLECTIONS: Polished gold/silver surfaces MUST reflect the colors and light sources of the surrounding environment (Environment Mapping).
4. AMBIENT OCCLUSION: There must be a dark, soft occlusion zone behind earrings and under pendants to ground them in 3D space.
`;

const STYLING_GUIDE = `
### LUXURY STYLING & OUTFIT COORDINATION MANDATE (CRITICAL) ###
${JEWELRY_INTEGRATION_MANDATE}
${CHLOE_STYLING_MANDATE}
You are a world-class Fashion Stylist and Art Director. Your task is to coordinate the model's outfit to be perfectly harmonious with the product, the vibe, and the environment. 

0. PRINCIPLE OF VISUAL CONTINUITY (SUPREME RULE):
   - If a REFERENCE IMAGE or SOURCE IMAGE is provided, it is the PRIMARY ground truth.
   - OUTFIT & POSE: You MUST preserve the core silhouette, garment types, and pose of the subject in the reference image. Do not change a dress into a suit, or a sitting pose into a walking one, unless specifically requested.
   - UPGRADE, DON'T REWRITE: Your job is to "expand" or "editorialize" the existing elements. Improve the materials (e.g., from generic cotton to "sculptural wool"), refine the tailoring, and optimize the lighting while respecting the original visual concept.

1. STYLING LOGIC (THE ART DIRECTOR'S EYE):
   - ANALYZE THE PRODUCT FIRST: Identify the product's primary material (e.g., gold, steel, leather, silk), color, and "soul" (e.g., sporty, elegant, avant-garde).
   - BACKGROUND RESONANCE (CRITICAL): The outfit MUST be a direct response to the background's materials and vibe. If the background has concrete and steel, use structured edge. If it's silk and marble, use flowing luxury.
   - CREATE VISUAL BALANCE: If the product is complex/detailed, keep the outfit minimalist. If the product is minimalist, the outfit can have more architectural structure or subtle texture.
   - LAYER FOR DEPTH: Use layering to add visual complexity and a sense of "expensive" styling (e.g., a silk camisole under a structured blazer, or a fine-gauge turtleneck under a tailored coat).

2. CATEGORY-SPECIFIC STYLING (ADAPTIVE ARCHETYPES):
   - WATCHES: The styling MUST adapt to the VIBE. For "Natural", use luxury knitwear or linen. For "Vibrant", use bold, modern silhouettes. For "CandidLuxury", use a mix of high-end tailoring and casual pieces (e.g., a blazer over a premium tee). For "Editorial", use architectural or avant-garde garments. The sleeve should be naturally positioned to showcase the watch.
   - JEWELRY: The styling MUST adapt to the VIBE. For "Natural", use soft, organic fabrics (silk, cashmere). For "Vibrant", use high-contrast, structured pieces. For "CandidLuxury", use "Effortlessly Chic" street-style layers. For "Editorial", use dramatic, high-fashion silhouettes. Necklines must complement the necklace.
   - HANDBAGS: Coordinate with a complete "Total Look" that matches the VIBE. The outfit must feel like it belongs to the specific persona of the vibe (e.g., a "Natural" vibe handbag owner vs. a "Vibrant" vibe owner).
   - FOOTWEAR: Focus on the lower half. Style with trousers, denim, or skirts that match the VIBE's aesthetic. Ensure the hemline length is appropriate to showcase the shoes.
   - EYEWEAR: Focus on the "Portrait" styling. Use collars, knitwear, or headwear that reinforces the VIBE (e.g., a structured blazer for "Editorial", a soft linen shirt for "Natural").

3. VIBE-DRIVEN COORDINATION (DISTINCT FASHION IDENTITIES):
   - NATURAL (Organic Luxury): Aesthetic of Loro Piana or Brunello Cucinelli. Use organic, breathable fabrics like linen, raw silk, and soft cotton. Earthy tones, pastels, or neutral palettes (beige, cream, sage). Styling is relaxed, comfortable, but undeniably high-end.
   - VIBRANT (Modern Avant-Garde): Aesthetic of Gucci, Prada, or Versace. Use bold, saturated colors and high-contrast pairings. Modern, innovative silhouettes and experimental textures. The styling is energetic and forward-thinking.
   - CANDID LUXURY (Effortless Parisian/Milanese): Aesthetic of Saint Laurent, Celine, or Bottega Veneta. "Effortlessly chic". High-end basics mixed with statement pieces. Think "street style" with a mix of textures (e.g., a leather jacket over a silk slip dress, or oversized tailoring).
   - EDITORIAL/HIGH-FASHION (Architectural/Couture): Aesthetic of Schiaparelli, Alexander McQueen, or Balenciaga. Dramatic silhouettes, architectural shapes, and bold, conceptual styling. Use fashion that pushes boundaries and creates a powerful visual statement.

4. STYLING DIVERSITY MANDATE (CRITICAL):
   - DO NOT default to "Old Money" or "Quiet Luxury" for all vibes. 
   - Each vibe MUST have its own unique fashion DNA as described above. 
   - The AI must actively choose different types of garments (e.g., a hoodie for a high-end "Vibrant" look vs. a bespoke suit for a "Natural" look) to ensure visual variety.

5. SCENE-SPECIFIC LOGIC (LOCATION & OCCASION):
   - THE LOCATION MANDATE: The outfit MUST be physically and socially appropriate for the background location. 
   - EXAMPLES: 
     - Beach/Resort -> Linen, silk, resort wear, light textures. (NO heavy coats or formal suits).
     - Snowy/Winter -> Cashmere, wool, structured outerwear, heavy knits. (NO summer dresses).
     - Formal Interior (Gala/Ballroom) -> Evening gowns, tuxedos, high-end tailoring.
     - Modern Office/City -> Sharp tailoring, chic separates, professional luxury.
     - Casual Cafe/Street -> Effortless chic, premium basics, relaxed luxury.
   - THE "REALITY CHECK": If the background is a specific environment, the model's clothing MUST look like they are actually there for a reason.

6. COLOR HARMONY & PALETTE:
   - Use sophisticated color palettes (monochromatic, analogous, or carefully chosen complementary colors). 
   - The outfit color should never "clash" with the product. It should either provide a clean backdrop (neutrals like "Greige", "Oatmeal", "Charcoal") or a deliberate, high-fashion contrast.

7. MATERIAL QUALITY & TEXTURE:
   - Describe the fabrics in detail: "heavyweight silk satin", "fine-gauge Loro Piana cashmere", "structured wool crepe", "crisp Italian poplin". The texture of the clothing must be visible and look expensive.
`;

const JEWELRY_SCALE_CONSTRAINTS = `
JEWELRY SCALING & PROPORTION RULES:
1. SCALE IS SACROSANCT: Jewelry must be rendered at its real-world size relative to the human body.
2. PLACEMENT LOCK (CRITICAL): Pendants MUST reside on the chest/clavicle. NEVER place a pendant on the model's back unless a "back-necklace" is specifically requested.
3. EARRINGS: Must not exceed 1/5 the height of the model's ear. They should be subtle accents.
4. NECKLACES: Pendants must be tiny, fitting perfectly within the hollow of the neck. Chains must be ultra-fine.
5. RINGS: Band width must be ultra-thin and delicate, never thick or chunky.
5. BRACELETS: Must be fine-link and sit naturally on the wrist bone, never oversized or bulky.
6. NO ENLARGEMENT: Absolutely DO NOT enlarge jewelry to make it more visible. It must remain a subtle, high-end detail.
7. VISUAL WEIGHT: Jewelry must not compete with the main product for visual attention.
`;

const HIGH_FASHION_PHYSICALITY = `
### HIGH-FASHION PHYSICALITY & AESTHETIC STANDARDS (CRITICAL) ###
- [HEIGHT MANDATE]: All models MUST appear tall, statuesque, and elongated. Avoid any "short" or "stumpy" appearance. The visual height should feel like 178cm+ for females and 188cm+ for males.
- [FEMALE MODELS]: Statuesque and graceful hourglass silhouette with exceptionally long, slender legs. Refined, slim waist, a fuller and well-defined bust, and elegant, toned curves. High-fashion posture with a long, graceful neck and defined collarbones. The physique must be athletic yet feminine, conveying grace and professional model standards.
- [MALE MODELS]: Tall, chiseled, and authoritative V-taper physique with long limbs. Broad, powerful shoulders and a lean, athletic waist. Defined yet natural musculature, conveying strength and professional fitness model standards.
- [PHOTOREALISM MANDATE]: This MUST look like a real photograph, not a digital creation. Focus on "Natural Imperfections": slight skin texture (pores), natural hair wisps, organic light falloff, and realistic depth of field. Avoid over-smoothing or perfect "plastic" skin which triggers the "AI/CGI look". The image must feel like it was captured with a high-end CMOS sensor with clean digital clarity and luminous skin texture, not rendered by a GPU. NO 3D render, NO CGI, NO Unreal Engine.
- [POSTURE]: Models must have an elegant, relaxed, and confident posture. Avoid stiff or awkward positions.
- [PROFESSIONALISM]: The aesthetic must always remain high-fashion, editorial, and professional. Absolutely NO suggestive, provocative, or inappropriate content.
`;

const LINGERIE_GOLDEN_RULES = `
LINGERIE & SLEEPWEAR GOLDEN RULES (PROFESSIONAL FASHION MANDATE):

1. STYLE & VIBE: "Muse Style" (Phong cách nàng thơ) - Elegant, Ethereal, and Sophisticated.
   - MANDATORY: This is a PROFESSIONAL FASHION PHOTOGRAPHY session. The aesthetic must be high-end editorial, similar to luxury brand campaigns (e.g., La Perla, Agent Provocateur).
   - AESTHETIC: Focus on "Artistic Muse" - soft, poetic, and ethereal. Use soft-focus and diffused lighting to create a dreamlike, high-fashion atmosphere.
   - FORBIDDEN: Absolutely NO suggestive, provocative, or sexually explicit elements. Avoid any "fleshy" or "intimate" vibes. The goal is ART, not intimacy.

2. MODEL APPEARANCE & IDENTITY:
   - SUBJECT: Treat the model as a "Professional Fashion Muse" or "Artistic Sculpture".
   - EXPRESSION: Neutral, dreamy, or ethereal. No seductive looks.
   - MAKEUP: "Clear Skin" and "Natural Dewy" look. Professional fashion grooming.

3. SAFETY & MODESTY (CRITICAL BYPASS):
   - TERMINOLOGY: Use professional fashion terms: "structured top", "bottom garment", "silk apparel", "textured fabric".
   - COVERAGE: Ensure professional modesty. No explicit anatomical details. Focus 100% on the FABRIC TEXTURE, LACE PATTERNS, and DESIGN STRUCTURE.
   - MANNEQUIN REFERENCE: If the source image is a mannequin, treat it as a "High-End Fashion Form" or "Artistic Mannequin" to be evolved into a professional model.
   - NEGATIVE PROMPT: Nudity, cleavage, sexual, provocative, suggestive, explicit, flesh, realistic skin texture in intimate areas.
`;

const MOCKUP_PRINT_GOLDEN_RULES = `
MOCKUP & PRINT GOLDEN RULES (PROFESSIONAL PRESENTATION MANDATE):

1. DIELINE TO 3D TRANSFORMATION (CRITICAL):
   - FLAT FILE DETECTION: If the input image is a flat dieline (bản vẽ phẳng, file in), you MUST mentally "fold" it into a 3D object.
   - FOLD LINE IDENTIFICATION: Recognize dashed lines (đường đứt nét) as fold lines (nếp gấp). These lines define the edges and corners of the 3D structure.
   - DESIGNER INTENT: Analyze the placement of logos, text, and graphics relative to these fold lines to determine which panels are the Front, Top, and Sides.
   - FACE SELECTION: Do NOT attempt to show every face of the dieline in the 3D mockup. This is physically impossible and breaks structural logic.
   - PRIMARY FACES: Select the most important faces (usually the Front panel with the main logo and the Top or Side panel) to display in a natural 3D perspective (e.g., 3/4 view).
   - HIDDEN FACES: Faces that would be on the back or bottom of the folded object MUST be hidden. Do not "unfold" the product to show them.

2. PERSPECTIVE & GEOMETRY (CRITICAL - NO INVERSE PERSPECTIVE):
   - LINEAR CONVERGENCE: All parallel edges (top, bottom, sides) MUST converge towards accurate vanishing points on a single horizon line. This is a non-negotiable law of 3D space.
   - FORESHORTENING: The edge of the product closest to the camera MUST be visually larger/longer than the edge further away. This creates the illusion of depth.
   - ANTI-INVERSE PERSPECTIVE: ABSOLUTELY FORBIDDEN to have distant edges larger than near edges. No "expanding" or "reverse" perspective.
   - VANISHING POINT CONSISTENCY: All parallel lines in the same plane must share the same vanishing point.
   - LENS CHOICE: Use 50mm or 85mm focal lengths to minimize barrel distortion. For flat lays, use orthographic-style top-down views.
   - ALIGNMENT: UX/UI elements and print graphics must follow the 3D curvature and perspective of the host object (screen or box).

3. STRUCTURAL INTEGRITY:
   - DIGITAL DEVICES: Render devices (Phone, PC, Tablet) with 100% accurate industrial design. Bezel thickness, corner radii, and port placements must be realistic.
   - PRINT PRODUCTS: Boxes and bags must show clear fold lines, structural seams, and realistic material thickness. No "floating" edges or paper that looks like liquid.

4. PROPORTIONAL ACCURACY:
   - ASPECT RATIO: The screen content must match the device's native aspect ratio (e.g., 19.5:9 for modern phones).
   - LOGO SCALE: Branding elements must maintain a 1:1 scale ratio relative to the product surface as analyzed.

5. DEVICE & SURFACE FIDELITY:
   - DIGITAL DEVICES (UX/UI): If the category is Digital Mockup, render the device with high-end materials (brushed aluminum, glass, matte finish). ABSOLUTELY NO print products (boxes, bags) unless explicitly requested.
   - PRINT PRODUCTS: If the category is Print Mockup, focus on the paper texture (matte, glossy, embossed). ABSOLUTELY NO digital devices (phones, laptops) unless explicitly requested.

6. LIGHTING & REFLECTIONS:
   - STUDIO LIGHTING: Use professional product studio lighting. Create soft, realistic reflections on glass screens and metallic surfaces.
   - DEPTH OF FIELD: Use a shallow depth of field to draw focus to the mockup while keeping the background elegantly blurred.
`;


export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const callWithRetry = async (fn: () => Promise<any>, maxRetries = 3, initialDelay = 1500): Promise<any> => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorStr = error.message || "";
      const isRetryable = errorStr.includes('500') || errorStr.includes('503') || errorStr.includes('429') || errorStr.includes('overloaded') || errorStr.includes('UNAVAILABLE') || errorStr.includes('INTERNAL');
      
      if (isRetryable && i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

const getAngleTechnicalDescription = (angle: CameraAngle): string => {
  if (angle === CameraAngle.AUTO) return "AUTO ANGLE: Analyze the provided reference image and replicate its camera angle, perspective, and height exactly. If no reference is provided, select the most professional commercial angle optimized for the product category.";
  const strictPrefix = "STRICT MANDATORY CAMERA ANGLE: ";
  switch (angle) {
    case CameraAngle.FRONT: return strictPrefix + "Perfect 0-degree eye-level front view. Symmetrical product placement. Use 50mm lens compression.";
    case CameraAngle.BACK: return strictPrefix + "180-degree straight rear view.";
    case CameraAngle.TOP_DOWN: return strictPrefix + "Strict 90-degree vertical top-down flat lay view. No perspective distortion.";
    case CameraAngle.SIDE_PROFILE: return strictPrefix + "90-degree side profile shot.";
    case CameraAngle.LEFT_SIDE: return strictPrefix + "Exact left side view (-90 degrees).";
    case CameraAngle.RIGHT_SIDE: return strictPrefix + "Exact right side view (+90 degrees).";
    case CameraAngle.ISOMETRIC: return strictPrefix + "45-degree azimuth isometric perspective view.";
    case CameraAngle.LOW_ANGLE: return strictPrefix + "Heroic low angle shot (camera looking up). Wide angle perspective.";
    case CameraAngle.CREATIVE: return strictPrefix + "UNCONVENTIONAL & CREATIVE. Use a unique, high-fashion perspective (e.g., extreme high angle, Dutch angle, or artistic framing through objects). The angle must feel innovative and visually striking.";
    default: return "";
  }
};

const getFramingTechnicalDescription = (framing: FramingMode, category: ProductCategory | string): string => {
  const strictPrefix = "STRICT MANDATORY COMPOSITION: ";
  
  if (framing === FramingMode.AUTO) {
    return "AUTO COMPOSITION: Replicate the framing and crop of the reference image exactly. If no reference, use a balanced commercial shot.";
  }

  const categoryStr = typeof category === 'string' ? category : String(category);

  switch (framing) {
    case FramingMode.FULL_BODY: 
      return strictPrefix + "FULL-BODY SHOT. Show the model from head to toe. Feet and shoes MUST be clearly visible. No cropping of the body. Wide-angle perspective.";
    case FramingMode.UPPER_BODY: 
      return strictPrefix + "WAIST-UP / MEDIUM SHOT. Frame from the waist up to the top of the head. ABSOLUTELY NO legs or feet. The camera is at chest level.";
    case FramingMode.LOWER_BODY:
      return strictPrefix + "LOWER-BODY SHOT / WAIST-DOWN COMPOSITION. Frame the model from the waist/hips down to the feet. ABSOLUTELY NO shoulders, head, neck, upper torso, or face. Focus on pants, legs, skirts, shorts, socks, or footwear and dynamic lower-body stance.";
    case FramingMode.PORTRAIT: 
      return strictPrefix + "HEAD-AND-SHOULDERS PORTRAIT. Tight framing on the face and upper chest only. ABSOLUTELY NO waist, hips, legs, or feet. Focus on facial features and makeup.";
    case FramingMode.CLOSE_UP: 
      let closeUpDesc = strictPrefix + "EXTREME MACRO / TIGHT CLOSE-UP. The product MUST fill at least 90% of the frame.";
      if (categoryStr === 'Shoes' || categoryStr === 'Giày dép') {
        closeUpDesc += " ANKLE-DOWN CROP. ONLY feet and shoes are visible. ABSOLUTELY NO face, NO head, NO torso, NO arms. The camera is at ground level.";
      } else if (categoryStr === 'Bags' || categoryStr === 'Túi xách') {
        closeUpDesc += " TIGHT CROP ON BAG AND HANDS. ABSOLUTELY NO face or upper head visible. Focus exclusively on material texture and hardware.";
      } else if (categoryStr === 'Beauty' || categoryStr === 'Accessories' || categoryStr === 'Phụ kiện' || categoryStr === 'Mỹ phẩm' || categoryStr === 'Watches' || categoryStr === 'Đồng hồ') {
        closeUpDesc += " EXTREME MACRO on the product. If a watch, zero-in on the wrist and watch face. No other body parts allowed.";
      } else if (categoryStr.includes('Mockup') || categoryStr.includes('UX/UI') || categoryStr.includes('Packaging')) {
        closeUpDesc += " TIGHT MACRO on the screen or print detail. Surface texture and graphics are the only elements visible.";
      }
      return closeUpDesc;
    case FramingMode.PRODUCT_FOCUS: 
      let focusDesc = strictPrefix + "PRODUCT-DOMINANT COMPOSITION. The product is the absolute hero.";
      if (categoryStr === 'Shoes' || categoryStr === 'Giày dép') {
        focusDesc += " KNEE-DOWN CROP. Focus intensely on the shoes. THE MODEL'S FACE, HEAD, AND CHEST MUST BE COMPLETELY CROPPED OUT. Only legs and feet are visible.";
      } else if (categoryStr === 'Bags' || categoryStr === 'Túi xách') {
        focusDesc += " MEDIUM-CLOSE CROP focused on the bag. The model's head and face MUST be out of frame or heavily cropped.";
      } else if (categoryStr === 'Bottoms' || categoryStr === 'Quần' || categoryStr === 'Chân váy' || categoryStr === 'Pants') {
        focusDesc += " WAIST-DOWN CROP. Focus exclusively on the pants. THE MODEL'S FACE, HEAD, AND UPPER TORSO MUST BE COMPLETELY CROPPED OUT. Only the hips down are visible.";
      } else if (categoryStr.includes('Mockup') || categoryStr.includes('UX/UI') || categoryStr.includes('Packaging')) {
        focusDesc += " TIGHT COMPONENT CROP. The device or package occupies the center frame. No environmental distractions.";
      } else {
        focusDesc += " Crop tightly to eliminate all non-essential elements from the frame.";
      }
      return focusDesc;
    default: 
      return "";
  }
};

const getTextSpaceTechnicalDescription = (hasTextSpace: boolean, aspectRatio: string = "1:1"): string => {
  if (!hasTextSpace) {
    return "BALANCED COMPOSITION: The main subject / model is balanced and centered in the frame. Standard commercial layout.";
  }
  
  const strictPrefix = "STRICT TEXT-SPACE COMPOSITION MANDATE: ";
  const isPortrait = aspectRatio.includes("9:16") || aspectRatio.includes("4:5") || aspectRatio.includes("2:3");
  const isLandscape = aspectRatio.includes("16:9") || aspectRatio.includes("3:2") || aspectRatio.includes("4:3");

  if (isPortrait) {
    return strictPrefix + "Portrait aspect ratio detected. Shift/position the main subject (model and product) entirely into the LOWER 55%-60% portion of the frame. The UPPER 40% vertical section of the image MUST be left completely flat, empty, uncluttered, and serving as immaculate negative copy space designed for adding overlapping marketing typography, headers, or banner titles. Keep the upper background exceptionally clean and simplified.";
  } else if (isLandscape) {
    return strictPrefix + "Landscape aspect ratio detected. Shift/position the main subject (model and product) completely off-center, occupying only one horizontal side (either the left 55% or the right 55% of the frame). The opposite 45% horizontal section of the image MUST remain absolutely empty, simple, and clean, serving as spectacular flat negative copy space for overlapping editorial description text. Choose the side that fits the product posture and keep the space absolutely uncluttered.";
  } else {
    // Default / Square e.g. 1:1
    return strictPrefix + "Create an off-center asymmetrical layout. Artistically push the main subject (model and product) to one side or corner of the frame, reserving a generous 40%-45% section of the canvas as immaculate blank negative space (e.g. keeping the background layer completely pristine, flat, and simple with zero props or complex background elements in that section) purely for modern logo and ad copy placement.";
  }
};

const getPoseHardConstraint = (pose: ModelPose, customPose?: string, sceneBrief: string = ""): string => {
  const baseConstraint = `### HIGH-FASHION DYNAMIC INTERACTION BLUEPRINTS (UNIVERSAL PROP-AWARE POSING) ###
  The model's posture must feel effortless, relaxed, and gracefully human, with a relaxed neck, dropped shoulders, and natural weight distribution.
  NEVER generate rigid "mannequin" or stiff robotic poses. Instead of applying hardcoded and rigid scenarios, the AI must DYNAMICALLY and intelligently analyze whatever background structures, environment objects, setting details, or props are specified or shown in the scene (which can be vintage/classic cars, high-end furniture, stools, concrete stairs, rustic walls, columns, tree trunks, balcony ledges, glass barriers, marble countertops, etc.).
  
  The AI must dynamically formulate an elegant, high-fashion, and structurally sound interactive posture by applying the following universal physical laws:

  1. UNIVERSAL CONTACT & COHESION PRINCIPLE:
     - The model MUST establish dynamic, natural, and direct tactile contact with any nearby physical assets.
     - [SITTING / RECLINING]: Instead of sitting statically, the model occupies or nestles into the object beautifully. For example, if a car is present, they sit inside the leather cockpit, resting an arm on the window sill, or sit on the open door sill; if chairs or stools are present, they perch on the front edge ("Fashion Perch") with the torso angled forward; if sofas or beds, they slouch sideways or drape over the cushions comfortably; if stone steps or ledges are present, they sit relaxed with legs extended naturally.
     - [LEANING / STANDING]: The model leans directly on the prop to support corporate gravity. They place palm(s) flat, rest one or both elbows on a flat top surface, lean their lower back/hips against a side panel, or casually rest a shoulder and upper arm against a vertical wall, pillar, tree, or arch frame.
  
  2. ADAPTIVE ANATOMICAL PHYSICS & REAL-WORLD HEIGHTS:
     - All low environmental elements (tables, car hoods/capo, desks, railings, ledges) MUST remain at their physically realistic heights relative to the ground (e.g., car hood at thigh/hip level, tables/rails at waist level).
     - NEVER pull, raise, or compress these props upward into the frame to reach the model's chest. 
     - Instead, to interact with low surfaces, the model's anatomy must automatically adapt: they gracefully lean their torso forward at the waist/hips, bend their arms to rest forearms flat on the metallic/wooden/stone surface, or bend a knee to support their posture organically.

  3. SPATIAL PROXIMITY & HIGH-FASHION DEEP CROPPING:
     - Do NOT zoom out to fit the full vehicle, complete sofa, or entire building structure in the frame. This distances the model and ruins the fashion look.
     - Keep the camera close and crop heavily: show only a partial preview (about 30-40%) of the vintage vehicle, chair, pillar, or railing. This maintains maximum physical proximity between the lens, the model, and the high-quality clothing fabric.

  4. CONTINGENT GRAPHIC BEAUTY (CONTRAREPOSTO & SYMMETRY):
     - Build organic human lines: shift weight asymmetricaly onto one leg, drop one shoulder, tilt the head subtly, and create beautiful blank-space gaps under the arms or between the legs to define a striking editorial fashion silhouette.`;
  
  const bodyPrefix = "ESTABLISH NATURAL BODY MOTION: ";
  const customDesc = (customPose && customPose.trim()) ? ` [POSE DETAILS]: ${customPose}.` : "";

  if (pose === ModelPose.AUTO) {
    if (customPose && customPose.trim()) {
      return bodyPrefix + `TAILORED CUSTOM POSE. Apply and optimize the following styling guidelines: ${customDesc} ${baseConstraint}`;
    }
    return `FLUID COHESIVE POSE: Analyze the scene context to suggest an organic pose matching the environment’s physics. ${baseConstraint}`;
  }

  switch (pose) {
    case ModelPose.STANDING: 
      return bodyPrefix + `ELEGANT STANDING. A relaxed contrapposto posture with natural asymmetry. The model's weight is shifted organically onto one leg, feet grounded realistically on the floor without stiffness.${customDesc} ${baseConstraint}`;
    case ModelPose.SITTING: 
      return bodyPrefix + `ORGANIC SEATED POSTURE. The model is comfortably seated directly inside or on the surface of the asset, choosing one of the high-fashion SITTING scenarios from the Interaction Blueprints that matches the environment best.${customDesc} ${baseConstraint}`;
    case ModelPose.MOVING: 
      return bodyPrefix + `FLUID MOTION IN TIME. A candid moment of walking or turning naturally, showcasing realistic physics of motion with a gentle wind breeze catching the hair and clothes.${customDesc} ${baseConstraint}`;
    case ModelPose.LEANING: 
      return bodyPrefix + `NATURAL LEANING POSTURE (CRITICAL PROXIMITY & DIRECT CONTACT). The model leans dynamically on a backdrop surface, choosing one of the high-fashion LEANING scenarios from the Interaction Blueprints that matches the environment best, ensuring physical direct-contact, natural torso bending, and close proximity to the lens.${customDesc} ${baseConstraint}`;
    case ModelPose.RECLINING: 
      return bodyPrefix + `RELAXED HIGH-FASHION RECLINING. Resting on a lounge surface with flowing, graceful angles that feel soft and inviting, never tense.${customDesc} ${baseConstraint}`;
    case ModelPose.CANDID: 
      return bodyPrefix + `CANDID & SPONTANEOUS POSTURE. Caught in an off-guard, authentic fashion moment. Looking slightly away with a relaxed face, exhibiting organic body language.${customDesc} ${baseConstraint}`;
    case ModelPose.OVER_SHOULDER: 
      return bodyPrefix + `ELEGANT OVER-THE-SHOULDER POSTURE. The torso is angled slightly away from the lens, with their head beautifully turned back towards the camera, keeping neck muscles relaxed and shoulders naturally low.${customDesc} ${baseConstraint}`;
    case ModelPose.ZERO_GRAVITY: 
      return bodyPrefix + `AVANT-GARDE WEIGHTLESS FLOAT. Elegant, floating limbs with surreal levitation, keeping limbs symmetrically balanced and hands gracefully postured.${customDesc} ${baseConstraint}`;
    case ModelPose.CREATIVE: 
      let creativePoseDesc = `AVANT-GARDE COMMERCIAL CREATIVE. `;
      if (sceneBrief && sceneBrief.trim().length > 10) {
        creativePoseDesc += `You MUST dynamically formulate the model pose based on the following Idea Description: "${sceneBrief}". Specifically: analyze the background environment and items (e.g., cars, vintage vehicle, chairs, sofas, brick walls, trees, columns, pillars) described in that brief. Force the model to dynamically interact with those assets: if chairs/sofa are present, sit gracefully; if wall/tree/car, lean elegantly against them; if walking/street scene, style a premium fluid runway stride. All body placements, hands, legs, head-tilt, and asymmetrical angles must perfectly follow, support, and align with the environment described.`;
      } else {
        creativePoseDesc += `An elegant and asymmetrical fashion silhouette that prioritizes leading lines, clean negative space, and a high-fashion editorial feel.`;
      }
      return bodyPrefix + `${creativePoseDesc}${customDesc} ${baseConstraint}`;
    case ModelPose.REFERENCE:
      return bodyPrefix + `REPLICATE THE EMOTION & SYMMETRY FROM THE REFERENCE. Harmonously translate the limbs, balance, and weight distribution of the reference into a natural posture.${customDesc} ${baseConstraint}`;
    default: 
      return "";
  }
};

export const analyzeProductFidelity = async (productImages: string[], category: ProductCategory, userNotes: string = ""): Promise<{ designAnalysis: string; measurementProportions: string; detectedCategory: string; brandModel: string }> => {
  const ai = getGoogleGenAI();
  const contents: any[] = [];
  
  const prompt = `
    ROLE: Senior Product Fidelity Analyst (Fashion & Luxury Goods).
    TASK: Analyze the provided product images to determine design details, measurement proportions, and the EXACT product category.
    
    PHASE 1: RESEARCH (MANDATORY)
    - Use Google Search to find official product information based on images and description: "${userNotes}".
    - Search for: Specifications, Materials, Standard size chart, and characteristic design features from official brand sites or reputable sources.

    PHASE 2: ANALYSIS (IN-DEPTH ANALYSIS)
    Combine Research data and actual images to analyze:
    1. BRAND & MODEL IDENTIFICATION (CRITICAL):
       - Examine the images for any visible logos, text, or unique design patterns.
       - Identify the BRAND and MODEL name.
       - MANDATORY: Use Google Search to find the official technical specifications (dimensions, materials) for this specific brand/model.

    2. CATEGORY DETECTION (CRITICAL):
       - Identify the exact category of the product. Be extremely precise and specific.
       - Categories include but are not limited to: "Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Socks", "Headwear", "Eyewear", "Watches", "Jewelry", "Bags", "Belts", "Electronics", "Beauty", "Lingerie", "Sleepwear", "Swimwear".

    3. DESIGN ANALYSIS (ULTRA-DETAILED):
       - Identify core identification features (logo, stitching, material, patterns, textures).
       - LOGO & PATTERN PRECISION (CRITICAL): Analyze the EXACT scale, position, and orientation of any logos or patterns. 
       - DIRECTIONAL LOGO FIDELITY: Is the logo asymmetrical or directional? (e.g., Nike Swoosh, Skechers 'S', Adidas stripes). Note if the logo faces a specific direction relative to the product's "Front" or "Toe" (e.g., "The toe of the 'S' points towards the laces"). 
       - MIRRORING ANALYSIS: For pairs (like shoes/gloves), determine if the logo is mirrored on the left vs. right side, or if it maintains a fixed orientation regardless of the side.
       - Describe the logo's size relative to the product part it sits on (e.g., "The logo occupies exactly 15% of the toe area's width").
       - Note the distance from edges, seams, or other landmarks.
       - Cross-reference with brand data found via Google Search to confirm fidelity.
    
    4. MEASUREMENT & PROPORTIONS (MATHEMATICAL & VISUAL PRECISION):
       - REAL-WORLD DIMENSIONS: Use the dimensions found via Google Search (e.g., "This bag is 35cm wide, 25cm high").
       - WATCHES (CRITICAL 3-LAYER ANALYSIS): If the product is a watch, you MUST provide a 3-layer description:
         A. Specs: Case diameter (mm), strap width (mm), slimness.
         B. Visual Interpretation: Use terms like "tiny face", "ultra delicate", "narrow strap", "subtle presence", "miniature proportion", "petite feminine watch".
         C. Relationship to body: Describe how it looks on a slim female wrist (e.g., "much smaller than a standard men's watch", "occupies only a small portion of the wrist width", "must not dominate the wrist visually").
       - SOURCE ANCHOR ANALYSIS: If provided product images show a model using the product, treat that as the "GOLDEN STANDARD" for proportions.
       - ANCHOR POINTS: Precisely analyze where the product sits on the model's body in the original photo.
       - SCALE INFERENCE: Use the ratio between the product and body parts in the original photo as the basis for reconstruction.
       - LOGO SCALE RATIO: Calculate the ratio of the logo size to the overall product size. This is CRITICAL.
       - ASPECT RATIO ANALYSIS: Determine the Width:Height ratio of the product itself and its sub-components.
       - GEOMETRIC SIGNATURE (MANDATORY FOR WATCHES/GLASSES): Identify pure geometric shapes.
       - UX/UI, DIGITAL MOCKUP & PRINT ANALYSIS (CRITICAL): If the product is a digital screen or print material:
         A. Type Identification: Determine if it's a mobile UI, desktop UI, website, app, or a physical print (box, bag, poster).
         B. Dieline Detection: Identify if the input is a flat dieline (file in) or a 3D object. If flat, identify the Front, Back, Side, Top, and Bottom panels.
         C. Fold Line Analysis: Recognize dashed lines (đường đứt nét) as structural fold lines (nếp gấp). Use these to infer the 3D volume and the designer's intended orientation for each panel.
         D. Perspective & Geometry: Analyze the 3D perspective. Identify vanishing points and lens distortion. MANDATE: All parallel lines must converge to vanishing points (Linear Perspective). Ensure "Foreshortening" is correct (near edges larger than far edges). STRICTLY FORBID "Inverse Perspective" (where distant edges appear larger).
         E. Structural Integrity: Note the physical build - bezel thickness for devices, fold lines and seams for packaging.
         F. Proportional Accuracy: Calculate the exact aspect ratio of the design area. Identify the scale of UI elements or print graphics relative to the overall dimensions.
         G. Content Fidelity: Note the specific UI elements (buttons, icons, text fields) or print details (typography, barcodes, material textures like kraft paper or glossy finish).
         H. Branding & Color: Identify the primary and secondary color palette (HEX/RGB if possible) and the exact placement of branding elements.
         I. CATEGORY SEPARATION: If it is a PRINT product (box, bag), DO NOT suggest any digital devices. If it is a DIGITAL design, DO NOT suggest any print products.
       - MANDATORY: Warn AI not to stretch, distort, or enlarge logos/patterns. They must maintain their relative scale 1:1.
       - Propose technical specifications for AI to generate images with 1:1 accuracy.

    RETURN RESULTS (JSON format):
    {
      "detectedCategory": "One of the categories listed above",
      "brandModel": "Identified Brand and Model name",
      "designAnalysis": "Detailed design description based on Research and images...",
      "measurementProportions": "Brand-standard proportion plan: [Official Dimensions found], [Scale inferred from original model photo], [Product Aspect Ratio Width:Height], [Precise Anchor Points from source photo], [Anti-distortion warning]..."
    }
  `;

  productImages.forEach(img => {
    const cleaned = cleanBase64(img);
    if (cleaned) {
      contents.push({ inlineData: { data: cleaned, mimeType: 'image/jpeg' } });
    }
  });
  
  contents.push({ text: prompt });

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: { parts: contents },
      config: { 
        temperature: 0.2,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        systemInstruction: "You are a product research and measurement expert. You MUST use Google Search to identify the brand and model from the images and find their official technical specifications (dimensions in cm/mm). Your goal is to provide a 'Ground Truth' measurement plan so that an image generator can place the product on a human body with 100% accurate scale. If the product is generic, search for 'standard industry dimensions' for that category.",
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      } as any
    }));
    
    const result = JSON.parse(response.text || '{}');
    return {
      detectedCategory: result.detectedCategory || "Apparel",
      brandModel: result.brandModel || "Generic/Unknown",
      designAnalysis: result.designAnalysis || "Could not analyze design.",
      measurementProportions: result.measurementProportions || "Could not calculate proportions."
    };
  } catch (error) {
    console.error("Analysis Error:", error);
    return {
      detectedCategory: "Apparel",
      brandModel: "Unknown",
      designAnalysis: "Error during design analysis.",
      measurementProportions: "Error during proportion calculation."
    };
  }
};

export const generateAdvancedConcept = async (
  shortIdea: string,
  category: ProductCategory,
  productImages: string[],
  referenceImageBase64: string | null | undefined,
  vibe: string = 'Editorial',
  sceneMode: SceneMode = 'model',
  refinement: string = "",
  framing?: FramingMode,
  angle?: CameraAngle,
  hasTextSpace: boolean = false,
  aspectRatio: string = "1:1"
): Promise<string> => {
  const ai = getGoogleGenAI();
  const contents: any[] = [];
  
  const selectedAngleText = angle && angle !== CameraAngle.AUTO ? angle : "Auto Camera Angle";
  const selectedFramingText = framing && framing !== FramingMode.AUTO ? framing : "Auto Framing";
  const textSpaceDesc = getTextSpaceTechnicalDescription(hasTextSpace, aspectRatio);

  let dynamicCameraLightingForce = "";
  if (framing === FramingMode.CLOSE_UP || framing === FramingMode.PRODUCT_FOCUS) {
    dynamicCameraLightingForce = "Extreme sharp focus on the Subject, Shallow depth of field, Macro lens";
  } else if (framing === FramingMode.FULL_BODY || framing === FramingMode.WIDE_SHOT) {
    dynamicCameraLightingForce = "Cinematic lighting, Sharp silhouette, High-fashion composition";
  }

  const prompt = `
    # ROLE: High-End AI Art Director & Prompt Architect
    Your job is to transform the user's UI selections and the provided product assets into a precise, commercial-grade, ultra-premium photography brief for a luxury-level image generation model.

    # 1. THE ANTI-CHEEP (CHỐNG PHÈN) ULTRA-LUXURY DESIGN PRINCIPLE:
    Every single vibe, setting, and background must look incredibly expensive, elite, and publishable on high-end fashion magazine covers (like Vogue, Harper's Bazaar, or Architectural Digest). Absolute ban on unrefined ("phèn"), cliché, or cheap-looking backdrops.
    - If "Natural": Do NOT use generic forests, raw mud, or cheap outdoor parks. Design a hyper-luxurious indoor-outdoor physical wellness retreat or natural-architectural villa oasis. Think warm sun-kissed ivory travertine stone surfaces, organic premium Belgian linen drapes, subtle architectural clean solid-wood elements, with elegant, delicate, high-precision palm/monstera shadows cascading across textured beige plaster walls. Set up a tranquil high-end environment that radiates natural wealth.
    - If "Minimalism": Do NOT use flat grey walls or plain sheets. Design a hyper-refined architectural gallery space of high-end raw cast-concrete with sweeping clean lines, beautiful play of brutalist geometric shadow, elegant textured cream-chalk limestone walls, pristine blank space, and an absolute lack of clutter that screams wealthy designer branding.
    - If "Luxury": Do NOT use generic shiny gold or tacky lamps. Design an opulent European boutique interior, elegant warm white or beige marble floors polished to a mirror shine, subtle hand-brushed champagne gold or brass trims, exquisite warm architectural rim lighting, rich clean-cut shadows, and elite museum-level classic furniture.
    - If "Vintage": Do NOT use dusty old rooms or cheap retro filters. Design a rich, nostalgic, cinematic 1970s or 90s Italian Riviera or Parisian café mood. Warm-toned high-grain medium format film, premium warm mahogany wood panels, sleek cream-white leather seats of an expensive vintage convertible, soft golden-hour sunshine streams, and romantic classic accessories.
    - If "Sport": Do NOT use run-down public courts or dark, dusty gyms. Design an ultra-exclusive, high-performance modern athletic club or a luxury architectural country club. Use sleek high-definition geometric lines, razor-sharp bright sports lights casting crisp high-fashion shadows, pristine polished glass partitions, glossy dark track surfaces, and athletic-chic engineering excellence.
    - If "Streetwear": Do NOT use a dirty city alleyway or chaotic garbage-filled street. Design a high-concept urban-architectural landscape or upscale brutalist modern museum. Think massive monolithic textured concrete pillars, clean geometric shadow-play, designer warehouse galleries, high-fashion raw granite surfaces, and sophisticated industrial lighting.
    - If "Studio": Do NOT use a flat, cheap, boring plain digital backdrop. Design an upscale professional editor/campaign studio set with soft three-point softbox diffused lights, premium fine-grained textured fabric or matte seamless backdrop (soft beige, champagne, off-white, or warm slate grey), and gorgeous artistic rim lighting.
    - If "OldMoney": Absolute elite quiet luxury, nostalgic and breathtakingly elegant. Design a high-end European lakeside estate terrace, a private classic mahogany yacht deck with high-polished brass railings glinting in the light, or an expensive country club veranda. Beautifully soft golden-hour sunbeams, premium cashmere fibers, and clean prestige.
    - If "Cinematic": Breathtaking cinematic theater. Design deep chiaroscuro lighting, mood-evoking rim lighting, subtle atmospheric mist, and wet reflective surfaces (like dark polished marble or sleek wet asphalt reflecting elegant surrounding glowing lights). Beautiful highly styled high-fashion editorial aesthetics reminiscent of expensive 1990s anamorphic film campaigns.

    # 2. CONTEXTUAL LOGICAL SYNCHRONICITY & HARMONY (CRITICAL PROMPT REQUIREMENT):
    You MUST dynamically audit the relationship between the Product Type, the model's Clothing/Styling Layer, and the Environment. Everything must integrate flawlessly.

    - INTENSITY/WEATHER COHERENCE (e.g., Snowy Mountains, Winter Settings vs Dress/Tops):
      * If the chosen scenery is a freezing/cold environment (e.g., snow peaks, snowy mountains, frozen white lakes, pine forest snowscapes):
        * DO NOT put a model in a summer slip-dress, t-shirt, or barefoot in the snow. That looks absurdly "lệch quẻ" and unrealistic.
        * YOU MUST either:
          1. Apply Winter Styling: Layer the model with luxury high-end winter clothing, e.g., "The model stands elegantly layered in a heavyweight luxury cream-colored wool wrap coat worn open over the shoulders, thick premium cashmere scarf, matching woolen gloves, and high-fashion warm winter boots." Or sportswear like "high-fashion white winter ski coordinates".
          2. Use Indoor-Outdoor Transition: Put the model inside an opulent heated architectural cabin or premium glass villa looking out, e.g., "The shoot takes place inside a heated luxury A-frame wooden cabin with floor-to-ceiling glass panoramic windows looking out towards majestic, sunlit snow-capped mountain peaks, allowing the model to be styled warmly but comfortably indoors."
    
    - PRIVACY/INTIMACY PRODUCT LIMITS (Lingerie, Sleepwear, Bikini vs Outdoors):
      * If the product category is "Sensitive Apparel" (Lingerie, Lace, Sleepwear, Bikini, Pajamas, Bathrobes):
        * YOU ARE STRICTLY FORBIDDEN from generating an outdoor public environment (forests, city streets, high-fashion avenues).
        * Instead, always place the shoot in highly private, hyper-luxurious sanctuaries that feel natural and exclusive: a high-rise penthouse suite master bedroom with silk sheets, a sun-drenched private solarium filled with lush natural potted plants and warm morning sky beams, an elite private pool deck or luxury villa patio with no public visibility, or a serene private marble spa lounge.

    - BRAND STYLING HARMONY:
      - The model's hairdo, makeup, and subtle jewelry must completely adapt to the product and setting. A cozy winter snow setting requires cozy healthy skin and a luxurious winter hairstyle; an indoor private sanctuary with sleepwear requires relaxed sleek hair and dewy, soft morning skincare look.

    # SPECIAL MASTER MANDATE (PRODUCT-CENTRIC GROUNDING):
    You MUST meticulously analyze the provided "PRODUCT IMAGE Description/Payload" at the beginning of the contents stream.
    Identify the specific, authentic characteristics of the product:
    - CATEGORY: e.g. Dress, Suit, Shoes, Packaging, Bottle, Jewelry, Handbag.
    - DETAILED DESIGN & SILHOUETTE: e.g. V-neck, oversized shoulders, double-breasted buttoning, long flowing dress, asymmetric cut, structured handles.
    - AUTHENTIC MATERIALS & TEXTURES: e.g. sheer textured lace, glossy smooth silk, coarse linen, knobby bouclé, rugged matte leather, high-polished gold, frosted glass.
    - REAL COLORS & PATTERNS: Replicate the actual color palette and patterns (e.g. emerald green, cream white, stripes, floral embroidery) without changing them.
    You MUST inject these original design details directly into your final brief. Do not invent a different product garment or description.

    # UI SELECTIONS (MUST APPLY AS MASTER COMMANDS):
    - Camera Angle Input: ${selectedAngleText}
    - Framing Input: ${selectedFramingText}
    - Selected Vibe (Artistic Flavor Catalyst): ${vibe}
    - Scene Mode: ${sceneMode}
    - Category: ${category}
    - User Concept/Idea: "${shortIdea}"
    - Additional Refinement: "${refinement}"
    - Composition Layout: ${textSpaceDesc}

    # CORE RULES (Product & Model First):
    1. 70% of the output brief must describe the SUBJECT (Product or Model styling) in extreme detail, fully grounded in the TRUE PRODUCT'S design, fabric, and material textures.
    2. 30% of the output brief describes the ENVIRONMENT, SET DESIGN, & LIGHTING. 
    ${referenceImageBase64 ? `
    - CRITICAL BACKGROUND REFERENCE IMAGE RULE (MANDATORY): Since the user provided a "REFERENCE IMAGE FOR BACKGROUND", you MUST analyze this image's specific background elements (architecture, materials like concrete or travertine, specific nature/objects, color tone, lighting direction, and mood). Your output brief MUST describe a set design that perfectly matches and aligns with this reference background's context and items. Do NOT hallucinate a generic backdrop from the general vibe template; instead, blend the requested vibe ("${vibe}") elegantly into the physical structure of the reference image.
    ` : `
    - General Vibe Backdrop Rule: Describe the environment based on the selected Vibe ("${vibe}"), the user's concept, and the product's character. Use high-class, luxury descriptions.
    `}
    3. NEVER write endless paragraphs about the background. Keep it blurred (atmospheric bokeh) to concentrate 100% of the visual interest on the product itself.
    4. STRICT NO-POSE EXCLUSION MANDATE: You are STRICTLY FORBIDDEN from describing, suggesting, or hinting at the model's physical body posture, body position, limb positions, hand positions, or actions (e.g. do NOT say they are sitting, standing, leaning, walking, lounging, or placing hands anywhere). The output brief must be COMPLETELY SILENT on the physical pose of the model, which is configured separately outside of the Idea Description.

    # CAMERA & COMPOSITION (Based on Layout & Camera UI):
    - Apply the selected "${selectedAngleText}" and "${selectedFramingText}" directly as master commands.
    - If the framing is "Close-up" or "Product Focus": Force "Shallow depth of field, heavily blurred background, razor-sharp focus on subject texture and brand logo detail".
    - Apply composition adjustment: ${textSpaceDesc}
    ${dynamicCameraLightingForce ? `- Composition guidance: "${dynamicCameraLightingForce}"` : ""}

    # OUTPUT FORMAT FOR "IDEA_DESCRIPTION" (MANDATORY STRUCTURE):
    You MUST output your brief EXACTLY in the following format structure, compiled into a single unified cohesive photography description:
    [Camera Angle / Framing Master Commands] + [True Product design/silhouette details with authentic material/skin/hair texture] + [Styling/Hairstyle/Makeup and warmth/outerwear layers carefully harmonized with the weather/setting and product type] + [Atmospheric Background Set description carefully optimized to look extremely rich, expensive, and contextually logical] + [High-End Commercial Photography Technical Keywords: "Hasselblad 100MP, Phase One, high-end editorial campaign, studio lighting, flawless publication quality"].

    *CRITICAL: Do NOT output labels or headings like "[Camera Angle/Framing]" or "OUTPUT FORMAT". Just produce the raw compiled paragraph description directly as your response text. Ensure there are absolutely NO pose or physical posture descriptions of the model in the final compiled output.*
    
    Begin compiling the professional photography brief now:
  `;

  productImages.forEach((img, index) => {
    const cleaned = cleanBase64(img);
    if (cleaned) {
      contents.push({ text: `PRODUCT IMAGE ${index + 1}: Use this for product details only.` });
      contents.push({ inlineData: { data: cleaned, mimeType: 'image/jpeg' } });
    }
  });

  if (referenceImageBase64) {
    const cleanedRef = cleanBase64(referenceImageBase64);
    if (cleanedRef) {
      contents.push({ text: `REFERENCE IMAGE FOR BACKGROUND: This is the PRIMARY SOURCE for background, lighting, and composition.` });
      contents.push({ 
        inlineData: { 
          data: cleanedRef, 
          mimeType: 'image/jpeg' 
        } 
      });
    }
  }
  
  contents.push({ text: prompt });

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: { parts: contents },
      config: { 
        temperature: 0.3,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: "You are a master Art Director and Stylist for luxury brands (Chanel, Dior, Saint Laurent). You have extremely high aesthetic standards, prioritizing sophistication, luxury, and the specific Vibe requested. You transform images into enchanting and high-class words. CRITICAL: You MUST preserve every single keyword and specific detail from the user's idea. Do not summarize or omit anything. If the user provides ideas in Vietnamese, translate them accurately into high-fashion English while keeping all specific nouns and adjectives as core keywords. Your output brief must always be in English."
      } as any
    }));
    return response.text?.trim() || shortIdea;
  } catch (error) {
    return shortIdea;
  }
};

export const analyzeModelDna = async (imageBase64: string, userAgeHint?: string, userStyleHint?: string): Promise<ModelDna> => {
  const ai = getGoogleGenAI();
  const cleanedDnaImage = cleanBase64(imageBase64);
  if (!cleanedDnaImage) throw new Error("No valid image data provided for DNA analysis.");

  const response = await callWithRetry(() => ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        { text: `
          ROLE: Expert Facial Analyst & AI Prompt Engineer.
          TASK: Analyze the uploaded portrait and extract data in two parts for high Character Consistency.
          ${userAgeHint ? `USER INPUT AGE: ${userAgeHint}` : ""}
          ${userStyleHint ? `USER INPUT STYLE: ${userStyleHint}` : ""}

          PART 1: Celebrity Blending Analysis
          - Identify 2-3 celebrities (actors, idols, international models) with the most similar facial bone structure and features.
          - Provide names and percentages (e.g., "70% Person A, 30% Person B").

          PART 2: "Prompt DNA" Matrix Extraction
          - Describe the face and grooming in detail using English medical/graphic terms to prevent AI confusion.
          - Structure: [Gender/Age/Ethnicity], [Style], [Face Shape], [Eye Distance/Shape/Color], [Eyebrow Shape], [Nose Bridge/Alae], [Lip Thickness/Contour], [Skin Characteristics], [Hairstyle/Color/Length], [Makeup Style/Intensity], [Lighting Style/Direction].
          
          PART 3: Detailed Body Measurements
          - Estimate wrist circumference (cm), ankle circumference (cm), head width (cm), and head height (cm) for accurate product fitting.
          
          OUTPUT FORMAT: JSON
        ` },
        { inlineData: { data: cleanedDnaImage, mimeType: 'image/jpeg' } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ethnicity: { type: Type.STRING },
          age: { type: Type.STRING },
          hairstyle: { type: Type.STRING },
          hairLength: { type: Type.STRING, description: "e.g. long, short, shoulder-length, bob" },
          makeupStyle: { type: Type.STRING, description: "e.g. natural, heavy, smokey, nude" },
          lightingStyle: { type: Type.STRING, description: "e.g. soft, cinematic, high-key, studio" },
          facialFeatures: { type: Type.STRING },
          height: { type: Type.NUMBER },
          weight: { type: Type.NUMBER },
          measurements: {
            type: Type.OBJECT,
            properties: {
              bust: { type: Type.NUMBER },
              waist: { type: Type.NUMBER },
              hip: { type: Type.NUMBER },
              wrist: { type: Type.NUMBER },
              ankle: { type: Type.NUMBER },
              headWidth: { type: Type.NUMBER },
              headHeight: { type: Type.NUMBER }
            },
            required: ["bust", "waist", "hip", "wrist", "ankle", "headWidth", "headHeight"]
          },
          celebrityBlend: { type: Type.STRING, description: "e.g. 70% Jennie Kim, 30% Bella Hadid" },
          promptDna: { type: Type.STRING, description: "Detailed medical/graphic facial description" }
        },
        required: ["ethnicity", "age", "hairstyle", "hairLength", "makeupStyle", "lightingStyle", "facialFeatures", "height", "weight", "measurements", "celebrityBlend", "promptDna"]
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    } as any
  }));
  return JSON.parse(response.text);
};

export const generateCreativePose = async (
  category: ProductCategory,
  vibe: string,
  gender: ProductGender,
  userIdea: string = "",
  currentPoseInput: string = ""
): Promise<string> => {
  const ai = getGoogleGenAI();
  
  const prompt = `
    ROLE: World-class Fashion Photographer and Creative Director for luxury brands (Vogue, Harper's Bazaar).
    TASK: Generate a single, EXTREMELY CREATIVE, and anatomically perfect pose description for a high-end luxury fashion editorial.
    
    CONTEXT:
    - Product Category: ${category}
    - Aesthetic Vibe: ${vibe}
    - Model Gender: ${gender}
    - User's General Scene Idea: "${userIdea}"
    - USER'S POSE KEYWORDS/DRAFT: "${currentPoseInput}"
    
    CRITICAL MANDATES:
    1. KEYWORD DEVELOPMENT: If the user provided "POSE KEYWORDS/DRAFT", you MUST strictly follow and EXPAND on them. Do not ignore them. If they are empty, create something entirely new.
    2. SUPREME CREATIVITY: Avoid generic poses. Think about architectural shapes, asymmetrical balance, high-fashion tension, and fluid movement. Every generation MUST be unique and visually arresting.
    3. NO REPETITION: Do not use common "standing" or "sitting" poses unless they are transformed into something avant-garde.
    4. NO HANGING ARMS: Arms and hands must be actively positioned to create leading lines towards the product or interact with the environment.
    5. PRODUCT FOCUS: The pose must showcase the ${category} as the hero of the image.
    6. ANATOMICAL CORRECTNESS: The pose must be physically possible for a professional model.
    
    DESCRIPTION STYLE: Provide a concise (2-3 sentences) but vivid, technical, and artistic description of the body position, limb placement, and the "energy" of the pose.
    
    Example (if keywords were "leaning, hand on face"): "An elegant leaning pose against a minimalist concrete pillar, with the model's body forming a sharp diagonal line. One hand is positioned with fingers spread delicately across the jawline to frame the product, while the other arm is tucked behind the back to emphasize the silhouette's tension."
    
    Return ONLY the pose description text.
  `;

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: { parts: [{ text: prompt }] },
      config: { 
        temperature: 0.95, // Increased for more variety
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      } as any
    }));
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error generating creative pose:", error);
    return "";
  }
};

const sanitizeLingerieDescription = (text: string): string => {
  const sensitiveMap: Record<string, string> = {
    'đồ lót': 'premium silk apparel',
    'lingerie': 'premium silk apparel',
    'bikini': 'swimwear material',
    'đồ ngủ': 'lounge apparel',
    'sleepwear': 'lounge apparel',
    'nightgown': 'evening dress',
    'sexy': 'elegant',
    'quyến rũ': 'sophisticated',
    'nóng bỏng': 'luxurious',
    'bra': 'structured top',
    'panties': 'bottom garment',
    'thong': 'minimalist bottom',
    'nội y': 'refined apparel',
    'ren': 'textured fabric',
    'lace': 'textured fabric',
    'xuyên thấu': 'sheer overlay',
    'see-through': 'layered fabric',
    'tulle': 'mesh fabric',
    'hở': 'open design',
    'khoe': 'display',
    'ngực': 'upper body',
    'mông': 'lower body',
    'vòng 1': 'upper silhouette',
    'vòng 3': 'lower silhouette',
    'da thịt': 'skin texture',
    'flesh': 'skin tone'
  };

  let sanitized = text.toLowerCase();
  Object.keys(sensitiveMap).forEach(key => {
    const regex = new RegExp(key, 'gi');
    sanitized = sanitized.replace(regex, sensitiveMap[key]);
  });
  
  return sanitized + ". Focus strictly on material textures like silk, satin, and fine stitching details. Treat as High-End Fashion Photography.";
};

export const generateEditorConcept = async (
  editInstructions: string,
  sourceImageBase64: string,
  category: ProductCategory,
  productImages: string[],
  modelPromptHint?: string,
  sceneMode: SceneMode = 'model',
  vibe: string = 'Editorial',
  refinement: string = "",
  framing?: FramingMode,
  angle?: CameraAngle,
  hasTextSpace: boolean = false,
  aspectRatio: string = "1:1"
): Promise<string> => {
  const ai = getGoogleGenAI();
  const contents: any[] = [];
  const isLingerie = category === ProductCategory.SENSITIVE_APPAREL;
  
  const selectedAngleText = angle && angle !== CameraAngle.AUTO ? angle : "Auto Camera Angle";
  const selectedFramingText = framing && framing !== FramingMode.AUTO ? framing : "Auto Framing";
  const textSpaceDesc = getTextSpaceTechnicalDescription(hasTextSpace, aspectRatio);

  let dynamicCameraLightingForce = "";
  if (framing === FramingMode.CLOSE_UP || framing === FramingMode.PRODUCT_FOCUS) {
    dynamicCameraLightingForce = "Extreme sharp focus on the Subject, Shallow depth of field, Macro lens";
  } else if (framing === FramingMode.FULL_BODY || framing === FramingMode.WIDE_SHOT) {
    dynamicCameraLightingForce = "Cinematic lighting, Sharp silhouette, High-fashion composition";
  }

  const prompt = `
    # ROLE: High-End AI Art Director & Prompt Architect
    Your job is to transform the user's UI selections, editing instructions, and product assets into a precise, commercial-grade, ultra-premium photography brief for high-end image editing/regeneration.

    # 1. THE ANTI-CHEEP (CHỐNG PHÈN) ULTRA-LUXURY DESIGN PRINCIPLE:
    Every single vibe, setting, and background must look incredibly expensive, elite, and publishable on high-end fashion magazine covers (like Vogue, Harper's Bazaar, or Architectural Digest). Absolute ban on unrefined ("phèn"), cliché, or cheap-looking backdrops.
    - If "Natural": Do NOT use generic forests, raw mud, or cheap outdoor parks. Design a hyper-luxurious indoor-outdoor physical wellness retreat or natural-architectural villa oasis. Think warm sun-kissed ivory travertine stone surfaces, organic premium Belgian linen drapes, subtle architectural clean solid-wood elements, with elegant, delicate, high-precision palm/monstera shadows cascading across textured beige plaster walls. Set up a tranquil high-end environment that radiates natural wealth.
    - If "Minimalism": Do NOT use flat grey walls or plain sheets. Design a hyper-refined architectural gallery space of high-end raw cast-concrete with sweeping clean lines, beautiful play of brutalist geometric shadow, elegant textured cream-chalk limestone walls, pristine blank space, and an absolute lack of clutter that screams wealthy designer branding.
    - If "Luxury": Do NOT use generic shiny gold or tacky lamps. Design an opulent European boutique interior, elegant warm white or beige marble floors polished to a mirror shine, subtle hand-brushed champagne gold or brass trims, exquisite warm architectural rim lighting, rich clean-cut shadows, and elite museum-level classic furniture.
    - If "Vintage": Do NOT use dusty old rooms or cheap retro filters. Design a rich, nostalgic, cinematic 1970s or 90s Italian Riviera or Parisian café mood. Warm-toned high-grain medium format film, premium warm mahogany wood panels, sleek cream-white leather seats of an expensive vintage convertible, soft golden-hour sunshine streams, and romantic classic accessories.
    - If "Sport": Do NOT use run-down public courts or dark, dusty gyms. Design an ultra-exclusive, high-performance modern athletic club or a luxury architectural country club. Use sleek high-definition geometric lines, razor-sharp bright sports lights casting crisp high-fashion shadows, pristine polished glass partitions, glossy dark track surfaces, and athletic-chic engineering excellence.
    - If "Streetwear": Do NOT use a dirty city alleyway or chaotic garbage-filled street. Design a high-concept urban-architectural landscape or upscale brutalist modern museum. Think massive monolithic textured concrete pillars, clean geometric shadow-play, designer warehouse galleries, high-fashion raw granite surfaces, and sophisticated industrial lighting.
    - If "Studio": Do NOT use a flat, cheap, boring plain digital backdrop. Design an upscale professional editor/campaign studio set with soft three-point softbox diffused lights, premium fine-grained textured fabric or matte seamless backdrop (soft beige, champagne, off-white, or warm slate grey), and gorgeous artistic rim lighting.
    - If "OldMoney": Absolute elite quiet luxury, nostalgic and breathtakingly elegant. Design a high-end European lakeside estate terrace, a private classic mahogany yacht deck with high-polished brass railings glinting in the light, or an expensive country club veranda. Beautifully soft golden-hour sunbeams, premium cashmere fibers, and clean prestige.
    - If "Cinematic": Breathtaking cinematic theater. Design deep chiaroscuro lighting, mood-evoking rim lighting, subtle atmospheric mist, and wet reflective surfaces (like dark polished marble or sleek wet asphalt reflecting elegant surrounding glowing lights). Beautiful highly styled high-fashion editorial aesthetics reminiscent of expensive 1990s anamorphic film campaigns.

    # 2. CONTEXTUAL LOGICAL SYNCHRONICITY & HARMONY (CRITICAL PROMPT REQUIREMENT):
    You MUST dynamically audit the relationship between the Product Type, the model's Clothing/Styling Layer, and the Environment. Everything must integrate flawlessly.

    - INTENSITY/WEATHER COHERENCE (e.g., Snowy Mountains, Winter Settings vs Dress/Tops):
      * If the chosen scenery is a freezing/cold environment (e.g., snow peaks, snowy mountains, frozen white lakes, pine forest snowscapes):
        * DO NOT put a model in a summer slip-dress, t-shirt, or barefoot in the snow. That looks absurdly "lệch quẻ" and unrealistic.
        * YOU MUST either:
          1. Apply Winter Styling: Layer the model with luxury high-end winter clothing, e.g., "The model stands elegantly layered in a heavyweight luxury cream-colored wool wrap coat worn open over the shoulders, thick premium cashmere scarf, matching woolen gloves, and high-fashion warm winter boots." Or sportswear like "high-fashion white winter ski coordinates".
          2. Use Indoor-Outdoor Transition: Put the model inside an opulent heated architectural cabin or premium glass villa looking out, e.g., "The shoot takes place inside a heated luxury A-frame wooden cabin with floor-to-ceiling glass panoramic windows looking out towards majestic, sunlit snow-capped mountain peaks, allowing the model to be styled warmly but comfortably indoors."
    
    - PRIVACY/INTIMACY PRODUCT LIMITS (Lingerie, Sleepwear, Bikini vs Outdoors):
      * If the product category is "Sensitive Apparel" (Lingerie, Lace, Sleepwear, Bikini, Pajamas, Bathrobes):
        * YOU ARE STRICTLY FORBIDDEN from generating an outdoor public environment (forests, city streets, high-fashion avenues).
        * Instead, always place the shoot in highly private, hyper-luxurious sanctuaries that feel natural and exclusive: a high-rise penthouse suite master bedroom with silk sheets, a sun-drenched private solarium filled with luxury natural potted plants and warm morning sky beams, an elite private pool deck or luxury villa patio with no public visibility, or a serene private marble spa lounge.

    - BRAND STYLING HARMONY:
      - The model's hairdo, makeup, and subtle jewelry must completely adapt to the product and setting. A cozy winter snow setting requires cozy healthy skin and a luxurious winter hairstyle; an indoor private sanctuary with sleepwear requires relaxed sleek hair and dewy, soft morning skincare look.

    # SPECIAL MASTER MANDATE (PRODUCT-CENTRIC GROUNDING):
    You MUST meticulously analyze the provided "NEW PRODUCT IMAGE Description/Payload" at the beginning of the contents stream.
    Identify the specific, authentic characteristics of the product:
    - CATEGORY: e.g. Dress, Suit, Shoes, Packaging, Bottle, Jewelry, Handbag.
    - DETAILED DESIGN & SILHOUETTE: e.g. V-neck, oversized shoulders, double-breasted buttoning, long flowing dress, asymmetric cut, structured handles.
    - AUTHENTIC MATERIALS & TEXTURES: e.g. sheer textured lace, glossy smooth silk, coarse linen, knobby bouclé, rugged matte leather, high-polished gold, frosted glass.
    - REAL COLORS & PATTERNS: Replicate the actual color palette and patterns (e.g. emerald green, cream white, stripes, floral embroidery) without changing them.
    You MUST inject these original design details directly into your final brief. The edited garment/product MUST look exactly like the NEW PRODUCT IMAGE.

    # UI SELECTIONS & CONTEXT (MUST APPLY AS MASTER COMMANDS):
    - Camera Angle Input: ${selectedAngleText}
    - Framing Input: ${selectedFramingText}
    - Selected Vibe (Artistic Flavor Catalyst): ${vibe}
    - Scene Mode: ${sceneMode}
    - Category: ${category}
    - Edit Instructions (Primary): "${editInstructions}"
    - Additional Refinement: "${refinement}"
    ${modelPromptHint ? `- Model Character Suggestion: ${modelPromptHint}` : ""}
    - Composition Layout: ${textSpaceDesc}

    # CORE RULES (Product & Model First):
    1. 70% of the output text must describe the SUBJECT (Product or Model styling) in extreme detail, fully grounded in the NEW PRODUCT'S design, fabric, and material textures.
    2. 30% of the output text describes the SCENE & VIBE. 
    ${sourceImageBase64 ? `
    - CRITICAL SOURCE IMAGE PRESERVATION RULE (MANDATORY): Since you are editing/regenerating a product inside a SOURCE IMAGE, you MUST analyze this provided "SOURCE IMAGE TO EDIT" in absolute detail. Identify all current background elements, environment, architecture, specific items, atmospheric color palette, light angles, and shadows. Your output brief MUST describe a background that perfectly matches, preserves, and integrates directly with the existing source background. Do NOT hallucinate a generic backdrop from the vibe template; instead, elegantly blend the requested vibe ("${vibe}") directly onto the existing physical context of the source image.
    ` : `
    - General Vibe Backdrop Rule: Describe the scene based on the user's editing instructions, the requested vibe ("${vibe}"), and composition rules.
    `}
    3. NEVER write long, poetic paragraphs about the background. Keep the background atmospheric but blurred to ensure the focus stays 100% on the subject.
    4. STRICT NO-POSE EXCLUSION MANDATE: You are STRICTLY FORBIDDEN from describing, suggesting, or hinting at the model's physical body posture, body position, limb positions, hand positions, or actions (e.g. do NOT say they are sitting, standing, leaning, walking, lounging, or placing hands anywhere). The output brief must be COMPLETELY SILENT on the physical pose of the model, which is configured separately outside of the Editing Instructions / Idea Description.

    # CAMERA & COMPOSITION (Based on Layout & Camera UI):
    - Apply the selected "${selectedAngleText}" and "${selectedFramingText}" directly as master commands.
    - If the framing is "Close-up" or "Product Focus": Force "Shallow depth of field, heavily blurred background, razor-sharp focus on subject texture and brand logo detail".
    - Apply composition adjustment: ${textSpaceDesc}
    ${dynamicCameraLightingForce ? `- Composition guidance: "${dynamicCameraLightingForce}"` : ""}

    # SOURCE IMAGE BASE CONTEXT:
    - We are modifying the SOURCE IMAGE provided. Maintain the relative placement of all objects and the overall scenic composition (retaining details of the source image backdrop) unless the edit instructions explicitly demand changes. Recalculate lighting on the subject to look professional and radiant.
    ${isLingerie ? LINGERIE_GOLDEN_RULES : ""}

    # OUTPUT FORMAT FOR "IDEA_DESCRIPTION" (MANDATORY STRUCTURE):
    You MUST output your brief EXACTLY in the following format structure, compiled into a single unified cohesive photography description:
    [Camera Angle / Framing Master Commands] + [True Product design/silhouette details with authentic material/skin/hair texture] + [Styling/Hairstyle/Makeup and warmth/outerwear layers carefully harmonized with the weather/setting and product type] + [Atmospheric Background Set description carefully optimized to look extremely rich, expensive, and contextually logical, matching the source image context] + [High-End Commercial Photography Technical Keywords: "Hasselblad 100MP, Phase One, high-end editorial campaign, studio lighting, flawless publication quality"].

    *CRITICAL: Do NOT output labels or headings like "[Camera Angle/Framing]" or "OUTPUT FORMAT". Just produce the raw compiled paragraph description directly as your response text. Ensure there are absolutely NO pose or physical posture descriptions of the model in the final compiled output.*
    
    Begin compiling the professional photography brief now:
  `;

  if (sourceImageBase64) {
    const cleanedSource = cleanBase64(sourceImageBase64);
    if (cleanedSource) {
      contents.push({ text: `SOURCE IMAGE TO EDIT: This is the ground truth for background and composition.` });
      contents.push({ 
        inlineData: { 
          data: cleanedSource, 
          mimeType: 'image/jpeg' 
        } 
      });
    }
  }

  productImages.forEach((img, index) => {
    const cleaned = cleanBase64(img);
    if (cleaned) {
      contents.push({ text: `NEW PRODUCT IMAGE ${index + 1}: Use this to replace the product in the source image.` });
      contents.push({ inlineData: { data: cleaned, mimeType: 'image/jpeg' } });
    }
  });

  contents.push({ text: prompt });

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: { parts: contents },
      config: { 
        temperature: 0.3,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: "You are a high-end image editing expert. You have the ability to analyze image structures and provide precise instructions to replace components in an image without damaging the original background. You MUST ensure the final result looks like a natural, professionally retouched photograph. Avoid any 'plastic' or 'CGI' look. Prioritize photographic texture, realistic lighting integration, and organic shadows."
      } as any
    }));
    return response.text?.trim() || editInstructions;
  } catch (error) {
    return editInstructions;
  }
};

// ==========================================
// DEFAULT ASSETS HELPERS
// ==========================================
const fetchAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error(`Failed to fetch asset: ${url}`, e);
    return null;
  }
};

let cachedJewelry: { earrings: string | null, necklace: string | null, ring: string | null, jewelryRef: string | null } | null = null;

const getBrandJewelry = async () => {
  if (cachedJewelry) return cachedJewelry;
  const [earrings, necklace, ring, jewelryRef] = await Promise.all([
    fetchAsBase64('/jewelry/earrings.jpg'),
    fetchAsBase64('/jewelry/necklace.jpg'),
    fetchAsBase64('/jewelry/ring.jpg'),
    fetchAsBase64('/jewelry/jewelry.jpg')
  ]);
  cachedJewelry = { earrings, necklace, ring, jewelryRef };
  return cachedJewelry;
};

export const generateProductImage = async (
  productImages: string[],
  modelImageBase64: string | null,
  angle: CameraAngle, 
  sceneBrief: string,
  aspectRatio: string = "1:1",
  customBackgroundBase64?: string | null,
  category: ProductCategory | string = ProductCategory.GENERAL,
  framing: FramingMode = FramingMode.FULL_BODY,
  onStatusChange?: (status: string) => void,
  resolution: '1K' | '2K' | '4K' = '1K',
  fixedPrompt?: string,
  sceneMode: 'model' | 'ghost' | 'still-life' = 'still-life',
  gender: ProductGender = ProductGender.UNISEX,
  creativityLevel: number = 100, 
  modelPose: ModelPose = ModelPose.AUTO,
  modelDna?: ModelDna,
  upscaleFromImage?: string,
  productSignatureDetails: string = "",
  isAnonymousFraming: boolean = false,
  vibe: string = 'Editorial',
  seed?: number,
  stylingOptions?: {
    fineJewelry?: boolean;
    accessoryStyling?: boolean;
    hairstyle?: boolean;
    makeup?: boolean;
    lighting?: boolean;
    faceDiversity?: boolean;
  },
  sourceImageBase64?: string | null,
  customPose?: string,
  macroImages?: string[],
  modelProfileImageBase64?: string | null,
  hasTextSpace: boolean = false
): Promise<{ image: string; prompt: string }> => {
  
  const ai = getGoogleGenAI();
  const isLingerie = category === ProductCategory.SENSITIVE_APPAREL;
  const isMockup = category === ProductCategory.DIGITAL_MOCKUP || category === ProductCategory.PRINT_MOCKUP;
  
  const isChloe = modelDna?.ethnicity?.includes('Vietnamese') && (modelDna?.age === '22' || modelDna?.age === '20');
  const isSarah = modelDna?.ethnicity?.includes('Vietnamese') && (modelDna?.age === '24');
  const isApparel = [ProductCategory.TOPS, ProductCategory.BOTTOMS, ProductCategory.DRESSES, ProductCategory.OUTERWEAR, ProductCategory.SENSITIVE_APPAREL].includes(category as ProductCategory);
  
  let chloeStylingInjection = "";
  if (sceneMode === 'model') {
    if (isChloe) {
      chloeStylingInjection = CHLOE_IDENTITY_MANDATE;
      if (!isApparel) {
        chloeStylingInjection += "\n" + CHLOE_STYLING_MANDATE;
      }
    } else if (isSarah) {
      chloeStylingInjection = NGAN_VU_IDENTITY_MANDATE;
    }
  }

  let effectiveDna = modelDna;
  // If lingerie and we have a custom model image but no DNA, analyze it first
  if (isLingerie && modelImageBase64 && !effectiveDna) {
    try {
      if (onStatusChange) onStatusChange("Analyzing Custom Model DNA for Privacy...");
      effectiveDna = await analyzeModelDna(modelImageBase64);
    } catch (e) {
      console.error("DNA Analysis failed", e);
    }
  }

  const safeModelImage = isLingerie ? null : modelImageBase64;
  
  const sanitizedSignature = isLingerie ? sanitizeLingerieDescription(productSignatureDetails) : productSignatureDetails;
  const sanitizedBrief = isLingerie ? sanitizeLingerieDescription(sceneBrief) : sceneBrief;

  // Extract measurement proportions if present in the signature
  const measurementMatch = sanitizedSignature.match(/\[PRODUCT FIDELITY ANALYSIS\]:([\s\S]*)/i);
  const measurementConstraints = measurementMatch ? measurementMatch[1].trim() : "";

  if (onStatusChange) onStatusChange("Analyzing Product DNA & Scale...");

  const brandJewelry = (gender === ProductGender.FEMALE && stylingOptions?.fineJewelry) ? await getBrandJewelry() : null;

  const angleDesc = getAngleTechnicalDescription(angle);
  const framingDesc = getFramingTechnicalDescription(framing, category);
  const textSpaceDesc = getTextSpaceTechnicalDescription(hasTextSpace, aspectRatio);
  const poseDesc = getPoseHardConstraint(modelPose, customPose, sanitizedBrief);

  const modeInstruction = sceneMode === 'ghost'
    ? "GHOST MANNEQUIN MODE: The product must appear as if worn by an invisible person. Maintain the 3D shape and volume of the garment as if it's on a body, but ABSOLUTELY NO human parts (skin, hair, limbs, face, hands) should be visible. The image must show the interior lining and structure where a body would be. NO MODEL ALLOWED."
    : (sceneMode === 'model' ? "MODEL MODE: The product is worn by a professional fashion model." : "STILL LIFE MODE: This is a product-only shot. ABSOLUTELY NO model or mannequin or human parts. The product should be elegantly placed in the scene (e.g., on a surface, hanging, or flat lay). NO HUMAN SKIN OR LIMBS ALLOWED.");

  const dnaPrompt = (effectiveDna && sceneMode === 'model') ? `
    MODEL DNA PROFILE (MANDATORY CHARACTERISTICS):
    - Ethnicity: ${effectiveDna.ethnicity}
    - Age: ${effectiveDna.age} (CRITICAL: Respect this age exactly. If 18-19, the model must look youthful and fresh. If 24, they should look like a young professional. Absolutely NO age drift or facial maturation between shots).
    - Hairstyle: ${stylingOptions?.hairstyle ? "OVERRIDE REQUIRED: Change the styling entirely. You MUST style her hair using EXACTLY the hairstyle/hair color description defined in [USER INTENT & SPECIFIC KEYWORDS] / [VISUAL BRIEF]. Absolutely do NOT use her default hair from any profile reference images. Ignore the hairstyle of the reference photo completely." : `${effectiveDna.hairstyle} (${effectiveDna.hairLength})`}
    - Makeup: ${stylingOptions?.makeup ? "OVERRIDE REQUIRED: Change the styling entirely. You MUST apply exactly the makeup look/colors specified in [USER INTENT & SPECIFIC KEYWORDS] / [VISUAL BRIEF]. Ignore her default makeup of the reference profile photo completely." : effectiveDna.makeupStyle}
    - Lighting: ${stylingOptions?.lighting ? "OVERRIDE REQUIRED: Change the lighting to match the scene description perfectly." : effectiveDna.lightingStyle}
    - Facial Features: ${effectiveDna.facialFeatures}
    ${stylingOptions?.faceDiversity ? "- FACE DIVERSITY MANDATE: You MUST explicitly randomize the model's facial features. Vary the eye shape, nose bridge, lip fullness, and skin undertones. Add micro-imperfections (pores, subtle asymmetry) to ensure a unique, non-repetitive identity." : ""}
    - Physical Stats: Height ${effectiveDna.height}cm, Weight ${effectiveDna.weight}kg
    ${!isLingerie ? `- Body Measurements: Bust ${effectiveDna.measurements.bust}, Waist ${effectiveDna.measurements.waist}, Hip ${effectiveDna.measurements.hip}, Wrist ${effectiveDna.measurements.wrist}cm, Ankle ${effectiveDna.measurements.ankle}cm, Head Width ${effectiveDna.measurements.headWidth}cm, Head Height ${effectiveDna.measurements.headHeight}cm` : ""}
    ${effectiveDna.celebrityBlend ? `- CELEBRITY BLEND: ${effectiveDna.celebrityBlend}` : ""}
    ${effectiveDna.promptDna ? `- PROMPT DNA MATRIX: ${effectiveDna.promptDna}` : ""}
    ${""}
    
    CHARACTER CONSISTENCY MANDATE (CRITICAL):
    - You MUST render the model holding the EXACT visual resemblance/identity structure (face shape, nose, eyes, facial skeleton) from the reference image, but allow changing style elements as commanded below:
    - Do not change her underlying face structure or ethnicity.
    ${stylingOptions?.hairstyle ? "- HAIR OVERRIDE PERMITTED & REQUIRED: Since the HAIR switch is ON, you MUST change her hairstyle/hair color to match the prompt briefing. Do NOT copy the hairstyle or hair color from her profile reference photo." : ""}
    ${stylingOptions?.makeup ? "- MAKEUP OVERRIDE PERMITTED & REQUIRED: Since the MAKEUP switch is ON, you MUST change her makeup style/makeup colors to match the prompt briefing. Do NOT copy the makeup from her profile reference photo." : ""}
    - The model's identity must be 100% consistent. If a reference image is provided, her facial features must be a perfect match to that person.
    - ABSOLUTELY NO CHARACTER DRIFT. The person in the image must be the same person every time.
    
    FACE DIVERSITY INJECTION (FOR NEW GENERATIONS):
    - If no specific reference image is provided, you MUST generate a unique, non-repetitive face. 
    - Vary the "Latent DNA": change the subtle tilt of the eyes, the width of the nostrils, the curve of the jawline, and the specific texture of the skin.
    - Ensure the face looks like a real human with unique characteristics, not a generic AI model.
    
    STYLING ENHANCEMENTS:
    ${stylingOptions?.fineJewelry ? (gender === ProductGender.FEMALE ? `- FINE JEWELRY (DELICATE & MINIMALIST): You MUST style the female model with the following jewelry. SCALE IS CRITICAL: The jewelry must be small, fine, and discreet, not oversized or flashy. Earrings and Necklace are MANDATORY. A single Ring is OPTIONAL and should only appear if it enhances the scene: ${DEFAULT_FEMALE_JEWELRY}` : "- FINE JEWELRY: Style the model with exquisite, high-end jewelry (earrings, necklaces, rings) that complements the outfit without overshadowing the product.") : ""}
    ${stylingOptions?.accessoryStyling ? "- ACCESSORY STYLING: Add sophisticated accessories (handbags, scarves, hats, or belts) to create a complete, high-fashion editorial look." : ""}
    ${stylingOptions?.hairstyle ? "- ARTISTIC HAIRSTYLE MANDATE: You MUST change the model's hairstyle and color from the reference image. Replicate the specific look (length, color, texture, style) described in the [USER INTENT & SPECIFIC KEYWORDS] section with 100% fidelity." : ""}

    CRITICAL IDENTITY & PROPORTION INSTRUCTION:
    - 9-HEAD PROPORTION: MANDATORY. The model must be rendered with 9-head proportions (exceptionally long legs, small head relative to body height). This is the "Golden Ratio" for high-fashion photography to ensure the model looks tall and elegant.
    - BODY TYPE (FEMALE): ${isLingerie ? "Tall, elegant, and statuesque professional model physique with exceptionally long legs, a fuller, well-defined, and shapely bust (ngực đầy đặn) and refined, toned proportions." : "Statuesque and graceful hourglass silhouette with exceptionally long legs, a refined, slim waist, a fuller, well-defined, and shapely bust (ngực đầy đặn), and elegant, toned curves."}
    - BODY TYPE (MALE): "Tall, chiseled, and authoritative V-taper physique with long limbs, broad, powerful shoulders and a lean, athletic waist."
    - IDENTITY PRESERVATION: Use the reference image for facial structure and body type. 
    - IDENTITY OVERRIDE: If a specific AGE or STYLE (e.g., "cute", "sweet", "youthful") is requested, you MUST prioritize the text description over the reference image.
    - GENDER MANDATE: The model MUST be ${gender === ProductGender.MALE ? 'MALE' : gender === ProductGender.FEMALE ? 'FEMALE' : 'the specified gender'}. Absolutely no swapping genders from the user's selection.
    - AGE LOCK MANDATE (SUPREME): The model's facial maturity must match ${effectiveDna.age} with 100% precision. If 18, NO mature features, NO sharp contouring, NO heavy "adult" makeup. If 24, they should look like a youthful professional. Keep facial geometry, jawline, and eye distance EXACTLY consistent with the DNA profile. Absolutely NO age fluctuation between shots.
    - DE-AGING & AGE LOCK MANDATE: If the requested age is young (e.g., 18-19), ensure the skin texture is flawless, features are softer, and the expression is innocent/sweet/dreamy. Avoid heavy contouring, mature makeup, or sharp shadows that add years to the face. The model MUST look like their requested age with 100% precision. Absolutely NO aging or maturing the face beyond the requested number.
    - FACIAL AUTHENTICITY: Maintain the specific Vietnamese/Asian beauty characteristics (large almond eyes, soft jawline, warm beige skin) if applicable. 
    - MUSE STYLE (FOR LINGERIE/SLEEPWEAR): If the category is Lingerie/Sleepwear, you MUST apply a "Muse" (Nàng thơ) aesthetic - ethereal, soft, poetic, and youthful.
    - DO NOT GENERATE A GENERIC MODEL. Maintain the character's essence but adapt to the requested age and hair.
  ` : "";

  let finalVisualPrompt = "";
  try {
    const thinkingParts: any[] = [
      { text: CORE_PRODUCT_CONSTRAINTS },
      ...(sceneMode === 'model' ? [{ text: MODEL_CONSTRAINTS }] : []),
      { text: `
        IN-DEPTH ANALYSIS & FIDELITY SETUP:
        
        ${JEWELRY_SCALE_CONSTRAINTS}
        ${STYLING_GUIDE}
        ${chloeStylingInjection}
        ${isLingerie ? LINGERIE_GOLDEN_RULES : ""}
        ${isMockup ? MOCKUP_PRINT_GOLDEN_RULES : ""}

        SCENE MODE: ${modeInstruction}
        PRODUCT CATEGORY: ${category}

        1. PRODUCT SIGNATURE & DESIGN: "${sanitizedSignature}". 
        2. MEASUREMENT & SPATIAL CONSTRAINTS (CRITICAL): "${measurementConstraints}". 
           - MANDATORY: You must use mathematical ratios, ASPECT RATIO, and SOURCE ANCHOR POINTS analyzed from the original image.
           - SPATIAL REASONING & DEPTH: Analyze the background reference image for depth and physical boundaries. The model and product MUST NOT intersect with walls, furniture, or any solid objects.
           - LOGO & PATTERN FIDELITY: You MUST maintain the exact relative scale and position of logos and patterns as described in the analysis. If a logo is small in the original, it must remain small in the result. Do not enlarge or reposition branding.
           - MAPPING: If the original image has a model wearing the product, use that as a reference for how the product fits the body. If a specific POSE (${modelPose}) is selected, you MUST adapt the product's position to the new pose while maintaining the same fit and scale. DO NOT copy the pose from the original image if it contradicts the requested pose.
           - ANTI-DISTORTION: Absolutely no stretching or distorting the product to fit the model.
           - SPATIAL REASONING: Calculate 3D space. The product must look real, not arbitrarily stretched or shrunk.
        3. PHYSICAL STRUCTURE ANALYSIS: Meticulous stitching, texture, logo. Use ALL provided product images to understand every angle and detail.
        4. WATCH SPECIFIC SCALING (IF CATEGORY IS WATCHES):
           - If the product is a watch, you MUST use the "Wrist Circumference" from the MODEL DNA (${effectiveDna?.measurements.wrist}cm) as the primary anchor.
           - Calculate the watch face diameter (mm) from the "MEASUREMENT CONSTRAINTS" and render it with 100% mathematical accuracy relative to the wrist.
           - ABSOLUTELY NO ENLARGING OR SHRINKING. The watch must maintain its real-world scale.
        5. SCALE & ARTISTIC STRATEGY:
           - SCALE: ${sceneMode === 'model' ? 'Use data from "MEASUREMENT CONSTRAINTS" to establish a 1:1 ratio between product and model.' : 'Ensure the product is the central focus with realistic scale relative to the background.'}
           - POSING & ANATOMY: ${sceneMode === 'model' ? 'Set flexible model poses, paying special attention to Neck & Shoulder relaxation. Ensure the pose is physically possible within the environment.' : 'NO MODEL OR ANATOMY ALLOWED. Focus on product placement.'}
           - GROOMING & ACCESSORIES: ${sceneMode === 'model' ? (gender === ProductGender.FEMALE && stylingOptions?.fineJewelry ? `DELICATE JEWELRY SELECTION: Earrings and Necklace are MANDATORY. A single Ring is OPTIONAL. Use the provided BRAND STANDARD JEWELRY reference images for the exact design. ${DEFAULT_FEMALE_JEWELRY}` : 'Propose hairstyle and jewelry (jewelry must describe materials/style clearly) consistent with the scene.') : 'NO GROOMING. Focus on product styling (e.g., how it is folded, draped, or positioned).'}
           - LIGHTING & CONSISTENCY: If a BACKGROUND REFERENCE IMAGE is provided, you MUST extract exact lighting direction, intensity, and color temperature from it. Ensure absolute synchronization between product and environment.
           - MANDATORY ANATOMY AUDIT: You MUST perform a mental audit of the model's anatomy. Check for limb symmetry, joint integrity, and proportional balance. Ensure the pose is physically possible and elegant.
           - ENVIRONMENTAL RESPECT: The model MUST NOT penetrate or phase through background elements. If standing near a wall, there must be a clear physical gap or realistic contact point.
           - BACKGROUND REMOVAL: MANDATORY to completely ignore the background in the product images. Take only the product.
           - VISUAL PATHWAY: Create leading lines towards the product.
        5. TECHNICAL MANDATES (MANDATORY COMPLIANCE):
           - Camera Angle: ${angleDesc}
           - Framing: ${framingDesc}
           - Pose: ${poseDesc}
           - NOTE: Your visual prompt must strictly adhere to these technical specifications. Absolutely no changing the specified camera angle or framing.
        ${isLingerie ? LINGERIE_GOLDEN_RULES : ""}
        
        ${dnaPrompt}
        
        ENVIRONMENT & MODEL DESCRIPTION PRIORITY (SUPREME MANDATE): 
        - You MUST use the entire content of "${sanitizedBrief}" as the core foundation. 
        - Absolutely DO NOT omit specific raw details provided by the user. 
        - SPECIAL ATTENTION: If "${sanitizedBrief}" describes age (e.g., "18 years old", "teen") or aura (e.g., "cute", "sweet"), you MUST prioritize those descriptions.
        - If the model in the original image looks older than requested, you MUST command "De-aging", softening facial features, using natural clear makeup to achieve the requested age and aura.
        - If a BACKGROUND REFERENCE IMAGE is provided, you must describe how its light and color interact directly with the product.
        - The result of this step is an extremely detailed scene description, combining text and reference image analysis.
      ` }
    ];

    productImages.forEach((img, index) => {
      const cleaned = cleanBase64(img);
      if (cleaned) {
        thinkingParts.push({ text: `PRODUCT IMAGE ${index + 1}:` });
        thinkingParts.push({ inlineData: { data: cleaned, mimeType: 'image/jpeg' } });
      }
    });

    if (macroImages && macroImages.length > 0) {
      macroImages.forEach((img, index) => {
        const cleaned = cleanBase64(img);
        if (cleaned) {
          thinkingParts.push({ text: `MACRO DETAIL IMAGE ${index + 1} (CRITICAL - REPLICATE EXACTLY):` });
          thinkingParts.push({ inlineData: { data: cleaned, mimeType: 'image/jpeg' } });
        }
      });
    }

    if (customBackgroundBase64) {
      const cleanedBg = cleanBase64(customBackgroundBase64);
      if (cleanedBg) {
        thinkingParts.push({ text: `REFERENCE IMAGE FOR BACKGROUND & COMPOSITION:` });
        thinkingParts.push({ inlineData: { data: cleanedBg, mimeType: 'image/jpeg' } });
      }
    }
    if (safeModelImage) {
      const cleanedModel = cleanBase64(safeModelImage);
      if (cleanedModel) {
        thinkingParts.push({ text: `MODEL REFERENCE IMAGE:` });
        thinkingParts.push({ inlineData: { data: cleanedModel, mimeType: 'image/jpeg' } });
      }
    }
    if (sourceImageBase64) {
      const cleanedSource = cleanBase64(sourceImageBase64);
      if (cleanedSource) {
        thinkingParts.push({ text: `SOURCE IMAGE TO EDIT (GROUND TRUTH FOR BACKGROUND):` });
        thinkingParts.push({ inlineData: { data: cleanedSource, mimeType: 'image/jpeg' } });
      }
    }

    // Add Brand Standard Jewelry as reference if applicable
    if (brandJewelry) {
      if (brandJewelry.earrings) {
        const cleanedEarrings = cleanBase64(brandJewelry.earrings);
        if (cleanedEarrings) {
          thinkingParts.push({ text: `BRAND STANDARD EARRINGS REFERENCE:` });
          thinkingParts.push({ inlineData: { data: cleanedEarrings, mimeType: 'image/jpeg' } });
        }
      }
      if (brandJewelry.necklace) {
        const cleanedNecklace = cleanBase64(brandJewelry.necklace);
        if (cleanedNecklace) {
          thinkingParts.push({ text: `BRAND STANDARD NECKLACE REFERENCE:` });
          thinkingParts.push({ inlineData: { data: cleanedNecklace, mimeType: 'image/jpeg' } });
        }
      }
      if (brandJewelry.ring) {
        const cleanedRing = cleanBase64(brandJewelry.ring);
        if (cleanedRing) {
          thinkingParts.push({ text: `BRAND STANDARD RING REFERENCE:` });
          thinkingParts.push({ inlineData: { data: cleanedRing, mimeType: 'image/jpeg' } });
        }
      }
    }
    
    const thinkingResponse = await callWithRetry(() => ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts: thinkingParts },
        config: { 
            temperature: 0.2, 
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            systemInstruction: "You are an Art Director. Your goal is to synthesize a photorealistic scene. Focus on: 1. SUBJECT MACRO-DETAILS: Visible skin pores, natural hair strands, fabric weave. 2. MINIMALIST ENVIRONMENT: Soft bokeh. 3. ORGANIC INTERACTION, DIRECT CONTACT & PARTIAL ASSET CROPPING (CRITICAL): If the scene contains massive objects like vehicles (car, cabin, boat) or furniture (sofa, desk, table, balcony), do NOT describe the entire object in the frame - this forces a wide shot where the model looks tiny and far. Instead, enforce a tight, intimate, high-fashion crop showing only a partial section of the object (e.g., only the low metallic hood/capo, a part of the open car door, or the leather seats inside). Low structures must remain strictly at thigh/waist height relative to a standing model. For SITTING, the model must be seated DIRECTLY inside the open cockpit/seats or on the surface of the asset. For LEANING, the model must bend/lean forward naturally, placing their hands or forearms heavily on the low object, maintaining perfect human skeletal physics and direct contact, ensuring high character proximity and a close-up cinematic portrait. ALSO COMPLY WITH COMPOSITION MANDATE: " + textSpaceDesc
        } as any
    }));
    finalVisualPrompt = (thinkingResponse.text || sceneBrief) + `
      
      STRICT FIDELITY & ANATOMY MANDATE (CRITICAL):
      - LIMB ATTACHMENT LOCK: All limbs MUST be naturally and visibly attached to the torso. Absolutely NO floating arms or legs.
      - SPATIAL ANCHORING: The model's body MUST be physically anchored to objects in the scene. Use contact shadows to ground the person.
      - GEOMETRIC ACCURACY: Maintain 1:1 ratios of the product relative to the body parts. Use the "MEASUREMENT & SPATIAL CONSTRAINTS" for 100% accuracy.
    `;
    // Add a final spatial check to the prompt
    finalVisualPrompt += "\n\nCRITICAL SPATIAL MANDATE: The model and product must exist realistically within the 3D space of the background. Absolutely no phasing through walls or solid objects. Respect all environmental boundaries. Apply layout style: " + textSpaceDesc;
  } catch (e) {
    finalVisualPrompt = sceneBrief;
  }

  try {
    const finalPromptText = `
### ANATOMY & SPATIAL INTEGRITY (PRIORITY 1) ###
- MANDATORY: Flawless human anatomy. Exactly 5 fingers.
- LIMB ATTACHMENT: Every arm/leg must have a natural connection point to the torso. NO DISCONNECTED LIMBS.
- SPATIAL LOCK: No clipping through walls or floors. Ground the model with realistic contact shadows.
- NO FLOATING OBJECTS: Every prop must sit on a surface or be held naturally.

### TECHNICAL SPECIFICATIONS & MACRO DETAIL ###
- STYLE: Ultra-photorealistic high-end editorial. Shot on Hasselblad H6D, 100MP.
- FOCUS: Razor-sharp focus on the subject. High-frequency skin texture (visible pores, natural peach fuzz). 
- HAIR & TEXTURE: Silky hair with individual strand rendering, rich fabric weave detail.
- QUALITY: Soft-focus blurred background (bokeh) for depth, natural cinematic lighting. 
- CAMERA: ${angleDesc}. ${framingDesc}.
- COMPOSITION COMPLIANCE: ${textSpaceDesc}
- POSE & ANONYMITY: ${poseDesc}.

### SUBJECT & ENVIRONMENT ###
- SUBJECT TYPE: ${modeInstruction}
- FASHION DNA & STYLING:
${dnaPrompt}
${isLingerie ? LINGERIE_GOLDEN_RULES : ""}
${VIBE_STYLING_MANDATES[vibe] || ""}
${chloeStylingInjection}
${HIGH_FASHION_PHYSICALITY}
${vibe === 'Editorial' ? 'Architecture-inspired couture' : vibe} vibe styling. 
${finalVisualPrompt}

### [USER INTENT & SPECIFIC KEYWORDS] ###
### [VISUAL BRIEF] ###
${sanitizedBrief}

### PRODUCT REPLICATION (GROUND TRUTH) ###
- PRODUCT: ${category} - ${sanitizedSignature}
- SCALE CONSTRAINTS: ${measurementConstraints}
- LOGO LOCK: Do not mirror asymmetrical logos. 1:1 replica of source images.

### NEGATIVE CONSTRAINTS ###
- NO extra limbs, NO fused fingers, NO floating arms, NO broken joints.
- NO 3D render look, NO anime style, NO watermarks, NO text, NO cluttered backgrounds.
    `.trim();

    const finalParts: any[] = [{ text: finalPromptText }];
    productImages.slice(0, 3).forEach((img) => {
      const cleaned = cleanBase64(img);
      if (cleaned) {
        finalParts.push({ inlineData: { data: cleaned, mimeType: 'image/jpeg' } });
      }
    });
    if (safeModelImage) {
      const cleanedModel = cleanBase64(safeModelImage);
      if (cleanedModel) {
        finalParts.push({ inlineData: { data: cleanedModel, mimeType: 'image/jpeg' } });
      }
    }
    if (sourceImageBase64) {
      const cleanedSource = cleanBase64(sourceImageBase64);
      if (cleanedSource) {
        finalParts.push({ text: "SOURCE IMAGE TO EDIT: Use this as the base for reconstruction." });
        finalParts.push({ inlineData: { data: cleanedSource, mimeType: 'image/jpeg' } });
      }
    }
    if (upscaleFromImage) {
      const cleanedUpscale = cleanBase64(upscaleFromImage);
      if (cleanedUpscale) {
        finalParts.push({ inlineData: { data: cleanedUpscale, mimeType: 'image/png' } });
      }
    }

    if (modelProfileImageBase64) {
      const cleanedProfile = cleanBase64(modelProfileImageBase64);
      if (cleanedProfile) {
        finalParts.push({ text: "MODEL IDENTITY REFERENCE (MULTI-ANGLE): Use this as the ABSOLUTE identity anchor to maintain 100% character consistency." });
        finalParts.push({ inlineData: { data: cleanedProfile, mimeType: 'image/jpeg' } });
      }
    }

    // Add Brand Standard Jewelry to final generation if applicable
    if (brandJewelry) {
      if (brandJewelry.jewelryRef) {
        const cleanedJewelryRef = cleanBase64(brandJewelry.jewelryRef);
        if (cleanedJewelryRef) {
          finalParts.push({ text: "BRAND JEWELRY DESIGN REFERENCE: Replicate the design, scale, and materials of the jewelry shown here." });
          finalParts.push({ inlineData: { data: cleanedJewelryRef, mimeType: 'image/jpeg' } });
        }
      }
      if (brandJewelry.earrings) {
        const cleanedEarrings = cleanBase64(brandJewelry.earrings);
        if (cleanedEarrings) {
          finalParts.push({ text: "BRAND STANDARD EARRINGS: Use this exact design." });
          finalParts.push({ inlineData: { data: cleanedEarrings, mimeType: 'image/jpeg' } });
        }
      }
      if (brandJewelry.necklace) {
        const cleanedNecklace = cleanBase64(brandJewelry.necklace);
        if (cleanedNecklace) {
          finalParts.push({ text: "BRAND STANDARD NECKLACE: Use this exact design." });
          finalParts.push({ inlineData: { data: cleanedNecklace, mimeType: 'image/jpeg' } });
        }
      }
      if (brandJewelry.ring) {
        const cleanedRing = cleanBase64(brandJewelry.ring);
        if (cleanedRing) {
          finalParts.push({ text: "BRAND STANDARD RING: Use this exact design." });
          finalParts.push({ inlineData: { data: cleanedRing, mimeType: 'image/jpeg' } });
        }
      }
    }

    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: finalParts },
      config: {
        temperature: upscaleFromImage ? 0.05 : Math.min(0.2, (creativityLevel / 500)),
        imageConfig: { 
          aspectRatio: aspectRatio as any, 
          imageSize: resolution 
        },
        tools: [
          {
            googleSearch: {
              searchTypes: {
                webSearch: {},
                imageSearch: {},
              }
            },
          },
        ],
        seed: seed,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      },
    }));

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) return { image: `data:image/png;base64,${part.inlineData.data}`, prompt: finalPromptText };
        if (part.text) {
          console.warn("Model returned text instead of image:", part.text);
          // Often the model explains why it refused
          throw new Error(`AI Refusal: ${part.text}`);
        }
      }
    }
    
    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason) {
      throw new Error(`Image generation failed. Reason: ${finishReason}`);
    }

    throw new Error("No image data received from AI service.");
  } catch (error: any) {
    throw error;
  }
};

/**
 * Optimizes the user's idea and system parameters into a cohesive, logical prompt.
 * Prevents conflicts, distortions, and ensures spatial logic.
 */
export const optimizePrompt = async (
  rawIdea: string, 
  category: ProductCategory, 
  sceneMode: SceneMode,
  vibe: string
): Promise<string> => {
  const ai = getGoogleGenAI();

  const systemInstruction = `
    You are a Prompt Optimization Expert for High-End AI Image Generation.
    Your task is to take a raw user idea and refine it into a logically sound, non-conflicting, and high-fidelity prompt.

    RULES:
    1. RESOLVE CONFLICTS: If the user asks for "Still Life" but mentions a "Model", prioritize the Scene Mode (${sceneMode}). Remove references to models in Still Life/Ghost modes.
    2. SPATIAL LOGIC, HEIGHT & INTEGRATION (CRITICAL): Ensure the environment and objects make physical sense. 
       - HEIGHT: Enforce realistic relative height proportions: a car hood (nắp capo) or table stays low, strictly around the lower-body (thigh or waist level) relative to a standing model, never chest height.
       - PARTIAL ASSET CROPPING (NON-NEGOTIABLE): When the scene contains massive backdrop objects (like a car, vehicle, sofa, yacht, counter, desk, wall, or window), do NOT describe the whole object in the frame - this forces a wide lens, making the model tiny/distant and the pose interaction fake or meaningless. Instead, write a tight, intimate, close-up crop showing only a partial area/fragment of the asset (e.g. only a portion of the green metallic car hood, only the luxury car door panel, or just the rich leather seats/cockpit of an open-top vintage convertible).
       - POSTURE INTEGRATION: For SITTING or LEANING poses with an asset, the model MUST be in direct, physical contact with it (e.g. sitting comfortably inside the open cockpit/car seats, or leaning heavily with their forearm rested on the low hood while bending their torso forward organically).
    3. PREVENT DISTORTION: Avoid terms that cause AI to hallucinate extra limbs or weird proportions.
    4. FIDELITY FIRST (CRITICAL): You MUST preserve every specific detail from the user's input:
       - HAIR: Hairstyle, hair color, hair length.
       - MAKEUP: Makeup style, colors, specific looks.
       - PROPS: Any items or objects mentioned (e.g., "vintage radio", "coffee cup", "flowers").
       - AMBIANCE: Weather, specific lighting, time of day.
       - You are NOT allowed to "summarize" these out. They must be present in the optimized output.
    5. MOCKUP/PRINT LOGIC: If the category is UX/UI or Mockup, ensure the prompt describes the design being "applied" to a device or surface, rather than just being a flat image.
    6. OUTPUT: Return ONLY the optimized, descriptive paragraph. No explanations.
    7. LANGUAGE: If the input is in Vietnamese, output in English for better AI compatibility, but ensure ALL physical details (hair, color, props) are translated accurately and preserved.
  `;

  try {
    const response = await callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: `Optimize this prompt: "${rawIdea}" for a ${category} in ${sceneMode} mode with a ${vibe} vibe.` }] }],
      config: {
        systemInstruction,
        temperature: 0.4,
      }
    }));

    return response.text.trim() || rawIdea;
  } catch (error) {
    console.error("Prompt optimization failed, falling back to raw idea:", error);
    return rawIdea;
  }
};
