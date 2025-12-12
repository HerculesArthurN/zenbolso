import { RRule } from 'rrule';
import { v4 as uuidv4 } from 'uuid';
import { Transaction } from '../types';
import { getRecurringConfigs, postTransaction, updateRecurringConfigApi } from './api';

export const processRecurringTransactions = async (): Promise<{ createdCount: number }> => {
  const configs = await getRecurringConfigs();
  let createdCount = 0;
  const now = new Date();
  
  // Set to end of day to include transactions due today
  now.setHours(23, 59, 59, 999);

  // Process serially to ensure data integrity
  for (const config of configs) {
    if (!config.active) continue;

    // Parse the RRule
    let rule;
    try {
        rule = RRule.fromString(config.rruleString);
    } catch (e) {
        console.error("Invalid RRule", config.rruleString);
        continue;
    }

    // Determine start date for check: 
    // It should be the day after the last generated date
    const lastGenerated = new Date(config.lastGeneratedDate);
    // Add one day to avoid regenerating the same day
    const startDate = new Date(lastGenerated);
    startDate.setDate(startDate.getDate() + 1);
    
    // Get all occurrences between last generated + 1 day AND now
    const dueDates = rule.between(startDate, now, true); // true = inclusive

    if (dueDates.length > 0) {
        for (const date of dueDates) {
            const transaction: Transaction = {
                id: uuidv4(),
                type: config.type,
                value: config.value,
                category: config.category,
                description: config.description ? `${config.description} (Recorrente)` : 'Transação Recorrente',
                tags: config.tags,
                date: date.toISOString().split('T')[0]
            };
            
            // Generate transaction
            await postTransaction(transaction);
            createdCount++;
        }

        // Update config with new last generated date (the last one in the list)
        const lastDateProcessed = dueDates[dueDates.length - 1];
        const nextDate = rule.after(lastDateProcessed);
        
        await updateRecurringConfigApi({
            ...config,
            lastGeneratedDate: lastDateProcessed.toISOString().split('T')[0],
            nextDueDate: nextDate ? nextDate.toISOString().split('T')[0] : ''
        });
    }
  }

  return { createdCount };
};

export const generateRRule = (frequency: 'weekly' | 'monthly' | 'yearly', date: Date): string => {
    const options: any = {
        freq: frequency === 'weekly' ? RRule.WEEKLY : frequency === 'monthly' ? RRule.MONTHLY : RRule.YEARLY,
        dtstart: date,
    };
    
    const rule = new RRule(options);
    return rule.toString();
};