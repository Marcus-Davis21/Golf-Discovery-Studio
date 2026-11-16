import {
  ClubKey,
  DimpleProfileId,
  StrikeQuality,
  FairwayFirmness,
  FlightTrajectoryPoint,
  AerodynamicMetrics,
  FlightShotTelemetry,
} from '../types';

export interface ClubSpec {
  key: ClubKey;
  name: string;
  baseLoft: number; // Realistic dynamic launch angle (deg)
  smashRatio: number;
  spinMult: number;
  standardLengthIn: number; // Men's standard length from Club Length spec
  color: string;
}

export const STITCH_CLUBS: Record<ClubKey, ClubSpec> = {
  driver: { key: 'driver', name: 'Driver', baseLoft: 12.0, smashRatio: 1.48, spinMult: 155, standardLengthIn: 45.5, color: '#00E699' },
  wood3: { key: 'wood3', name: '3-Wood', baseLoft: 14.5, smashRatio: 1.44, spinMult: 190, standardLengthIn: 43.0, color: '#00B8FF' },
  iron7: { key: 'iron7', name: '7-Iron', baseLoft: 17.5, smashRatio: 1.33, spinMult: 330, standardLengthIn: 37.0, color: '#A855F7' },
  wedge: { key: 'wedge', name: 'P-Wedge', baseLoft: 25.5, smashRatio: 1.22, spinMult: 335, standardLengthIn: 35.75, color: '#F59E0B' },
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
    baseDragCd: 0.190,
    liftGain: 1.0,
    description: 'Balanced boundary-layer transition with neutral Magnus lift & penetrating apex.',
  },
  low_drag_392: {
    id: 'low_drag_392',
    name: '392-Dimple Low-Drag Distance',
    shortLabel: '392 Low-Drag',
    dimpleCount: 392,
    baseDragCd: 0.174,
    liftGain: 0.94,
    description: 'Shallow micro-dimple matrix reducing pressure wake drag at high Reynolds numbers.',
  },
  high_lift_318: {
    id: 'high_lift_318',
    name: '318-Dimple High-Lift / Spin',
    shortLabel: '318 High-Lift',
    dimpleCount: 318,
    baseDragCd: 0.206,
    liftGain: 1.11,
    description: 'Deeper dimple wall geometry maximizing Magnus upward lift and steep landing angle.',
  },
  resistance_flow_280: {
    id: 'resistance_flow_280',
    name: '280-Dimple Golf Resistance Flow-Ball',
    shortLabel: '280 Resistance',
    dimpleCount: 280,
    baseDragCd: 0.228,
    liftGain: 1.05,
    description: 'Calibrated for Golf Resistance swing-load diagnostics and boundary turbulence capture.',
  },
};

export interface FlightSimulationInput {
  clubKey: ClubKey;
  clubSpeed: number; // mph
  launchAngle: number; // degrees
  sideSpinAngle: number; // degrees (- draw/hook, + fade/slice)
  attackAngle: number; // degrees
  swingResistanceLbs: number; // 0.0 to 3.0 lbs from Golf Resistance Ball Discovery Studio
  dimpleProfile: DimpleProfileId;
  spinRateOverride?: number; // optional direct RPM override
  strikeQuality?: StrikeQuality; // 'centered' (1.00), 'slightly_off' (0.96), 'toe_heel' (0.90)
  fairwayFirmness?: FairwayFirmness; // 'soft' | 'normal' | 'firm'
  windSpeedMph?: number; // 0 to 35 mph
  windDirectionDeg?: number; // 0 = straight headwind, 90 = R-to-L crosswind, 180 = tailwind, 270 = L-to-R crosswind
  altitudeFt?: number; // 0 to 8000 ft above sea level
  slopeFt?: number; // -60 to +60 ft target elevation (+ uphill, - downhill)
  source?: 'manual' | 'video_ai';
  sourceLabel?: string;
}

/**
 * Pre-Impact Fitting Helper: Golf Club Length Calculator
 * From height (inches) & wrist-to-floor (inches), splits the difference to nearest 0.25 in.
 */
export function calculateClubLengthFit(params: {
  clubKey: ClubKey;
  heightIn: number;
  wristToFloorIn: number;
  standardSet?: 'mens' | 'womens';
}) {
  const { clubKey, heightIn, wristToFloorIn, standardSet = 'mens' } = params;
  const spec = STITCH_CLUBS[clubKey];
  const baseLength = standardSet === 'womens' ? spec.standardLengthIn - 1.0 : spec.standardLengthIn;

  const heightAdj = (height: number): number => {
    if (height < 60) return -1.5;
    if (height < 62) return -1.0;
    if (height < 64) return -0.5;
    if (height < 67) return -0.25;
    if (height < 73) return 0;
    if (height < 74) return 0.25;
    if (height < 76) return 0.5;
    if (height < 78) return 1.0;
    return 1.5;
  };

  const wtfAdj = (wtf: number): number => {
    if (wtf < 27) return -1.5;
    if (wtf < 29) return -1.0;
    if (wtf < 32) return -0.5;
    if (wtf < 34) return -0.25;
    if (wtf <= 37) return 0;
    if (wtf <= 38.5) return 0.25;
    if (wtf <= 40) return 0.5;
    if (wtf <= 41) return 1.0;
    return 1.5;
  };

  const rawAvg = (heightAdj(heightIn) + wtfAdj(wristToFloorIn)) / 2;
  const roundedQuarter = Math.round(rawAvg * 4) / 4;
  return {
    standardLengthIn: baseLength,
    adjustmentIn: roundedQuarter,
    fittedLengthIn: Number((baseLength + roundedQuarter).toFixed(2)),
    heightSuggestionIn: heightAdj(heightIn),
    wtfSuggestionIn: wtfAdj(wristToFloorIn),
  };
}

/**
 * Pre-Impact Club Feel Helper: Golf Swing Weight Calculator (14-inch fulcrum)
 * Turning force (in-oz) = (balancePointIn - 14) * (weightGrams / 28.349523125)
 * Points above A0 = (turningForce - 161) / 1.75
 */
export function calculateSwingWeight(params: {
  weightGrams: number;
  balancePointIn: number;
}) {
  const weightOz = params.weightGrams / 28.349523125;
  const pivotArmIn = params.balancePointIn - 14;
  const turningForceInOz = pivotArmIn * weightOz;
  const pointsAboveA0 = (turningForceInOz - 161) / 1.75;

  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const clampedPts = Math.max(0, Math.min(69.9, pointsAboveA0));
  const letterIdx = Math.min(letters.length - 1, Math.floor(clampedPts / 10));
  const num = clampedPts - letterIdx * 10;

  return {
    weightOz: Number(weightOz.toFixed(2)),
    turningForceInOz: Number(turningForceInOz.toFixed(1)),
    pointsAboveA0: Number(pointsAboveA0.toFixed(1)),
    exactScale: `${letters[letterIdx]}${num.toFixed(1)}`,
    roundedScale: `${letters[letterIdx]}${Math.min(9, Math.round(num))}`,
  };
}

/**
 * Engineering Design MVP 3D Aerodynamic Ball Flight Solver (SI Units, dt = 0.01s)
 *
 * Physics Model:
 * - True USGA ball (m = 0.045926 kg, r = 0.021335 m, g = 9.80665 m/s^2)
 * - ISA Barometric air density rho(altitudeFt) & dynamic viscosity nu(altitudeFt)
 * - Full 3D relative wind vector v_rel = v_ball - v_wind in Drag & Magnus equations
 * - Reynolds-dependent dimple boundary-layer drag Cd(Re, Sp) + Magnus lift Cl(Sp)
 * - Exact target-slope plane intersection y = targetYm (with uphill/downhill support)
 * - Strike quality smash & gear-effect spin + calibrated fairway firmness roll
 */
export function calculateBallFlight(input: FlightSimulationInput): Omit<FlightShotTelemetry, 'id' | 'timestamp'> {
  const club = STITCH_CLUBS[input.clubKey];
  const dimple = DIMPLE_PROFILES[input.dimpleProfile];
  const strikeQuality: StrikeQuality = input.strikeQuality ?? 'centered';
  const fairwayFirmness: FairwayFirmness = input.fairwayFirmness ?? 'normal';
  const windSpeedMph = Math.max(0, Math.min(40, input.windSpeedMph ?? 0));
  const windDirectionDeg = ((input.windDirectionDeg ?? 0) % 360 + 360) % 360;
  const altitudeFt = Math.max(0, Math.min(10000, input.altitudeFt ?? 0));
  const slopeFt = Math.max(-80, Math.min(80, input.slopeFt ?? 0));

  // 1. Golf Resistance Kinetic Sequencing Compensation & Strike Smash Efficiency
  const resLbs = Math.max(0, Math.min(3.0, input.swingResistanceLbs));
  const kineticTransferDeltaMph =
    resLbs === 0
      ? 0
      : resLbs <= 1.5
      ? Number((resLbs * 1.4).toFixed(2))
      : Number((2.1 - (resLbs - 1.5) * 2.6).toFixed(2));

  const strikeFactors: Record<StrikeQuality, { smashMult: number; spinPenaltyRpm: number }> = {
    centered: { smashMult: 1.0, spinPenaltyRpm: 0 },
    slightly_off: { smashMult: 0.96, spinPenaltyRpm: 160 },
    toe_heel: { smashMult: 0.92, spinPenaltyRpm: 320 },
  };
  const strikeSpec = strikeFactors[strikeQuality];

  const effectiveClubSpeed = Math.max(45, input.clubSpeed + kineticTransferDeltaMph);
  const smashBonus = resLbs > 0 ? Math.min(0.025, resLbs * 0.012) : 0;
  const smash = Number(((club.smashRatio + smashBonus) * strikeSpec.smashMult).toFixed(2));
  const ballSpeedMph = effectiveClubSpeed * smash;

  // 2. USGA Golf Ball & ISA Standard Atmospheric Constants (SI)
  const massKg = 0.045926; // 1.62 oz USGA max mass
  const radiusM = 0.021335; // 1.68 in diameter => 21.335 mm radius
  const areaM2 = Math.PI * radiusM * radiusM;
  const altM = altitudeFt * 0.3048;
  // ISA tropospheric density formula (~ -2.9% per 1000 ft => +6.1% carry at 5,280 ft)
  const airDensity = 1.225 * Math.pow(Math.max(0.5, 1 - 2.25577e-5 * altM), 4.25588);
  const kinematicViscosity = 1.48e-5 * (1.225 / airDensity);
  const g = 9.80665;
  const metersPerYard = 0.9144;
  const targetYm = slopeFt * 0.3048;

  // Wind vector: 0° = Straight Headwind (-x), 90° = R-to-L Crosswind (-z), 180° = Tailwind (+x), 270° = L-to-R Crosswind (+z)
  const windMps = windSpeedMph * 0.44704;
  const windRad = (windDirectionDeg * Math.PI) / 180;
  const wx = -windMps * Math.cos(windRad);
  const wz = -windMps * Math.sin(windRad);
  const effectiveWindHeadMph = Number((windSpeedMph * Math.cos(windRad)).toFixed(1));
  const effectiveWindCrossMph = Number((windSpeedMph * Math.sin(windRad)).toFixed(1));

  // 3. Spin Rate & Spin-Axis Tilt
  const computedSpinRpm = Math.max(
    1000,
    Math.round(input.launchAngle * club.spinMult - input.attackAngle * 100 + effectiveClubSpeed * 10)
  );
  const resistanceSpinFactor = resLbs > 0 ? 1 - Math.min(0.08, resLbs * 0.03) : 1;
  const baseSpinRpm =
    typeof input.spinRateOverride === 'number' && input.spinRateOverride >= 800
      ? Math.round(input.spinRateOverride)
      : Math.round(computedSpinRpm * resistanceSpinFactor);
  const spinRateRpm = Math.max(800, baseSpinRpm + strikeSpec.spinPenaltyRpm);

  // Side spin stabilization from Golf Resistance swing-plane guidance
  const stabilizedSideAngle =
    resLbs > 0 ? input.sideSpinAngle * (1 - Math.min(0.22, resLbs * 0.09)) : input.sideSpinAngle;

  // Initial velocity in m/s
  const v0Ms = ballSpeedMph * 0.44704;
  const radLaunch = (input.launchAngle * Math.PI) / 180;
  const axisTiltRad = (stabilizedSideAngle * 2.2 * Math.PI) / 180;

  let vx = v0Ms * Math.cos(radLaunch);
  let vy = v0Ms * Math.sin(radLaunch);
  let vz = 0;

  const omegaTotal = (spinRateRpm * 2 * Math.PI) / 60;
  let omegaBack = omegaTotal * Math.cos(axisTiltRad);
  let omegaSide = omegaTotal * Math.sin(axisTiltRad);

  // Launch aerodynamic telemetry snapshot (using air-relative velocity at t=0)
  const vRel0 = Math.sqrt((vx - wx) * (vx - wx) + vy * vy + (vz - wz) * (vz - wz));
  const reynoldsNumber = Math.round((vRel0 * (radiusM * 2)) / kinematicViscosity);
  const spinFactorSp = Number(((omegaTotal * radiusM) / Math.max(1, vRel0)).toFixed(3));
  const dragScale = dimple.baseDragCd / 0.190;
  const initialCdRe =
    reynoldsNumber > 80000
      ? dimple.baseDragCd + 0.032 * Math.exp(-(reynoldsNumber - 80000) / 60000)
      : (0.220 + 0.14 * Math.exp(-reynoldsNumber / 45000)) * dragScale;
  const launchDragCd = Number((initialCdRe + 0.21 * spinFactorSp).toFixed(3));
  const launchLiftCl = Number(
    Math.min(0.42, (0.048 + 1.06 * spinFactorSp - 0.90 * spinFactorSp * spinFactorSp) * dimple.liftGain).toFixed(3)
  );

  const dynamicPressure0 = 0.5 * airDensity * vRel0 * vRel0;
  const dragForceNewtons = Number((dynamicPressure0 * areaM2 * launchDragCd).toFixed(2));
  const magnusLiftNewtons = Number((dynamicPressure0 * areaM2 * launchLiftCl).toFixed(2));

  // 4. Hundredth-of-a-second (dt = 0.01s) 3D Trajectory Integration
  const dt = 0.01;
  let t = 0;
  let x = 0;
  let y = 0;
  let z = 0;
  let prevX = 0;
  let prevY = 0;
  let prevZ = 0;
  let maxYm = 0;
  let apexTime = 0;
  let passedApex = false;

  const points: FlightTrajectoryPoint[] = [];

  while (t === 0 || !(passedApex && y <= targetYm)) {
    if (Math.round(t * 100) % 2 === 0 || t === 0) {
      points.push({
        x: x / metersPerYard,
        y: y / metersPerYard,
        z: z / metersPerYard,
        t: Number(t.toFixed(2)),
      });
    }

    if (y > maxYm) {
      maxYm = y;
      apexTime = t;
    }

    // Velocity relative to ambient 3D wind
    const vrx = vx - wx;
    const vry = vy;
    const vrz = vz - wz;
    const vRelHoriz = Math.sqrt(vrx * vrx + vrz * vrz);
    const vRelTotal = Math.sqrt(vrx * vrx + vry * vry + vrz * vrz);

    const omegaMag = Math.sqrt(omegaBack * omegaBack + omegaSide * omegaSide);
    const sp = (omegaMag * radiusM) / Math.max(1, vRelTotal);
    const re = (vRelTotal * 2 * radiusM) / kinematicViscosity;

    const cdRe =
      re > 80000
        ? dimple.baseDragCd + 0.032 * Math.exp(-(re - 80000) / 60000)
        : (0.220 + 0.14 * Math.exp(-re / 45000)) * dragScale;
    const cd = cdRe + 0.21 * sp;
    const clTotal = Math.min(
      0.42,
      (0.048 + 1.06 * sp - 0.90 * sp * sp) * dimple.liftGain
    );

    const backFraction = omegaMag > 0 ? omegaBack / omegaMag : 1;
    const sideFraction = omegaMag > 0 ? omegaSide / omegaMag : 0;
    const clLift = clTotal * backFraction;
    const clSide = clTotal * sideFraction;

    const qDragOverM = (0.5 * airDensity * areaM2 * vRelTotal) / massKg;
    // At reduced barometric air density, drag falls linearly with rho while thin-air spin preservation
    // and sub-critical Re boundary scaling retain more Magnus lift (~rho_ratio^0.25), matching +1.16%/1000ft carry gain.
    const liftDensity = 1.225 * Math.pow(airDensity / 1.225, 0.25);
    const qLiftOverM = (0.5 * liftDensity * areaM2 * vRelTotal) / massKg;

    // 3D aerodynamic acceleration using air-relative velocity vector v_rel
    const horizUnitX = vrx / Math.max(1, vRelHoriz);
    const horizUnitZ = vrz / Math.max(1, vRelHoriz);

    const ax = -qDragOverM * cd * vrx - qLiftOverM * (clLift * vry * horizUnitX + clSide * vrz * 0.15);
    const ay = -g - qDragOverM * cd * vry + qLiftOverM * clLift * vRelHoriz;
    const az = -qDragOverM * cd * vrz + qLiftOverM * clSide * vrx;

    prevX = x;
    prevY = y;
    prevZ = z;

    x += vx * dt;
    y += vy * dt;
    z += vz * dt;

    vx += ax * dt;
    vy += ay * dt;
    vz += az * dt;

    if (vy < 0) {
      passedApex = true;
    }

    // Exponential spin decay scales with air density (~2% per second at sea level)
    const decay = Math.exp(-0.02 * (airDensity / 1.225) * dt);
    omegaBack *= decay;
    omegaSide *= decay;

    t += dt;
    if (t > 15) break;
    // Safety if uphill target is higher than ball apex (fall back to ground at apex decay)
    if (passedApex && targetYm > 0 && maxYm < targetYm && y <= 0) break;
  }

  // Exact target plane (y = targetYm or y = 0 fallback) linear landing interpolation
  const hitPlaneY = passedApex && maxYm < targetYm ? 0 : targetYm;
  const denom = prevY - y;
  const frac = Math.abs(denom) > 1e-6 ? Math.max(0, Math.min(1, (prevY - hitPlaneY) / denom)) : 1;
  const carryM = prevX + frac * (x - prevX);
  const lateralM = prevZ + frac * (z - prevZ);
  const flightTimeS = t - dt + frac * dt;

  const carryYds = Math.max(0, carryM / metersPerYard);
  const apexYds = maxYm / metersPerYard;
  const lateralYds = lateralM / metersPerYard;

  points.push({
    x: carryYds,
    y: hitPlaneY / metersPerYard,
    z: lateralYds,
    t: Number(flightTimeS.toFixed(2)),
  });

  const landingAngleDeg = Number(
    Math.min(75, Math.max(15, (Math.atan2(Math.abs(vy), Math.max(0.5, vx)) * 180) / Math.PI)).toFixed(1)
  );

  // Calibrated Physics-Based Fairway Roll:
  // Combines horizontal groundspeed momentum & landing angle so ~93 mph centered driver on Normal turf
  // produces ~17 yds roll (~8%), steeper irons stop in 3-6 yds, and steep wedges check in 1-2 yds.
  const firmnessMult: Record<FairwayFirmness, number> = {
    soft: 0.55,
    normal: 1.0,
    firm: 1.45,
  };
  const cosLand = Math.cos((landingAngleDeg * Math.PI) / 180);
  const rawRollYds =
    (carryYds * 0.115 * cosLand * cosLand + Math.max(0, vx) * 0.08) *
    Math.max(0.35, 1 - Math.max(0, spinRateRpm - 2500) / 11000) *
    firmnessMult[fairwayFirmness];
  const rollYds = Math.max(0.8, Math.min(36, rawRollYds));
  const totalYds = carryYds + rollYds;

  let flightShape = 'Straight';
  if (Math.abs(lateralYds) > 4 || Math.abs(stabilizedSideAngle) > 1.5) {
    if (stabilizedSideAngle < -1.5 || lateralYds < -6) {
      flightShape = stabilizedSideAngle < -5 || lateralYds < -16 ? 'Heavy Hook' : 'Draw / Pull';
    } else if (stabilizedSideAngle > 1.5 || lateralYds > 6) {
      flightShape = stabilizedSideAngle > 5 || lateralYds > 16 ? 'Heavy Slice' : 'Fade / Drift';
    }
  }

  const dimpleEfficiencyGainPct = Number(((0.190 - dimple.baseDragCd) * 160 + (dimple.liftGain - 1) * 18).toFixed(1));

  const aerodynamics: AerodynamicMetrics = {
    dragCoeffCd: launchDragCd,
    liftCoeffCl: launchLiftCl,
    reynoldsNumber,
    spinFactorSp,
    magnusLiftNewtons,
    dragForceNewtons,
    landingAngleDeg,
    resistanceDeltaMph: kineticTransferDeltaMph,
    dimpleEfficiencyGainPct,
    airDensityKgM3: Number(airDensity.toFixed(3)),
    effectiveWindHeadMph,
    effectiveWindCrossMph,
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
    strikeQuality,
    fairwayFirmness,
    windSpeedMph,
    windDirectionDeg,
    altitudeFt,
    slopeFt,
    carry: Number(carryYds.toFixed(1)),
    total: Number(totalYds.toFixed(1)),
    apex: Number(apexYds.toFixed(1)),
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
