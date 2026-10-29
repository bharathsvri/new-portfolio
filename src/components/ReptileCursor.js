import React, { useEffect, useRef } from "react";

class Segment {
  constructor(parent, size, angle, range, stiffness) {
    this.isSegment = true;
    this.parent = parent;
    if (typeof parent.children === "object" && parent.children) {
      parent.children.push(this);
    }
    this.children = [];
    this.size = size;
    this.relAngle = angle;
    this.defAngle = angle;
    this.absAngle = parent.absAngle + angle;
    this.range = range;
    this.stiffness = stiffness;
    this.x = parent.x + Math.cos(this.absAngle) * this.size;
    this.y = parent.y + Math.sin(this.absAngle) * this.size;
    this.updateRelative(false, true);
  }

  updateRelative(iter, flex) {
    this.relAngle =
      this.relAngle -
      2 *
        Math.PI *
        Math.floor((this.relAngle - this.defAngle) / (2 * Math.PI) + 0.5);
    if (flex) {
      this.relAngle = Math.min(
        this.defAngle + this.range / 2,
        Math.max(
          this.defAngle - this.range / 2,
          (this.relAngle - this.defAngle) / this.stiffness + this.defAngle
        )
      );
    }
    this.absAngle = this.parent.absAngle + this.relAngle;
    this.x = this.parent.x + Math.cos(this.absAngle) * this.size;
    this.y = this.parent.y + Math.sin(this.absAngle) * this.size;
    if (iter) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].updateRelative(iter, flex);
      }
    }
  }

  draw(ctx, iter) {
    ctx.beginPath();
    ctx.moveTo(this.parent.x, this.parent.y);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    if (iter) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].draw(ctx, true);
      }
    }
  }

  follow(iter) {
    const x = this.parent.x;
    const y = this.parent.y;
    const dist = Math.hypot(this.x - x, this.y - y);
    if (dist > 0.0001) {
      this.x = x + (this.size * (this.x - x)) / dist;
      this.y = y + (this.size * (this.y - y)) / dist;
      this.absAngle = Math.atan2(this.y - y, this.x - x);
      this.relAngle = this.absAngle - this.parent.absAngle;
      this.updateRelative(false, true);
    }
    if (iter) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].follow(true);
      }
    }
  }
}

class LimbSystem {
  constructor(end, length, speed, creature) {
    this.end = end;
    this.length = Math.max(1, length);
    this.creature = creature;
    this.speed = speed;
    creature.systems.push(this);
    this.nodes = [];
    let node = end;
    for (let i = 0; i < length; i++) {
      this.nodes.unshift(node);
      node = node.parent;
      if (!node.isSegment) {
        this.length = i + 1;
        break;
      }
    }
    this.hip = this.nodes[0].parent;
  }

  moveTo(targetX, targetY) {
    this.nodes[0].updateRelative(true, true);
    let x = targetX;
    let y = targetY;
    const dist = Math.hypot(x - this.end.x, y - this.end.y);
    let len = Math.max(0, dist - this.speed);
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const node = this.nodes[i];
      const ang = Math.atan2(node.y - y, node.x - x);
      node.x = x + len * Math.cos(ang);
      node.y = y + len * Math.sin(ang);
      x = node.x;
      y = node.y;
      len = node.size;
    }
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];
      node.absAngle = Math.atan2(
        node.y - node.parent.y,
        node.x - node.parent.x
      );
      node.relAngle = node.absAngle - node.parent.absAngle;
      for (let ii = 0; ii < node.children.length; ii++) {
        const childNode = node.children[ii];
        if (!this.nodes.includes(childNode)) {
          childNode.updateRelative(true, false);
        }
      }
    }
  }

  update(targetX, targetY) {
    this.moveTo(targetX, targetY);
  }
}

class LegSystem extends LimbSystem {
  constructor(end, length, speed, creature) {
    super(end, length, speed, creature);
    this.goalX = end.x;
    this.goalY = end.y;
    this.step = 0;
    this.forwardness = 0;

    this.reach =
      0.9 * Math.hypot(this.end.x - this.hip.x, this.end.y - this.hip.y);
    let relAngle =
      this.creature.absAngle -
      Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x);
    relAngle -= 2 * Math.PI * Math.floor(relAngle / (2 * Math.PI) + 0.5);
    this.swing = -relAngle + (relAngle < 0 ? 1 : -1) * (Math.PI / 2);
    this.swingOffset = this.creature.absAngle - this.hip.absAngle;
  }

  update(targetX, targetY) {
    this.moveTo(this.goalX, this.goalY);
    if (this.step === 0) {
      const dist = Math.hypot(this.end.x - this.goalX, this.end.y - this.goalY);
      if (dist > 1) {
        this.step = 1;
        this.goalX =
          this.hip.x +
          this.reach *
            Math.cos(this.swing + this.hip.absAngle + this.swingOffset) +
          (2 * Math.random() - 1) * (this.reach / 2);
        this.goalY =
          this.hip.y +
          this.reach *
            Math.sin(this.swing + this.hip.absAngle + this.swingOffset) +
          (2 * Math.random() - 1) * (this.reach / 2);
      }
    } else if (this.step === 1) {
      const theta =
        Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x) -
        this.hip.absAngle;
      const dist = Math.hypot(this.end.x - this.hip.x, this.end.y - this.hip.y);
      const forwardness2 = dist * Math.cos(theta);
      const dF = this.forwardness - forwardness2;
      this.forwardness = forwardness2;
      if (dF * dF < 1) {
        this.step = 0;
        this.goalX = this.hip.x + (this.end.x - this.hip.x);
        this.goalY = this.hip.y + (this.end.y - this.hip.y);
      }
    }
  }
}

class Creature {
  constructor(
    x,
    y,
    angle,
    fAccel,
    fFric,
    fRes,
    fThresh,
    rAccel,
    rFric,
    rRes,
    rThresh
  ) {
    this.x = x;
    this.y = y;
    this.absAngle = angle;
    this.fSpeed = 0;
    this.fAccel = fAccel;
    this.fFric = fFric;
    this.fRes = fRes;
    this.fThresh = fThresh;
    this.rSpeed = 0;
    this.rAccel = rAccel;
    this.rFric = rFric;
    this.rRes = rRes;
    this.rThresh = rThresh;
    this.children = [];
    this.systems = [];
  }

  follow(targetX, targetY, isMouseDown, ctx) {
    const dist = Math.hypot(this.x - targetX, this.y - targetY);
    const angle = Math.atan2(targetY - this.y, targetX - this.x);

    let accel = this.fAccel * (isMouseDown ? 1.4 : 1.0);
    if (this.systems.length > 0) {
      let sum = 0;
      for (let i = 0; i < this.systems.length; i++) {
        sum += this.systems[i].step === 0 ? 1 : 0;
      }
      accel *= sum / this.systems.length;
    }

    this.fSpeed += accel * (dist > this.fThresh ? 1 : 0);
    this.fSpeed *= 1 - this.fRes;
    this.speed = Math.max(0, this.fSpeed - this.fFric);

    let dif = this.absAngle - angle;
    dif -= 2 * Math.PI * Math.floor(dif / (2 * Math.PI) + 0.5);
    if (Math.abs(dif) > this.rThresh && dist > this.fThresh) {
      this.rSpeed -= this.rAccel * (dif > 0 ? 1 : -1);
    }
    this.rSpeed *= 1 - this.rRes;
    if (Math.abs(this.rSpeed) > this.rFric) {
      this.rSpeed -= this.rFric * (this.rSpeed > 0 ? 1 : -1);
    } else {
      this.rSpeed = 0;
    }

    this.absAngle += this.rSpeed;
    this.absAngle -=
      2 * Math.PI * Math.floor(this.absAngle / (2 * Math.PI) + 0.5);
    this.x += this.speed * Math.cos(this.absAngle);
    this.y += this.speed * Math.sin(this.absAngle);
    this.absAngle += Math.PI;

    for (let i = 0; i < this.children.length; i++) {
      this.children[i].follow(true);
    }
    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].update(targetX, targetY);
    }
    this.absAngle -= Math.PI;

    this.draw(ctx, true);
  }

  draw(ctx, iter) {
    const r = 4.5;
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      r,
      Math.PI / 4 + this.absAngle,
      (7 * Math.PI) / 4 + this.absAngle
    );
    ctx.moveTo(
      this.x + r * Math.cos((7 * Math.PI) / 4 + this.absAngle),
      this.y + r * Math.sin((7 * Math.PI) / 4 + this.absAngle)
    );
    ctx.lineTo(
      this.x + r * Math.cos(this.absAngle) * Math.SQRT2,
      this.y + r * Math.sin(this.absAngle) * Math.SQRT2
    );
    ctx.lineTo(
      this.x + r * Math.cos(Math.PI / 4 + this.absAngle),
      this.y + r * Math.sin(Math.PI / 4 + this.absAngle)
    );
    ctx.stroke();

    // Eyes
    const eyeDist = r * 0.9;
    const eye1X = this.x + eyeDist * Math.cos(this.absAngle + 0.7);
    const eye1Y = this.y + eyeDist * Math.sin(this.absAngle + 0.7);
    const eye2X = this.x + eyeDist * Math.cos(this.absAngle - 0.7);
    const eye2Y = this.y + eyeDist * Math.sin(this.absAngle - 0.7);
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, 1.3, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, 1.3, 0, Math.PI * 2);
    ctx.fill();

    if (iter) {
      for (let i = 0; i < this.children.length; i++) {
        this.children[i].draw(ctx, true);
      }
    }
  }
}

function createLizard(startX, startY, size = 2.4, legs = 3, tail = 22) {
  const s = size;
  const critter = new Creature(
    startX,
    startY,
    0,
    s * 10,
    s * 2,
    0.5,
    16,
    0.5,
    0.085,
    0.5,
    0.3
  );

  let spinal = critter;

  // Neck
  for (let i = 0; i < 6; i++) {
    spinal = new Segment(spinal, s * 4, 0, (Math.PI * 2) / 3, 1.1);
    for (let ii = -1; ii <= 1; ii += 2) {
      let node = new Segment(spinal, s * 3, ii, 0.1, 2);
      for (let iii = 0; iii < 3; iii++) {
        node = new Segment(node, s * 0.1, -ii * 0.1, 0.1, 2);
      }
    }
  }

  // Torso and legs
  for (let i = 0; i < legs; i++) {
    if (i > 0) {
      // Vertebrae and ribs
      for (let ii = 0; ii < 6; ii++) {
        spinal = new Segment(spinal, s * 4, 0, 1.571, 1.5);
        for (let iii = -1; iii <= 1; iii += 2) {
          let node = new Segment(spinal, s * 3, iii * 1.571, 0.1, 1.5);
          for (let iv = 0; iv < 3; iv++) {
            node = new Segment(node, s * 3, -iii * 0.3, 0.1, 2);
          }
        }
      }
    }
    // Legs and shoulders
    for (let ii = -1; ii <= 1; ii += 2) {
      let node = new Segment(spinal, s * 12, ii * 0.785, 0, 8); // Hip
      node = new Segment(node, s * 16, -ii * 0.785, 6.28, 1); // Humerus
      node = new Segment(node, s * 16, ii * 1.571, 3.1415, 2); // Forearm
      for (let iii = 0; iii < 4; iii++) {
        // Fingers
        new Segment(node, s * 4, (iii / 3 - 0.5) * 1.571, 0.1, 4);
      }
      new LegSystem(node, 3, s * 12, critter);
    }
  }

  // Tail
  for (let i = 0; i < tail; i++) {
    spinal = new Segment(spinal, s * 4, 0, (Math.PI * 2) / 3, 1.1);
    for (let ii = -1; ii <= 1; ii += 2) {
      let node = new Segment(spinal, s * 3, ii, 0.1, 2);
      for (let iii = 0; iii < 3; iii++) {
        node = new Segment(
          node,
          (s * 3 * (tail - i)) / tail,
          -ii * 0.1,
          0.1,
          2
        );
      }
    }
  }

  return critter;
}

const ReptileCursor = ({ isDarkTheme = true, isEnabled = true }) => {
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
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const input = {
      x: width / 2,
      y: height / 2,
      isDown: false,
      hasMoved: false,
    };

    const critter = createLizard(width / 2, height / 2, 2.3, 3, 24);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
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

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    let idleAngle = 0;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Stylized glowing reptile lines
      const dark = themeRef.current;
      ctx.strokeStyle = dark ? "#00C4FF" : "#7334D9";
      ctx.fillStyle = dark ? "#00C4FF" : "#7334D9";
      ctx.lineWidth = dark ? 1.6 : 1.8;
      ctx.shadowBlur = dark ? 8 : 4;
      ctx.shadowColor = dark ? "rgba(0, 196, 255, 0.75)" : "rgba(115, 52, 209, 0.4)";

      let targetX = input.x;
      let targetY = input.y;

      // Gentle idling wander before user moves cursor
      if (!input.hasMoved) {
        idleAngle += 0.02;
        targetX = width / 2 + Math.cos(idleAngle) * 90;
        targetY = height / 2 + Math.sin(idleAngle * 0.7) * 50;
      }

      critter.follow(targetX, targetY, input.isDown, ctx);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("touchmove", handleTouchMove);
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

export default ReptileCursor;
