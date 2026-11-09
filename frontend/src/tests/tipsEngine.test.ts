import { describe, it, expect } from 'vitest';
import { getRecommendations, type CalculatorAnswers } from '@/lib/tips-engine';

const makeDefaultAnswers = (overrides?: Partial<CalculatorAnswers>): CalculatorAnswers => ({
  region: 'US',
  carFuelType: 'petrol',
  carWeeklyMileage: 100,
  publicTransitWeeklyMileage: 50,
  shortHaulFlights: 2,
  longHaulFlights: 1,
  electricityMonthlyKWh: 250,
  renewableEnergyPct: 20,
  heatingFuelType: 'gas',
  heatingMonthlyFuel: 40,
  residents: 2,
  dietaryPattern: 'medium-meat',
  foodWasteHabits: 'moderate',
  shoppingPatterns: 'average',
  recycleConsistently: false,
  ...overrides,
});

describe('Dynamic Rules Engine - tips-engine.ts tests (15 Tests)', () => {
  it('1. generates recommendations sorted by savings in descending order', () => {
    const answers = makeDefaultAnswers();
    const tips = getRecommendations(answers);
    
    expect(tips.length).toBeGreaterThan(0);
    for (let i = 0; i < tips.length - 1; i++) {
      expect(tips[i].annualSavings).toBeGreaterThanOrEqual(tips[i + 1].annualSavings);
    }
  });

  it('2. does not suggest EV transition for users with no car or electric car', () => {
    const noCarTips = getRecommendations(makeDefaultAnswers({ carFuelType: 'none', carWeeklyMileage: 100 }));
    expect(noCarTips.some(t => t.id === 'tip-ev')).toBe(false);

    const evCarTips = getRecommendations(makeDefaultAnswers({ carFuelType: 'electric', carWeeklyMileage: 100 }));
    expect(evCarTips.some(t => t.id === 'tip-ev')).toBe(false);

    const zeroCommuteTips = getRecommendations(makeDefaultAnswers({ carFuelType: 'petrol', carWeeklyMileage: 0 }));
    expect(zeroCommuteTips.some(t => t.id === 'tip-ev')).toBe(false);
  });

  it('3. correctly calculates EV transition savings based on fuel types and mileage', () => {
    // Petrol car factors: petrol 0.192, EV 0.053 -> diff 0.139. Mileage: 100km/wk * 52wk * 0.139 = 722.8 kg CO2
    const petrolTips = getRecommendations(makeDefaultAnswers({ carFuelType: 'petrol', carWeeklyMileage: 100 }));
    const petrolEvTip = petrolTips.find(t => t.id === 'tip-ev');
    expect(petrolEvTip).toBeDefined();
    expect(petrolEvTip?.annualSavings).toBeCloseTo(722.8, 1);
  });

  it('4. calculates green power savings properly and filters out 100% renewable users', () => {
    const hundredPctTips = getRecommendations(makeDefaultAnswers({ renewableEnergyPct: 100 }));
    expect(hundredPctTips.some(t => t.id === 'tip-renewable')).toBe(false);

    // US grid coefficient = 0.37. kWh = 200, renewable = 0%. residents = 2.
    // Savings = (200 * 12 * 0.37 * 1.0) / 2 = 444 kg CO2
    const customTips = getRecommendations(makeDefaultAnswers({ electricityMonthlyKWh: 200, renewableEnergyPct: 0, residents: 2 }));
    const renewTip = customTips.find(t => t.id === 'tip-renewable');
    expect(renewTip).toBeDefined();
    expect(renewTip?.annualSavings).toBeCloseTo(444, 1);
  });

  it('5. evaluates dietary shift recommendation correctly based on diet profiles', () => {
    // Vegan users should get no diet change tips
    const veganTips = getRecommendations(makeDefaultAnswers({ dietaryPattern: 'vegan' }));
    expect(veganTips.some(t => t.id === 'tip-diet')).toBe(false);

    // Vegetarian user should shift to vegan (vegetarian 1400, vegan 1100 -> diff 300)
    const veggieTips = getRecommendations(makeDefaultAnswers({ dietaryPattern: 'vegetarian' }));
    const veggieShiftTip = veggieTips.find(t => t.id === 'tip-diet');
    expect(veggieShiftTip).toBeDefined();
    expect(veggieShiftTip?.annualSavings).toBe(300);
    expect(veggieShiftTip?.title).toContain('fully Plant-based (Vegan)');
  });

  it('6. calculates recycling savings and filters out consistent recyclers', () => {
    const recyclerTips = getRecommendations(makeDefaultAnswers({ recycleConsistently: true }));
    expect(recyclerTips.some(t => t.id === 'tip-recycling')).toBe(false);

    // average shopper (1500 factor) * 8% = 120 kg CO2
    const normalTips = getRecommendations(makeDefaultAnswers({ recycleConsistently: false, shoppingPatterns: 'average' }));
    const recyclingTip = normalTips.find(t => t.id === 'tip-recycling');
    expect(recyclingTip).toBeDefined();
    expect(recyclingTip?.annualSavings).toBe(120);
  });

  it('7. checks flight optimization recommendation calculations', () => {
    // 0 flights -> no aviation tip
    const zeroFlightsTips = getRecommendations(makeDefaultAnswers({ shortHaulFlights: 0, longHaulFlights: 0 }));
    expect(zeroFlightsTips.some(t => t.id === 'tip-aviation')).toBe(false);

    // 2 short-haul (250 each) + 1 long-haul (1100 each) = 1600 kg. 30% savings = 480 kg CO2.
    const flightTips = getRecommendations(makeDefaultAnswers({ shortHaulFlights: 2, longHaulFlights: 1 }));
    const aviationTip = flightTips.find(t => t.id === 'tip-aviation');
    expect(aviationTip).toBeDefined();
    expect(aviationTip?.annualSavings).toBe(480);
  });

  it('8. evaluates renewable energy savings for EU region (0.25 grid coefficient)', () => {
    // EU grid = 0.25. kWh = 200, renewable = 0%, residents = 2.
    // Savings = (200 * 12 * 0.25 * 1.0) / 2 = 300 kg CO2
    const customTips = getRecommendations(makeDefaultAnswers({ region: 'EU', electricityMonthlyKWh: 200, renewableEnergyPct: 0, residents: 2 }));
    const renewTip = customTips.find(t => t.id === 'tip-renewable');
    expect(renewTip).toBeDefined();
    expect(renewTip?.annualSavings).toBe(300);
  });

  it('9. evaluates renewable energy savings for IN region (0.71 grid coefficient)', () => {
    // IN grid = 0.71. kWh = 200, renewable = 0%, residents = 2.
    // Savings = (200 * 12 * 0.71 * 1.0) / 2 = 852 kg CO2
    const customTips = getRecommendations(makeDefaultAnswers({ region: 'IN', electricityMonthlyKWh: 200, renewableEnergyPct: 0, residents: 2 }));
    const renewTip = customTips.find(t => t.id === 'tip-renewable');
    expect(renewTip).toBeDefined();
    expect(renewTip?.annualSavings).toBe(852);
  });

  it('10. evaluates renewable energy savings for UK region (0.21 grid coefficient)', () => {
    // UK grid = 0.21. kWh = 200, renewable = 0%, residents = 2.
    // Savings = (200 * 12 * 0.21 * 1.0) / 2 = 252 kg CO2
    const customTips = getRecommendations(makeDefaultAnswers({ region: 'UK', electricityMonthlyKWh: 200, renewableEnergyPct: 0, residents: 2 }));
    const renewTip = customTips.find(t => t.id === 'tip-renewable');
    expect(renewTip).toBeDefined();
    expect(renewTip?.annualSavings).toBe(252);
  });

  it('11. calculates food waste mitigation savings for High waste (1.25x)', () => {
    // Diet factor medium-meat = 2800. waste high = 1.25x -> diff 0.25.
    // Savings = 2800 * 0.25 = 700 kg CO2
    const customTips = getRecommendations(makeDefaultAnswers({ dietaryPattern: 'medium-meat', foodWasteHabits: 'high' }));
    const wasteTip = customTips.find(t => t.id === 'tip-foodwaste');
    expect(wasteTip).toBeDefined();
    expect(wasteTip?.annualSavings).toBe(700);
  });

  it('12. calculates home heating shift savings for Gas heating (2.02 factor)', () => {
    // heating monthly = 100, residents = 2, gas factor = 2.02.
    // emissions = (100 * 12 * 2.02) / 2 = 1212 kg. Savings = 50% = 606 kg.
    const customTips = getRecommendations(makeDefaultAnswers({ heatingFuelType: 'gas', heatingMonthlyFuel: 100, residents: 2 }));
    const heatingTip = customTips.find(t => t.id === 'tip-heating');
    expect(heatingTip).toBeDefined();
    expect(heatingTip?.annualSavings).toBe(606);
  });

  it('13. calculates home heating shift savings for Heating Oil (2.52 factor)', () => {
    // heating monthly = 100, residents = 2, oil factor = 2.52.
    // emissions = (100 * 12 * 2.52) / 2 = 1512 kg. Savings = 50% = 756 kg.
    const customTips = getRecommendations(makeDefaultAnswers({ heatingFuelType: 'oil', heatingMonthlyFuel: 100, residents: 2 }));
    const heatingTip = customTips.find(t => t.id === 'tip-heating');
    expect(heatingTip).toBeDefined();
    expect(heatingTip?.annualSavings).toBe(756);
  });

  it('14. calculates home heating shift savings for LPG heating (2.95 factor)', () => {
    // heating monthly = 100, residents = 2, LPG factor = 2.95.
    // emissions = (100 * 12 * 2.95) / 2 = 1770 kg. Savings = 50% = 885 kg.
    const customTips = getRecommendations(makeDefaultAnswers({ heatingFuelType: 'lpg', heatingMonthlyFuel: 100, residents: 2 }));
    const heatingTip = customTips.find(t => t.id === 'tip-heating');
    expect(heatingTip).toBeDefined();
    expect(heatingTip?.annualSavings).toBe(885);
  });

  it('15. filters out heating tips for users with biomass or no heating', () => {
    const customTipsBiomass = getRecommendations(makeDefaultAnswers({ heatingFuelType: 'biomass', heatingMonthlyFuel: 100 }));
    expect(customTipsBiomass.some(t => t.id === 'tip-heating')).toBe(false);

    const customTipsNone = getRecommendations(makeDefaultAnswers({ heatingFuelType: 'none', heatingMonthlyFuel: 100 }));
    expect(customTipsNone.some(t => t.id === 'tip-heating')).toBe(false);
  });
});
