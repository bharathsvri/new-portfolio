import React, { useEffect, useRef } from "react";

/**
 * Realistic Procedural Spider Simulation
 * Features:
 * - Anatomically accurate cephalothorax, abdomen, pedipalps, chelicerae (fangs), and 8 eyes.
 * - 8 multi-jointed legs solved via Inverse Kinematics (IK) with high-arched knees and tarsus claws.
 * - Alternating tetrapod gait (diagonal leg pairs step while the opposing 4 legs remain planted).
 * - 3D foot lift with dynamic ground drop shadows for lifelike depth.
 * - Inertial spring physics on the abdomen (sways during turns and scuttles).
 * - Fading silk dragline emitted from spinnerets.
 * - Organic predatory AI: scuttles in bursts, creeps when close, strikes on click, twitches when idle.
 * - Fully responsive, Retina/High-DPI canvas, touch-enabled, dark/light theme reactive.
 */

// Helper math
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function normalizeAngle(ang) {
  let a = ang;
  while (a < -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

// 8 Leg anatomical configuration (angles and reaches relative to body centerline)
// Pair 0: Anterior (Front) - reach forward
// Pair 1: Mid-Anterior - reach wide-forward
// Pair 2: Mid-Posterior - reach wide-backward
// Pair 3: Posterior (Rear) - reach backward
const LEG_CONFIGS = [
  // 0: L0 (Front Left)
  {
    side: -1,
    hipOffsetAngle: -0.55,
    hipDist: 14,
    restAngle: -0.62,
    restDist: 62,
    L1: 34,
    L2: 30,
    tarsus: 13,
    kneeBend: -1,
    gaitGroup: 0,
  },
  // 1: R0 (Front Right)
  {
    side: 1,
    hipOffsetAngle: 0.55,
    hipDist: 14,
    restAngle: 0.62,
    restDist: 62,
    L1: 34,
    L2: 30,
    tarsus: 13,
    kneeBend: -1,
    gaitGroup: 1,
  },
  // 2: L1 (Mid-Front Left)
  {
    side: -1,
    hipOffsetAngle: -1.15,
    hipDist: 15,
    restAngle: -1.2,
    restDist: 68,
    L1: 37,
    L2: 33,
    tarsus: 14,
    kneeBend: -1,
    gaitGroup: 1,
  },
  // 3: R1 (Mid-Front Right)
  {
    side: 1,
    hipOffsetAngle: 1.15,
    hipDist: 15,
    restAngle: 1.2,
    restDist: 68,
    L1: 37,
    L2: 33,
    tarsus: 14,
    kneeBend: -1,
    gaitGroup: 0,
  },
  // 4: L2 (Mid-Back Left)
  {
    side: -1,
    hipOffsetAngle: -1.8,
    hipDist: 15,
    restAngle: -1.85,
    restDist: 66,
    L1: 35,
    L2: 32,
    tarsus: 13,
    kneeBend: 1,
    gaitGroup: 0,
  },
  // 5: R2 (Mid-Back Right)
  {
    side: 1,
    hipOffsetAngle: 1.8,
    hipDist: 15,
    restAngle: 1.85,
    restDist: 66,
    L1: 35,
    L2: 32,
    tarsus: 13,
    kneeBend: 1,
    gaitGroup: 1,
  },
  // 6: L3 (Rear Left)
  {
    side: -1,
    hipOffsetAngle: -2.35,
    hipDist: 14,
    restAngle: -2.4,
    restDist: 74,
    L1: 40,
    L2: 36,
    tarsus: 15,
    kneeBend: 1,
    gaitGroup: 1,
  },
  // 7: R3 (Rear Right)
  {
    side: 1,
    hipOffsetAngle: 2.35,
    hipDist: 14,
    restAngle: 2.4,
    restDist: 74,
    L1: 40,
    L2: 36,
    tarsus: 15,
    kneeBend: 1,
    gaitGroup: 0,
  },
];

class RealSpider {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.vx = 0;
    this.vy = 0;
    this.speed = 0;
    this.angularVelocity = 0;

    // Abdomen spring-damping
    this.abdomenAngle = Math.PI;
    this.abdomenAngVel = 0;

    // Pedipalps twitch phase
    this.palpPhase = 0;

    // Fangs spread state (spreads on strike / click)
    this.fangSpread = 0;

    // Gait coordination
    this.gaitGroup = 0; // 0 or 1
    this.lastStepTime = performance.now();

    // Silk dragline points: { x, y, time }
    this.silkTrail = [];
    this.lastSilkAdd = 0;

    // Initialize 8 legs
    this.legs = LEG_CONFIGS.map((cfg) => {
      const hipX = this.x + Math.cos(this.angle + cfg.hipOffsetAngle) * cfg.hipDist;
      const hipY = this.y + Math.sin(this.angle + cfg.hipOffsetAngle) * cfg.hipDist;
      const restX = hipX + Math.cos(this.angle + cfg.restAngle) * cfg.restDist;
      const restY = hipY + Math.sin(this.angle + cfg.restAngle) * cfg.restDist;

      return {
        ...cfg,
        currentFoot: { x: restX, y: restY },
        startFoot: { x: restX, y: restY },
        targetFoot: { x: restX, y: restY },
        stepProgress: 1, // 1 = planted
        stepDuration: 110,
        stepStartTime: 0,
        height: 0,
      };
    });
  }

  update(targetX, targetY, isMouseDown, now) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    // Target stop radius: keep a slight respectful predatory distance from mouse pointer
    const stopDist = isMouseDown ? 8 : 34;
    const isChasing = dist > stopDist;

    // Desired heading
    const desiredAngle = Math.atan2(dy, dx);
    const angleDiff = normalizeAngle(desiredAngle - this.angle);

    // Fast, crisp spider rotation
    const rotSpeed = isMouseDown ? 0.28 : 0.2;
    this.angle += angleDiff * rotSpeed;
    this.angularVelocity = angleDiff * rotSpeed;

    // Spider scuttle acceleration: rapid bursts, sudden stop, sprinting when mouse is down
    const maxSpeed = isMouseDown ? 8.5 : 5.8;
    const accel = isMouseDown ? 0.35 : 0.22;

    if (isChasing) {
      // Slow down slightly if facing wrong direction
      const facingFactor = Math.max(0.2, Math.cos(angleDiff));
      const targetSpeed = Math.min(maxSpeed, Math.max(1.8, (dist - stopDist) * 0.12)) * facingFactor;
      this.speed += (targetSpeed - this.speed) * accel;
    } else {
      // Sharp predatory halt
      this.speed *= 0.65;
      if (this.speed < 0.05) this.speed = 0;
    }

    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.x += this.vx;
    this.y += this.vy;

    // Fang spread animation
    const targetFang = isMouseDown ? 0.45 : this.speed > 2 ? 0.18 : 0;
    this.fangSpread += (targetFang - this.fangSpread) * 0.2;

    // Abdomen inertial physics (spring & damper behind cephalothorax)
    const targetAbdomenAngle = normalizeAngle(this.angle + Math.PI);
    const diffAbdomen = normalizeAngle(targetAbdomenAngle - this.abdomenAngle);
    this.abdomenAngVel += diffAbdomen * 0.08;
    this.abdomenAngVel *= 0.72; // damping
    this.abdomenAngle += this.abdomenAngVel;

    // Pedipalp idle & stalking twitch
    this.palpPhase += this.speed > 0.5 ? 0.25 : 0.05;

    // Gait coordination (Alternating Tetrapod Gait)
    this.updateLegs(now, isMouseDown);

    // Silk dragline emissions from spinnerets
    this.updateSilk(now);
  }

  updateLegs(now, isMouseDown) {
    const isMoving = this.speed > 0.2 || Math.abs(this.angularVelocity) > 0.04;
    const stepDuration = isMouseDown ? 80 : Math.max(85, 130 - this.speed * 8);

    const activeGroupLegs = this.legs.filter((l) => l.gaitGroup === this.gaitGroup);
    const anyActiveStepping = activeGroupLegs.some((l) => l.stepProgress < 1);

    if (!anyActiveStepping) {
      // Check if any leg in active group is stretched too far from ideal position
      let triggerStep = false;
      const stepLead = this.speed > 0.5 ? (isMouseDown ? 12 : 9) : 3;

      for (const leg of activeGroupLegs) {
        const hipX = this.x + Math.cos(this.angle + leg.hipOffsetAngle) * leg.hipDist;
        const hipY = this.y + Math.sin(this.angle + leg.hipOffsetAngle) * leg.hipDist;

        // Ideal planted foot position leads slightly in direction of velocity
        const idealX =
          hipX +
          Math.cos(this.angle + leg.restAngle) * leg.restDist +
          this.vx * stepLead;
        const idealY =
          hipY +
          Math.sin(this.angle + leg.restAngle) * leg.restDist +
          this.vy * stepLead;

        const stretch = Math.hypot(idealX - leg.currentFoot.x, idealY - leg.currentFoot.y);
        const threshold = isMoving ? 16 : 26;

        if (stretch > threshold) {
          triggerStep = true;
          break;
        }
      }

      if (triggerStep) {
        // Step all legs in the current active group
        for (const leg of activeGroupLegs) {
          const hipX = this.x + Math.cos(this.angle + leg.hipOffsetAngle) * leg.hipDist;
          const hipY = this.y + Math.sin(this.angle + leg.hipOffsetAngle) * leg.hipDist;

          // Target foot position leads ahead to minimize future strain
          const leadAhead = isMouseDown ? 14 : 10;
          const targetFootX =
            hipX +
            Math.cos(this.angle + leg.restAngle) * leg.restDist +
            this.vx * leadAhead;
          const targetFootY =
            hipY +
            Math.sin(this.angle + leg.restAngle) * leg.restDist +
            this.vy * leadAhead;

          leg.startFoot = { ...leg.currentFoot };
          leg.targetFoot = { x: targetFootX, y: targetFootY };
          leg.stepProgress = 0;
          leg.stepDuration = stepDuration;
          leg.stepStartTime = now;
        }
      } else if (isMoving) {
        // If active group doesn't need to step but spider is moving, switch to check opposite group
        this.gaitGroup = 1 - this.gaitGroup;
      }
    }

    // Advance stepping legs
    let allFinished = true;
    for (const leg of this.legs) {
      if (leg.stepProgress < 1) {
        const elapsed = now - leg.stepStartTime;
        leg.stepProgress = Math.min(1, elapsed / leg.stepDuration);

        // Smooth cubic ease for foot stride
        const t = leg.stepProgress;
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        leg.currentFoot.x =
          leg.startFoot.x + (leg.targetFoot.x - leg.startFoot.x) * ease;
        leg.currentFoot.y =
          leg.startFoot.y + (leg.targetFoot.y - leg.startFoot.y) * ease;

        // Realistic 3D lift off the ground during stride
        leg.height = Math.sin(leg.stepProgress * Math.PI) * (isMouseDown ? 14 : 10);

        if (leg.stepProgress < 1) {
          allFinished = false;
        }
      } else {
        leg.height = 0;
      }
    }

    // When the stepping group finishes, switch active group to the opposite set
    if (allFinished && anyActiveStepping) {
      this.gaitGroup = 1 - this.gaitGroup;
    }
  }

  updateSilk(now) {
    // Spinnerets location at the rear of abdomen
    const pedicelDist = 13;
    const abdomenDist = 26;
    const spinX = this.x + Math.cos(this.abdomenAngle) * (pedicelDist + abdomenDist);
    const spinY = this.y + Math.sin(this.abdomenAngle) * (pedicelDist + abdomenDist);

    if (now - this.lastSilkAdd > 70) {
      this.lastSilkAdd = now;
      this.silkTrail.push({ x: spinX, y: spinY, time: now });
      // Keep trailing silk points within last 4.5 seconds
      if (this.silkTrail.length > 70) {
        this.silkTrail.shift();
      }
    }

    // Prune old silk
    const cutoff = now - 4500;
    while (this.silkTrail.length > 0 && this.silkTrail[0].time < cutoff) {
      this.silkTrail.shift();
    }
  }

  draw(ctx, isDark, now) {
    ctx.save();

    // Color palette
    const accentColor = isDark ? "#00C4FF" : "#7334D9";
    const bodyBaseColor = isDark ? "#0b1016" : "#1a0b2e";
    const bodyEdgeColor = isDark ? "#1f2e3d" : "#3b1754";
    const jointGlowColor = isDark ? "rgba(0, 196, 255, 0.85)" : "rgba(115, 52, 217, 0.75)";
    const shadowColor = "rgba(0, 0, 0, 0.45)";

    // 1. Draw silk dragline trail
    this.drawSilk(ctx, isDark, now);

    // 2. Draw ground drop shadows
    this.drawShadows(ctx, shadowColor);

    // 3. Draw 8 jointed legs
    this.drawLegs(ctx, bodyBaseColor, accentColor, jointGlowColor, isDark);

    // 4. Draw Pedipalps & Chelicerae (Fangs)
    this.drawAppendages(ctx, bodyBaseColor, accentColor, isDark);

    // 5. Draw Abdomen
    this.drawAbdomen(ctx, bodyBaseColor, bodyEdgeColor, accentColor, isDark, now);

    // 6. Draw Cephalothorax (Head & Carapace) + 8 Eyes
    this.drawCephalothorax(ctx, bodyBaseColor, bodyEdgeColor, accentColor, isDark);

    ctx.restore();
  }

  drawSilk(ctx, isDark, now) {
    if (this.silkTrail.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.silkTrail[0].x, this.silkTrail[0].y);

    for (let i = 1; i < this.silkTrail.length; i++) {
      const p = this.silkTrail[i];
      ctx.lineTo(p.x, p.y);
    }

    // Spinneret connection
    const pedicelDist = 13;
    const abdomenDist = 26;
    const spinX = this.x + Math.cos(this.abdomenAngle) * (pedicelDist + abdomenDist);
    const spinY = this.y + Math.sin(this.abdomenAngle) * (pedicelDist + abdomenDist);
    ctx.lineTo(spinX, spinY);

    ctx.strokeStyle = isDark ? "rgba(0, 196, 255, 0.3)" : "rgba(115, 52, 217, 0.25)";
    ctx.lineWidth = 0.85;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.restore();
  }

  drawShadows(ctx, shadowColor) {
    ctx.save();
    ctx.fillStyle = shadowColor;
    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 6;

    // Foot contact shadows
    for (const leg of this.legs) {
      const shadowRadius = Math.max(1.2, 2.8 - leg.height * 0.12);
      const shadowAlpha = Math.max(0.15, 0.5 - leg.height * 0.025);
      ctx.beginPath();
      // As foot lifts up, ground shadow stays on the floor
      ctx.ellipse(
        leg.currentFoot.x,
        leg.currentFoot.y + 4,
        shadowRadius * 1.5,
        shadowRadius,
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
      ctx.fill();
    }

    // Cephalothorax & abdomen central shadow
    ctx.beginPath();
    ctx.ellipse(this.x + 3, this.y + 7, 18, 14, this.angle, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();

    const abX = this.x + Math.cos(this.abdomenAngle) * 16;
    const abY = this.y + Math.sin(this.abdomenAngle) * 16;
    ctx.beginPath();
    ctx.ellipse(abX + 4, abY + 9, 21, 16, this.abdomenAngle, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawLegs(ctx, bodyBaseColor, accentColor, jointGlowColor, isDark) {
    for (const leg of this.legs) {
      const hipX = this.x + Math.cos(this.angle + leg.hipOffsetAngle) * leg.hipDist;
      const hipY = this.y + Math.sin(this.angle + leg.hipOffsetAngle) * leg.hipDist;

      // When foot is lifted in 3D, elevated foot point shifts subtly towards viewer
      const footX = leg.currentFoot.x;
      const footY = leg.currentFoot.y - leg.height * 0.6;

      // Ankle joint calculation (metatarsus/tarsus claw)
      const directAngle = Math.atan2(footY - hipY, footX - hipX);
      const ankleX = footX - Math.cos(directAngle + leg.side * 0.18) * leg.tarsus;
      const ankleY = footY - Math.sin(directAngle + leg.side * 0.18) * leg.tarsus;

      // Solve 2-joint IK to the ankle joint
      const dAx = ankleX - hipX;
      const dAy = ankleY - hipY;
      let dist = Math.hypot(dAx, dAy);
      const maxReach = (leg.L1 + leg.L2) * 0.96;
      if (dist > maxReach) dist = maxReach;
      if (dist < 4) dist = 4;

      const angleToAnkle = Math.atan2(dAy, dAx);
      const cosA = clamp(
        (leg.L1 * leg.L1 + dist * dist - leg.L2 * leg.L2) / (2 * leg.L1 * dist),
        -1,
        1
      );
      const innerA = Math.acos(cosA);

      // Knee angle flares outward and up
      const kneeAngle = angleToAnkle + leg.side * leg.kneeBend * innerA;
      // When leg lifts in 3D, knee extends slightly higher
      const liftKnee = leg.height * 0.3;
      const kneeX = hipX + (leg.L1 + liftKnee) * Math.cos(kneeAngle);
      const kneeY = hipY + (leg.L1 + liftKnee) * Math.sin(kneeAngle);

      // Segment 1: Coxa + Femur (Hip -> Knee) - thicker chitin
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(kneeX, kneeY);
      ctx.strokeStyle = bodyBaseColor;
      ctx.lineWidth = 3.8;
      ctx.lineCap = "round";
      ctx.stroke();

      // Femur chitin sheen / glowing accent
      ctx.beginPath();
      ctx.moveTo(hipX, hipY);
      ctx.lineTo(kneeX, kneeY);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // Segment 2: Tibia (Knee -> Ankle) - tapering
      ctx.beginPath();
      ctx.moveTo(kneeX, kneeY);
      ctx.lineTo(ankleX, ankleY);
      ctx.strokeStyle = bodyBaseColor;
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Tibia accent line
      ctx.beginPath();
      ctx.moveTo(kneeX, kneeY);
      ctx.lineTo(ankleX, ankleY);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Segment 3: Tarsus (Ankle -> Foot claw tip) - razor sharp
      ctx.beginPath();
      ctx.moveTo(ankleX, ankleY);
      ctx.lineTo(footX, footY);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Knee joint bulb & glow
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = jointGlowColor;
      ctx.fill();

      // Ankle joint bulb
      ctx.beginPath();
      ctx.arc(ankleX, ankleY, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = jointGlowColor;
      ctx.fill();

      // Foot claw dot
      ctx.beginPath();
      ctx.arc(footX, footY, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#ffffff" : accentColor;
      ctx.fill();
    }
  }

  drawAppendages(ctx, bodyBaseColor, accentColor, isDark) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // --- Chelicerae (Fangs) ---
    const fangBaseDist = 14;
    const fangSpreadAngle = 0.16 + this.fangSpread;
    const fangLength = 11;

    for (let s of [-1, 1]) {
      const bX = Math.cos(s * fangSpreadAngle) * fangBaseDist;
      const bY = Math.sin(s * fangSpreadAngle) * fangBaseDist;

      // Curved sharp fangs pinching inward
      const tipX = bX + Math.cos(s * 0.28) * fangLength;
      const tipY = bY + Math.sin(s * 0.28) * fangLength - s * 2.2;

      ctx.beginPath();
      ctx.moveTo(bX, bY);
      ctx.quadraticCurveTo(bX + 5, bY + s * 1.5, tipX, tipY);
      ctx.strokeStyle = isDark ? "#ffffff" : accentColor;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.stroke();

      // Venom tip highlight
      ctx.beginPath();
      ctx.arc(tipX, tipY, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
    }

    // --- Pedipalps (Front Feelers) ---
    const palpTwitch = Math.sin(this.palpPhase) * 0.12;
    for (let s of [-1, 1]) {
      const p0X = 12;
      const p0Y = s * 7;
      const p1Angle = s * 0.45 + s * palpTwitch;
      const p1X = p0X + Math.cos(p1Angle) * 11;
      const p1Y = p0Y + Math.sin(p1Angle) * 11;

      const p2Angle = p1Angle - s * 0.55;
      const p2X = p1X + Math.cos(p2Angle) * 9;
      const p2Y = p1Y + Math.sin(p2Angle) * 9;

      // Palp segment 1
      ctx.beginPath();
      ctx.moveTo(p0X, p0Y);
      ctx.lineTo(p1X, p1Y);
      ctx.lineTo(p2X, p2Y);
      ctx.strokeStyle = bodyBaseColor;
      ctx.lineWidth = 2.0;
      ctx.lineCap = "round";
      ctx.stroke();

      // Palp accent
      ctx.beginPath();
      ctx.moveTo(p0X, p0Y);
      ctx.lineTo(p1X, p1Y);
      ctx.lineTo(p2X, p2Y);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Palp bulb tip
      ctx.beginPath();
      ctx.arc(p2X, p2Y, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();
    }

    ctx.restore();
  }

  drawAbdomen(ctx, bodyBaseColor, bodyEdgeColor, accentColor, isDark, now) {
    ctx.save();

    const pedicelDist = 13;
    const abX = this.x + Math.cos(this.abdomenAngle) * pedicelDist;
    const abY = this.y + Math.sin(this.abdomenAngle) * pedicelDist;

    ctx.translate(abX, abY);
    ctx.rotate(this.abdomenAngle);

    // Subtle rhythmic breathing
    const breath = 1.0 + Math.sin(now * 0.0035) * 0.025;

    // Narrow Pedicel (Waist connecting head to abdomen)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, 0);
    ctx.strokeStyle = bodyEdgeColor;
    ctx.lineWidth = 4.2;
    ctx.lineCap = "round";
    ctx.stroke();

    // Abdomen body (ovoid teardrop shape)
    const rx = 24 * breath;
    const ry = 17 * breath;

    ctx.beginPath();
    ctx.ellipse(rx * 0.72, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = bodyBaseColor;
    ctx.fill();
    ctx.strokeStyle = bodyEdgeColor;
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Dorsal markings (Geometric arachnid pattern / chevron)
    ctx.beginPath();
    // Longitudinal spine
    ctx.moveTo(6, 0);
    ctx.lineTo(rx * 1.5, 0);
    // Chevrons
    ctx.moveTo(12, -7);
    ctx.lineTo(19, 0);
    ctx.lineTo(12, 7);

    ctx.moveTo(22, -9);
    ctx.lineTo(29, 0);
    ctx.lineTo(22, 9);

    ctx.moveTo(31, -7);
    ctx.lineTo(37, 0);
    ctx.lineTo(31, 7);

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.stroke();

    // Spinnerets at rear
    ctx.beginPath();
    ctx.arc(rx * 1.68, 0, 2.3, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    ctx.restore();
  }

  drawCephalothorax(ctx, bodyBaseColor, bodyEdgeColor, accentColor, isDark) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Carapace outline: broad rounded thorax tapering into head shield
    ctx.beginPath();
    ctx.moveTo(14, 0); // front nose
    ctx.bezierCurveTo(14, -6, 10, -13, 0, -14); // front-left to mid-left
    ctx.bezierCurveTo(-10, -15, -15, -10, -14, 0); // rear-left to rear base
    ctx.bezierCurveTo(-15, 10, -10, 15, 0, 14); // rear base to mid-right
    ctx.bezierCurveTo(10, 13, 14, 6, 14, 0); // mid-right to front nose
    ctx.closePath();

    ctx.fillStyle = bodyBaseColor;
    ctx.fill();
    ctx.strokeStyle = bodyEdgeColor;
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Radiating carapace chitin grooves (fovea lines)
    ctx.beginPath();
    ctx.arc(-2, 0, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = bodyEdgeColor;
    ctx.fill();

    ctx.beginPath();
    for (let s of [-1, 1]) {
      ctx.moveTo(-2, 0);
      ctx.lineTo(5, s * 9);
      ctx.moveTo(-2, 0);
      ctx.lineTo(-2, s * 11);
      ctx.moveTo(-2, 0);
      ctx.lineTo(-8, s * 9);
    }
    ctx.strokeStyle = isDark ? "rgba(0, 196, 255, 0.22)" : "rgba(115, 52, 217, 0.2)";
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // --- 8 Realistic Arachnid Eyes ---
    // 2 Large Anterior Median Eyes (AME) - center front
    const ameX = 10.5;
    const ameSpacing = 2.6;

    // Eye glow halo
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = isDark ? 8 : 4;

    ctx.beginPath();
    ctx.arc(ameX, -ameSpacing, 2.1, 0, Math.PI * 2);
    ctx.arc(ameX, ameSpacing, 2.1, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    // Bright pupil gleam
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(ameX + 0.6, -ameSpacing, 0.9, 0, Math.PI * 2);
    ctx.arc(ameX + 0.6, ameSpacing, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // 2 Anterior Lateral Eyes (ALE) - flanking front corners
    ctx.beginPath();
    ctx.arc(9.5, -6.5, 1.4, 0, Math.PI * 2);
    ctx.arc(9.5, 6.5, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    // 4 Posterior Eyes (PME & PLE) - dorsal arc
    ctx.beginPath();
    // PME
    ctx.arc(5.8, -3.2, 1.2, 0, Math.PI * 2);
    ctx.arc(5.8, 3.2, 1.2, 0, Math.PI * 2);
    // PLE
    ctx.arc(4.2, -7.5, 1.2, 0, Math.PI * 2);
    ctx.arc(4.2, 7.5, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.fill();

    ctx.restore();
  }
}

const SpiderCursor = ({ isDarkTheme = true, isEnabled = true }) => {
  const canvasRef = useRef(null);
  const themeRef = useRef(isDarkTheme);

  useEffect(() => {
    themeRef.current = isDarkTheme;
  }, [isDarkTheme]);

  useEffect(() => {
    if (!isEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    const dpr = window.devicePixelRatio || 1;
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const resizeCanvas = () => {
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    const input = {
      x: cssWidth / 2,
      y: cssHeight / 2,
      isDown: false,
      hasMoved: false,
    };

    // Instantiate realistic spider
    const spider = new RealSpider(cssWidth / 2, cssHeight / 2);

    const handleResize = () => {
      resizeCanvas();
    };

    const handleMouseMove = (e) => {
      input.x = e.clientX;
      input.y = e.clientY;
      input.hasMoved = true;
    };

    const handleMouseDown = () => {
      input.isDown = true;
    };

    const handleMouseUp = () => {
      input.isDown = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches.length > 0) {
        input.x = e.touches[0].clientX;
        input.y = e.touches[0].clientY;
        input.hasMoved = true;
      }
    };

    const handleTouchStart = (e) => {
      input.isDown = true;
      handleTouchMove(e);
    };

    const handleTouchEnd = () => {
      input.isDown = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    let idleTime = 0;

    const renderLoop = (timestamp) => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);

      let targetX = input.x;
      let targetY = input.y;

      // Realistic autonomous wandering before first mouse movement
      if (!input.hasMoved) {
        idleTime += 0.015;
        targetX = cssWidth / 2 + Math.cos(idleTime * 0.7) * 130 + Math.sin(idleTime * 1.5) * 40;
        targetY = cssHeight / 2 + Math.sin(idleTime * 0.9) * 90 + Math.cos(idleTime * 1.2) * 30;
      }

      spider.update(targetX, targetY, input.isDown, timestamp);
      spider.draw(ctx, themeRef.current, timestamp);

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};

export default SpiderCursor;
