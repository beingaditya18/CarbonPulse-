import type { CarbonLog, CategoryType } from '@/types/store';

/**
 * Generates realistic 30-day historical logs to populate carbon trackers on startup.
 * @returns {CarbonLog[]} An array of generated CarbonLogs spread over the last 30 days.
 */
export const generateSeedLogs = (): CarbonLog[] => {
  const seed: CarbonLog[] = [];
  const categories: CategoryType[] = ['transportation', 'food', 'electricity', 'shopping', 'waste'];
  const descriptions: Record<CategoryType, string[]> = {
    transportation: ['Commute to work (Car)', 'Fuel station fill-up', 'Uber ride', 'Bus transit ride'],
    food: ['Weekly grocery store restock', 'Dinner out at restaurant', 'Meat heavy meals', 'Daily meal intake'],
    electricity: ['Monthly utility baseline', 'AC cooling usage', 'Space heater logs', 'Appliance usage log'],
    shopping: ['Amazon order shipment', 'Department store clothing purchase', 'Tech device order', 'Home goods purchase'],
    waste: ['Weekly landfill garbage trash', 'Recycling baseline log', 'Organic food waste bin', 'Landfill bin load'],
  };
  
  const now = new Date();
  
  // Create logs spread across the last 30 days
  for (let i = 30; i >= 1; i--) {
    const logDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    
    // Log 1-2 items per day
    const numLogs = (i % 3 === 0) ? 2 : 1;
    for (let j = 0; j < numLogs; j++) {
      const category = categories[(i + j) % categories.length];
      const descList = descriptions[category];
      const description = descList[(i * 3 + j) % descList.length];
      
      // Typical emission values
      let amount = 5;
      if (category === 'transportation') amount = Math.round((8 + (i % 12) * 3.5) * 10) / 10;
      else if (category === 'electricity') amount = Math.round((15 + (i % 6) * 5) * 10) / 10;
      else if (category === 'food') amount = Math.round((3 + (i % 5) * 1.5) * 10) / 10;
      else if (category === 'shopping') amount = Math.round((10 + (i % 8) * 8.5) * 10) / 10;
      else if (category === 'waste') amount = Math.round((1 + (i % 4) * 0.8) * 10) / 10;
      
      seed.push({
        id: `seed-${i}-${j}`,
        category,
        emission_amount: amount,
        source: 'manual',
        description,
        logged_date: logDate.toISOString(),
      });
    }
  }
  return seed;
};
