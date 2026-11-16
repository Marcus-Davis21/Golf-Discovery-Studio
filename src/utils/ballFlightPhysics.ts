import {
  ClubKey,
  DimpleProfileId,
  FlightTrajectoryPoint,
  AerodynamicMetrics,
  FlightShotTelemetry,
} from '../types';

export interface ClubSpec {
  key: ClubKey;
  name: string;
  baseLoft: number;
  smashRatio: number;
  spinMult: number;
  color: string;
}

export const STITCH_CLUBS: Record<ClubKey, ClubSpec> = {
  driver: { key: 'driver', name: 'Driver', baseLoft: 10.5, smashRatio: 1.48, spinMult: 200, color: '#00E699' },
  wood3: { key: 'wood3', name: '3-Wood', baseLoft: 15.0, smashRatio: 1.44, spinMult: 260, color: '#00B8FF' },
  iron7: { key: 'iron7', name: '7-Iron', baseLoft: 32.0, smashRatio: 1.33, spinMult: 450, color: '#A855F7' },
  wedge: { key: 'wedge', name: 'P-Wedge', baseLoft: 45.0, smashRatio: 1.22, spinMult: 650, color: '#F59E0B' },
};

export interface DimpleProfileSpec {
  id: DimpleProfileId;
  name: string;
  shortLabel: string;
  dimpleCount: number;
  baseDragCd: number;
  liftGain: number;
  description: string;
}

export const DIMPLE_PROFILES: Record<DimpleProfileId, DimpleProfileSpec> = {
  tour_332: {
    id: 'tour_332',
    name: '332-Dimple Tour Icosahedral',
    shortLabel: '332 Tour',
    dimpleCount: 332,
    baseDragCd: 0.215,
    liftGain: 1.0,
    description: 'Balanced boundary-layer transition with neutral Magnus lift & penetrating apex.',
  },
  low_drag_392: {
    id: 'low_drag_392',
    name: '392-Dimple Low-Drag Distance',
    shortLabel: '392 Low-Drag',
    dimpleCount: 392,
    baseDragCd: 0.194,
    liftGain: 0.93,
    description: 'Shallow micro-dimple matrix reducing pressure wake drag at high Reynolds numbers.',
  },
  high_lift_318: {
    id: 'high_lift_318',
    name: '318-Dimple High-Lift / Spin',
    shortLabel: '318 High-Lift',
    dimpleCount: 318,
    baseDragCd: 0.232,
    liftGain: 1.13,
    description: 'Deeper dimple wall geometry maximizing Magnus upward lift and steep landing angle.',
  },
  resistance_flow_280: {
    id: 'resistance_flow_280',
    name: '280-Dimple Golf Resistance Flow-Ball',
    shortLabel: '280 Resistance',
    dimpleCount: 280,
    baseDragCd: 0.258,
    liftGain: 1.06,
    description: 'Calibrated for Golf Resistance swing-load diagnostics and boundary turbulence capture.',
  },
};

export interface FlightSimulationInput {
  clubKey: ClubKey;
  clubSpeed: number; // mph
  launchAngle: number; // degrees
  sideSpinAngle: number; // degrees (- draw, + fade)
  attackAngle: number; // degrees
  swingResistanceLbs: number; // 0.0 to 3.0 lbs from Golf Resistance Ball Discovery Studio
  dimpleProfile: DimpleProfileId;
  source?: 'manual' | 'video_ai';
  sourceLabel?: string;
}

/**
 * Engineering Design MVP Ball Flight & Aerodynamics Solver
 * Merges Google Stitch Mobile Flight Simulator trajectory integration with
 * Golf Resistance swing-load compensation and dimple boundary-layer aerodynamics.
 */
export function calculateBallFlight(input: FlightSimulationInput): Omit<FlightShotTelemetry, 'id' | 'timestamp'> {
  const club = STITCH_CLUBS[input.clubKey];
  const dimple = DIMPLE_PROFILES[input.dimpleProfile];

  // Golf Resistance Kinetic Sequencing Compensation:
  // Controlled resistance (0.5 - 1.5 lbs) improves kinematic lag & smash efficiency slightly
  // while heavy resistance (>2.0 lbs) imposes velocity drag during active weighted swings.
  const resLbs = Math.max(0, Math.min(3.0, input.swingResistanceLbs));
  const kineticTransferDeltaMph =
    resLbs === 0
      ? 0
      : resLbs <= 1.5
      ? Number((resLbs * 1.4).toFixed(2))
      : Number((2.1 - (resLbs - 1.5) * 2.6).toFixed(2));

  const effectiveClubSpeed = Math.max(45, input.clubSpeed + kineticTransferDeltaMph);
  const smashBonus = resLbs > 0 ? Math.min(0.025, resLbs * 0.012) : 0;
  const smash = Number((club.smashRatio + smashBonus).toFixed(2));
  const ballSpeedMph = effectiveClubSpeed * smash;

  // Convert to SI units for true Reynolds & Magnus aerodynamic telemetry
  const ballSpeedMs = ballSpeedMph * 0.44704;
  const ballRadiusM = 0.021335; // USGA 1.68 in diameter => 21.335 mm radius
  const ballAreaM2 = Math.PI * ballRadiusM * ballRadiusM; // ~0.00143 m^2
  const airDensity = 1.225; // kg/m^3 sea level
  const kinematicViscosity = 1.48e-5; // m^2/s

  // Spin Rate calculation (from Stitch base + dimple/resistance coupling)
  const rawSpinRpm = Math.max(
    1000,
    Math.round(input.launchAngle * club.spinMult - input.attackAngle * 100 + effectiveClubSpeed * 10)
  );
  // Resistance stabilization slightly trims excessive spin dispersion
  const resistanceSpinFactor = resLbs > 0 ? 1 - Math.min(0.08, resLbs * 0.03) : 1;
  const spinRateRpm = Math.round(rawSpinRpm * resistanceSpinFactor);
  const omegaRadSec = (spinRateRpm * 2 * Math.PI) / 60;

  // Reynolds Number & Spin Parameter (Sp = omega * r / v)
  const reynoldsNumber = Math.round((ballSpeedMs * (ballRadiusM * 2)) / kinematicViscosity);
  const spinFactorSp = Number(((omegaRadSec * ballRadiusM) / Math.max(1, ballSpeedMs)).toFixed(3));

  // Aerodynamic Coefficients (Dimple Boundary Layer Model)
  // Above Re ~ 70,000 dimples trigger turbulent boundary layer drag crisis
  const reCrisisFactor = reynoldsNumber > 80000 ? 1.0 : 1.18;
  const dragCoeffCd = Number(
    (dimple.baseDragCd * reCrisisFactor + spinFactorSp * 0.19).toFixed(3)
  );
  const liftCoeffCl = Number(
    (Math.min(0.42, (0.09 + spinFactorSp * 0.92) * dimple.liftGain)).toFixed(3)
  );

  // Instantaneous Launch Forces (Newtons)
  const dynamicPressure = 0.5 * airDensity * ballSpeedMs * ballSpeedMs;
  const dragForceNewtons = Number((dynamicPressure * ballAreaM2 * dragCoeffCd).toFixed(2));
  const magnusLiftNewtons = Number((dynamicPressure * ballAreaM2 * liftCoeffCl).toFixed(2));

  // Trajectory numerical integration (preserving Stitch coordinate scaling + dimple Cd/Cl deltas)
  const radAngle = (input.launchAngle * Math.PI) / 180;
  // Side spin stabilization from Golf Resistance swing-plane guidance
  const stabilizedSideAngle =
    resLbs > 0 ? input.sideSpinAngle * (1 - Math.min(0.22, resLbs * 0.09)) : input.sideSpinAngle;

  const v0 = ballSpeedMph * 0.85;
  let vx = v0 * Math.cos(radAngle);
  let vy = v0 * Math.sin(radAngle);
  let vz = stabilizedSideAngle * 2.2;
  const vz0 = vz;

  const dt = 0.05;
  let t = 0;
  let x = 0;
  let y = 0;
  let z = 0;

  const g = 9.81 * 0.4;
  // Coupled Stitch drag/lift scaled cleanly by Dimple Cd & Cl ratios against Tour 332 baseline
  const dragRatio = dragCoeffCd / 0.245;
  const liftRatio = liftCoeffCl / 0.225;
  const drag = 0.0018 * dragRatio;
  const lift = (0.0012 + spinRateRpm / 1500000) * liftRatio;

  const points: FlightTrajectoryPoint[] = [];
  let apexY = 0;
  let apexTime = 0;
  let prevVx = vx;
  let prevVy = vy;

  while (y >= 0 || t === 0) {
    points.push({ x, y, z, t });

    if (y > apexY) {
      apexY = y;
      apexTime = t;
    }

    prevVx = vx;
    prevVy = vy;

    const vTotal = Math.sqrt(vx * vx + vy * vy + vz * vz);
    const ax = -drag * vTotal * vx;
    const ay = -g - drag * vTotal * vy + lift * vx * vx;
    const az = vz0 * 0.08 + stabilizedSideAngle * 0.05;

    x += vx * dt;
    y += vy * dt;
    z += vz * dt;

    vx += ax * dt;
    vy += ay * dt;
    vz += az * dt;

    t += dt;
    if (t > 15) break;
  }

  const landingAngleDeg = Number(
    Math.min(72, Math.max(18, (Math.atan2(Math.abs(prevVy), Math.max(1, prevVx)) * 180) / Math.PI)).toFixed(1)
  );

  const carryYds = Math.max(0, x);
  const rollYds = Math.max(2, (300 - spinRateRpm / 20) * 0.05);
  const totalYds = carryYds + Math.max(0, rollYds);
  const lateralYds = z;

  let flightShape = 'Straight';
  if (stabilizedSideAngle < -1.5) flightShape = stabilizedSideAngle < -5 ? 'Heavy Hook' : 'Tight Draw';
  else if (stabilizedSideAngle > 1.5) flightShape = stabilizedSideAngle > 5 ? 'Heavy Slice' : 'Fade';

  // Efficiency delta vs baseline Tour 332 / 0 lb load
  const dimpleEfficiencyGainPct = Number(((0.215 - dimple.baseDragCd) * 140 + (dimple.liftGain - 1) * 18).toFixed(1));

  const aerodynamics: AerodynamicMetrics = {
    dragCoeffCd,
    liftCoeffCl,
    reynoldsNumber,
    spinFactorSp,
    magnusLiftNewtons,
    dragForceNewtons,
    landingAngleDeg,
    resistanceDeltaMph: kineticTransferDeltaMph,
    dimpleEfficiencyGainPct,
  };

  return {
    clubKey: input.clubKey,
    clubName: club.name,
    clubSpeed: Number(effectiveClubSpeed.toFixed(1)),
    ballSpeed: Number(ballSpeedMph.toFixed(1)),
    smash,
    launchAngle: input.launchAngle,
    spinRate: spinRateRpm,
    sideSpinAngle: Number(stabilizedSideAngle.toFixed(1)),
    attackAngle: input.attackAngle,
    swingResistanceLbs: resLbs,
    dimpleProfile: input.dimpleProfile,
    carry: Number(carryYds.toFixed(1)),
    total: Number(totalYds.toFixed(1)),
    apex: Number(apexY.toFixed(1)),
    apexTime: Number(apexTime.toFixed(1)),
    lateralYds: Number(lateralYds.toFixed(1)),
    flightShape,
    source: input.source || 'manual',
    sourceLabel: input.sourceLabel,
    aerodynamics,
    points,
    color: club.color,
  };
}
